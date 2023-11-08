'use strict'

const { randomUUID } = require('node:crypto')
const { major: semverMajor } = require('semver')
const { RefResolver } = require('json-schema-ref-resolver')
const { compareObjectKeys } = require('./lib/utils.js')

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']

function compareJsonSchemas (
  ctx,
  sourceSchema,
  targetSchema,
  jsonPath,
  derefJsonPath
) {
  const changes = []
  if (!sourceSchema && !targetSchema) {
    return changes
  }

  if (ctx.changesCache[jsonPath]) {
    return ctx.changesCache[jsonPath]
  }
  ctx.changesCache[jsonPath] = changes

  const { sameKeys, addedKeys, removedKeys } = compareObjectKeys(sourceSchema, targetSchema)

  for (const key of addedKeys) {
    changes.push({
      jsonPath: derefJsonPath + `/${key}`,
      source: undefined,
      target: targetSchema[key]
    })
  }

  for (const key of removedKeys) {
    changes.push({
      jsonPath: derefJsonPath + `/${key}`,
      source: sourceSchema[key],
      target: undefined
    })
  }

  for (const key of sameKeys) {
    let sourceValue = sourceSchema[key]
    let targetValue = targetSchema[key]

    if (key === '$ref' && sourceValue === targetValue) {
      jsonPath = sourceValue
      sourceValue = ctx.sourceRefResolver.getSchema(ctx.sourceSchemaId, sourceValue)
      targetValue = ctx.targetRefResolver.getSchema(ctx.targetSchemaId, targetValue)
    }

    if (sourceValue === targetValue) continue

    if (
      typeof sourceValue === 'object' &&
      typeof targetValue === 'object' &&
      sourceValue !== null &&
      targetValue !== null
    ) {
      const newJsonPath = key === '$ref' ? jsonPath : jsonPath + `/${key}`
      const newDerefJsonPath = key === '$ref' ? derefJsonPath : derefJsonPath + `/${key}`

      const keyChanges = compareJsonSchemas(
        ctx,
        sourceValue,
        targetValue,
        newJsonPath,
        newDerefJsonPath,
        changes
      )
      changes.push(...keyChanges)
    } else {
      changes.push({
        jsonPath: derefJsonPath + `/${key}`,
        source: sourceValue,
        target: targetValue
      })
    }
  }

  return changes
}

function checkSchemaVersions (sourceSchemaVersion, targetSchemaVersion) {
  if (typeof sourceSchemaVersion !== 'string') {
    throw new TypeError('source schema version must be a string')
  }
  if (typeof targetSchemaVersion !== 'string') {
    throw new TypeError('target schema version must be a string')
  }
  if (semverMajor(sourceSchemaVersion) !== semverMajor(targetSchemaVersion)) {
    throw new Error('source and target schemas must have the same major version')
  }
}

function compareParametersObjects (
  ctx,
  path,
  method,
  sourceParameterObjects,
  targetParameterObjects
) {
  const changes = []

  sourceParameterObjects = sourceParameterObjects || []
  targetParameterObjects = targetParameterObjects || []

  for (const targetParameterObject of targetParameterObjects) {
    const targetParameterName = targetParameterObject.name
    const targetParameterIn = targetParameterObject.in

    const sourceParameterObject = sourceParameterObjects.find(
      parameterObject =>
        parameterObject.name === targetParameterName &&
        parameterObject.in === targetParameterIn
    )

    if (sourceParameterObject === undefined) {
      changes.push({
        type: 'parameter',
        action: 'added',
        name: targetParameterName,
        in: targetParameterIn,
        changes: [
          {
            keyword: 'schema',
            changes: [
              {
                jsonPath: '#',
                source: undefined,
                target: targetParameterObject.schema
              }
            ]
          }
        ],
        comment: `${targetParameterIn} parameter "${targetParameterName}"` +
         ` has been added to ${method.toUpperCase()} "${path}" route`
      })
      continue
    }

    const parametersSchemaChanges = compareJsonSchemas(
      ctx,
      sourceParameterObject.schema,
      targetParameterObject.schema,
      `#/paths${path}/${method}/parameters/${targetParameterName}`,
      '#'
    )

    if (parametersSchemaChanges.length > 0) {
      changes.push({
        type: 'parameter',
        action: 'changed',
        name: targetParameterName,
        in: targetParameterIn,
        changes: [
          {
            keyword: 'schema',
            changes: parametersSchemaChanges
          }
        ],
        comment: `${targetParameterIn} parameter "${targetParameterName}"` +
          ` has been changed in ${method.toUpperCase()} "${path}" route`
      })
    }
  }

  for (const sourceParameterObject of sourceParameterObjects) {
    const sourceParameterName = sourceParameterObject.name
    const sourceParameterIn = sourceParameterObject.in

    const targetParameterObject = targetParameterObjects.find(
      parameterObject =>
        parameterObject.name === sourceParameterName &&
        parameterObject.in === sourceParameterIn
    )

    if (targetParameterObject === undefined) {
      changes.push({
        type: 'parameter',
        action: 'deleted',
        name: sourceParameterName,
        in: sourceParameterIn,
        changes: [
          {
            keyword: 'schema',
            changes: [
              {
                jsonPath: '#',
                source: sourceParameterObject.schema,
                target: undefined
              }
            ]
          }
        ],
        comment: `${sourceParameterIn} parameter "${sourceParameterName}"` +
          ` has been deleted from ${method.toUpperCase()} "${path}" route`
      })
      continue
    }
  }

  return changes
}

function compareRequestBodyObjects (
  ctx,
  path,
  method,
  sourceRequestBodyObject,
  targetRequestBodyObject
) {
  const changes = []

  const sourceRequestBodyContent = sourceRequestBodyObject?.content || {}
  const targetRequestBodyContent = targetRequestBodyObject?.content || {}

  const { sameKeys, addedKeys, removedKeys } = compareObjectKeys(
    sourceRequestBodyContent,
    targetRequestBodyContent
  )

  for (const mediaType of addedKeys) {
    const requestBodyObject = targetRequestBodyContent[mediaType]
    changes.push({
      type: 'requestBody',
      action: 'added',
      mediaType,
      changes: [
        {
          keyword: 'schema',
          changes: [
            {
              jsonPath: '#',
              source: undefined,
              target: requestBodyObject.schema
            }
          ]
        }
      ],
      comment: `request body for "${mediaType}" media type` +
        ` has been added to ${method.toUpperCase()} "${path}" route`
    })
  }

  for (const mediaType of removedKeys) {
    const requestBodyObject = sourceRequestBodyContent[mediaType]
    changes.push({
      type: 'requestBody',
      action: 'deleted',
      mediaType,
      changes: [
        {
          keyword: 'schema',
          changes: [
            {
              jsonPath: '#',
              source: requestBodyObject.schema,
              target: undefined
            }
          ]
        }
      ],
      comment: `request body for "${mediaType}" media type` +
        ` has been deleted from ${method.toUpperCase()} "${path}" route`
    })
  }

  for (const mediaType of sameKeys) {
    const sourceRequestBodyObject = sourceRequestBodyContent[mediaType]
    const targetRequestBodyObject = targetRequestBodyContent[mediaType]

    const requestBodySchemaChanges = compareJsonSchemas(
      ctx,
      sourceRequestBodyObject.schema,
      targetRequestBodyObject.schema,
      `#/paths${path}/${method}/requestBody/content/${mediaType}`,
      '#'
    )

    if (requestBodySchemaChanges.length > 0) {
      changes.push({
        type: 'requestBody',
        action: 'changed',
        mediaType,
        changes: [
          {
            keyword: 'schema',
            changes: requestBodySchemaChanges
          }
        ],
        comment: `request body for "${mediaType}" media type` +
          ` has been changed in ${method.toUpperCase()} "${path}" route`
      })
    }
  }

  return changes
}

function compareResponseObjects (
  ctx,
  path,
  method,
  sourceResponseObjects,
  targetResponseObjects
) {
  const changes = []

  if (sourceResponseObjects == null && targetResponseObjects == null) {
    return changes
  }

  for (const statusCode of Object.keys(targetResponseObjects || {})) {
    const targetResponseObject = targetResponseObjects[statusCode]
    const sourceResponseObject = sourceResponseObjects?.[statusCode]

    for (const header of Object.keys(targetResponseObject.headers || {})) {
      const targetHeaderObject = targetResponseObject.headers[header]
      const sourceHeaderObject = sourceResponseObject?.headers?.[header]

      if (!sourceHeaderObject) {
        changes.push({
          type: 'responseHeader',
          action: 'added',
          statusCode,
          header,
          changes: [
            {
              keyword: 'schema',
              changes: [
                {
                  jsonPath: '#',
                  source: undefined,
                  target: targetHeaderObject.schema
                }
              ]
            }
          ],
          comment: `response header for "${statusCode}" status code` +
            ` has been added to ${method.toUpperCase()} "${path}" route`
        })
        continue
      }

      const headerObjectSchemaChanges = compareJsonSchemas(
        ctx,
        sourceHeaderObject.schema,
        targetHeaderObject.schema,
        `#/paths${path}/${method}/responses/${statusCode}/headers/${header}`,
        '#'
      )

      if (headerObjectSchemaChanges.length > 0) {
        changes.push({
          type: 'responseHeader',
          action: 'changed',
          statusCode,
          header,
          changes: [
            {
              keyword: 'schema',
              changes: headerObjectSchemaChanges
            }
          ],
          comment: `response header for "${statusCode}" status code` +
            ` has been changed in ${method.toUpperCase()} "${path}" route`
        })
      }
    }

    for (const mediaType of Object.keys(targetResponseObject.content || {})) {
      const targetMediaTypeObject = targetResponseObject.content[mediaType]
      const sourceMediaTypeObject = sourceResponseObject?.content?.[mediaType]

      if (!sourceMediaTypeObject) {
        changes.push({
          type: 'responseBody',
          action: 'added',
          statusCode,
          mediaType,
          changes: [
            {
              keyword: 'schema',
              changes: [
                {
                  jsonPath: '#',
                  source: undefined,
                  target: targetMediaTypeObject.schema
                }
              ]
            }
          ],
          comment: `response body for "${statusCode}" "${mediaType}" ` +
            `has been added to ${method.toUpperCase()} "${path}" route`
        })
        continue
      }

      const mediaTypeSchemaChanges = compareJsonSchemas(
        ctx,
        sourceMediaTypeObject.schema,
        targetMediaTypeObject.schema,
        `#/paths${path}/${method}/responses/${statusCode}/content/${mediaType}`,
        '#'
      )

      if (mediaTypeSchemaChanges.length > 0) {
        changes.push({
          type: 'responseBody',
          action: 'changed',
          statusCode,
          mediaType,
          changes: [
            {
              keyword: 'schema',
              changes: mediaTypeSchemaChanges
            }
          ],
          comment: `response body for "${statusCode}" "${mediaType}"` +
            ` has been changed in ${method.toUpperCase()} "${path}" route`
        })
      }
    }
  }

  for (const statusCode of Object.keys(sourceResponseObjects || {})) {
    const sourceResponseObject = sourceResponseObjects[statusCode]
    const targetResponseObject = targetResponseObjects?.[statusCode]

    for (const header of Object.keys(sourceResponseObject.headers || {})) {
      const sourceHeaderObject = sourceResponseObject.headers[header]
      const targetHeaderObject = targetResponseObject?.headers?.[header]

      if (!targetHeaderObject) {
        changes.push({
          type: 'responseHeader',
          action: 'deleted',
          statusCode,
          header,
          changes: [
            {
              keyword: 'schema',
              changes: [
                {
                  jsonPath: '#',
                  source: sourceHeaderObject.schema,
                  target: undefined
                }
              ]
            }
          ],
          comment: `response header for "${statusCode}" status code` +
            ` has been deleted from ${method.toUpperCase()} "${path}" route`
        })
        continue
      }
    }

    for (const mediaType of Object.keys(sourceResponseObject.content || {})) {
      const sourceMediaTypeObject = sourceResponseObject.content[mediaType]
      const targetMediaTypeObject = targetResponseObject?.content?.[mediaType]

      if (!targetMediaTypeObject) {
        changes.push({
          type: 'responseBody',
          action: 'deleted',
          statusCode,
          mediaType,
          changes: [
            {
              keyword: 'schema',
              changes: [
                {
                  jsonPath: '#',
                  source: sourceMediaTypeObject.schema,
                  target: undefined
                }
              ]
            }
          ],
          comment: `response body for "${statusCode}" "${mediaType}" ` +
            `has been deleted from ${method.toUpperCase()} "${path}" route`
        })
        continue
      }
    }
  }

  return changes
}

function compareOperationObjects (
  ctx,
  path,
  method,
  sourceOperationObject,
  targetOperationObject
) {
  const parameterObjectsChanges = compareParametersObjects(
    ctx,
    path,
    method,
    sourceOperationObject.parameters,
    targetOperationObject.parameters
  )

  const requestBodyObjectsChanges = compareRequestBodyObjects(
    ctx,
    path,
    method,
    sourceOperationObject.requestBody,
    targetOperationObject.requestBody
  )

  const responseObjectsChanges = compareResponseObjects(
    ctx,
    path,
    method,
    sourceOperationObject.responses,
    targetOperationObject.responses
  )

  if (
    parameterObjectsChanges.length === 0 &&
    requestBodyObjectsChanges.length === 0 &&
    responseObjectsChanges.length === 0
  ) {
    ctx.sameOperations.push({
      method,
      path,
      sourceSchema: sourceOperationObject,
      targetSchema: targetOperationObject
    })
    return
  }

  ctx.changesOperations.push({
    method,
    path,
    sourceSchema: sourceOperationObject,
    targetSchema: targetOperationObject,
    changes: [
      ...parameterObjectsChanges,
      ...requestBodyObjectsChanges,
      ...responseObjectsChanges
    ]
  })
}

function comparePathObjects (ctx, path, sourcePathObject, targetPathObject) {
  const { sameKeys, addedKeys, removedKeys } = compareObjectKeys(
    sourcePathObject,
    targetPathObject
  )

  for (let method of addedKeys) {
    method = method.toLocaleLowerCase()
    if (!HTTP_METHODS.includes(method)) continue
    const targetOperationObject = targetPathObject[method]
    ctx.addedOperations.push({
      method,
      path,
      targetSchema: targetOperationObject
    })
  }

  for (let method of removedKeys) {
    method = method.toLocaleLowerCase()
    if (!HTTP_METHODS.includes(method)) continue
    const sourceOperationObject = sourcePathObject[method]
    ctx.deletedOperations.push({
      method,
      path,
      sourceSchema: sourceOperationObject
    })
  }

  for (let method of sameKeys) {
    method = method.toLocaleLowerCase()
    if (!HTTP_METHODS.includes(method)) continue
    // TODO: check for uppercase methods here
    const sourceOperationObject = sourcePathObject[method]
    const targetOperationObject = targetPathObject[method]
    compareOperationObjects(ctx, path, method, sourceOperationObject, targetOperationObject)
  }
}

function comparePathsObjects (ctx, sourcePathsObjects, targetPathsObjects) {
  const { sameKeys, addedKeys, removedKeys } = compareObjectKeys(
    sourcePathsObjects,
    targetPathsObjects
  )

  for (const path of addedKeys) {
    const pathSchema = targetPathsObjects[path]
    // TODO: check for $ref here
    for (let method of Object.keys(pathSchema)) {
      method = method.toLocaleLowerCase()
      if (!HTTP_METHODS.includes(method)) continue
      const operationSchema = pathSchema[method]
      ctx.addedOperations.push({
        method,
        path,
        targetSchema: operationSchema
      })
    }
  }

  for (const path of removedKeys) {
    const pathSchema = sourcePathsObjects[path]
    // TODO: check for $ref here
    for (let method in pathSchema) {
      method = method.toLocaleLowerCase()
      if (!HTTP_METHODS.includes(method)) continue
      const operationSchema = pathSchema[method]
      ctx.deletedOperations.push({
        method,
        path,
        sourceSchema: operationSchema
      })
    }
  }

  for (const path of sameKeys) {
    const sourcePathObject = sourcePathsObjects[path]
    const targetPathObject = targetPathsObjects[path]
    // TODO: check for $ref here
    comparePathObjects(ctx, path, sourcePathObject, targetPathObject)
  }
}

function compareOpenApiSchemas (sourceSchema, targetSchema) {
  if (typeof sourceSchema !== 'object' || sourceSchema === null) {
    throw new TypeError('source schema must be an object')
  }
  if (typeof targetSchema !== 'object' || targetSchema === null) {
    throw new TypeError('target schema must be an object')
  }
  checkSchemaVersions(sourceSchema.openapi, targetSchema.openapi)

  const ctx = {
    changesCache: {},
    sourceSchemaId: randomUUID(),
    targetSchemaId: randomUUID(),
    sourceRefResolver: new RefResolver(),
    targetRefResolver: new RefResolver(),
    sameOperations: [],
    addedOperations: [],
    deletedOperations: [],
    changesOperations: []
  }
  ctx.sourceRefResolver.addSchema(sourceSchema, ctx.sourceSchemaId)
  ctx.targetRefResolver.addSchema(targetSchema, ctx.targetSchemaId)

  comparePathsObjects(ctx, sourceSchema.paths, targetSchema.paths)

  const isEqual =
    ctx.addedOperations.length === 0 &&
    ctx.deletedOperations.length === 0 &&
    ctx.changesOperations.length === 0

  return {
    isEqual,
    sameRoutes: ctx.sameOperations,
    addedRoutes: ctx.addedOperations,
    deletedRoutes: ctx.deletedOperations,
    changedRoutes: ctx.changesOperations
  }
}

module.exports = compareOpenApiSchemas
