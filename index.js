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
  derefJsonPath,
  additions = [],
  deletions = [],
  modifications = []
) {
  if (ctx.schemasEquality[jsonPath]) {
    return ctx.schemasEquality[jsonPath]
  }

  const result = {
    isEqual: null,
    additions: null,
    deletions: null,
    modifications: null
  }
  ctx.schemasEquality[jsonPath] = result

  const { sameKeys, addedKeys, removedKeys } = compareObjectKeys(sourceSchema, targetSchema)

  for (const key of addedKeys) {
    additions.push({
      jsonPath: derefJsonPath + `/${key}`,
      value: sourceSchema[key]
    })
  }

  for (const key of removedKeys) {
    deletions.push({
      jsonPath: derefJsonPath + `/${key}`,
      value: targetSchema[key]
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

      compareJsonSchemas(
        ctx,
        sourceValue,
        targetValue,
        newJsonPath,
        newDerefJsonPath,
        additions,
        deletions,
        modifications
      )
      continue
    }
    modifications.push({
      jsonPath: derefJsonPath + `/${key}`,
      before: targetValue,
      after: sourceValue
    })
  }

  result.isEqual =
    additions.length === 0 &&
    deletions.length === 0 &&
    modifications.length === 0

  result.additions = additions
  result.deletions = deletions
  result.modifications = modifications

  return result
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

function compareOperationObjects (
  ctx,
  path,
  method,
  sourceOperationObject,
  targetOperationObject
) {
  const routeSchemaDiff = compareJsonSchemas(
    ctx,
    sourceOperationObject,
    targetOperationObject,
    `#/paths${path}/${method}`,
    '#'
  )

  if (routeSchemaDiff.isEqual === false) {
    ctx.modifiedOperations.push({
      method,
      path,
      sourceSchema: sourceOperationObject,
      targetSchema: targetOperationObject,
      additions: routeSchemaDiff.additions,
      deletions: routeSchemaDiff.deletions,
      modifications: routeSchemaDiff.modifications
    })
  } else {
    ctx.sameOperations.push({ method, path, schema: sourceOperationObject })
  }
}

function comparePathObjects (ctx, path, sourcePathObject, targetPathObject) {
  const { sameKeys, addedKeys, removedKeys } = compareObjectKeys(
    sourcePathObject,
    targetPathObject
  )

  for (let method of addedKeys) {
    method = method.toLocaleLowerCase()
    if (!HTTP_METHODS.includes(method)) continue
    const sourceOperationObject = sourcePathObject[method]
    ctx.addedOperations.push({ method, path, schema: sourceOperationObject })
  }

  for (let method of removedKeys) {
    method = method.toLocaleLowerCase()
    if (!HTTP_METHODS.includes(method)) continue
    const targetOperationObject = targetPathObject[method]
    ctx.deletedOperations.push({ method, path, schema: targetOperationObject })
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
    const pathSchema = sourcePathsObjects[path]
    // TODO: check for $ref here
    for (let method of Object.keys(pathSchema)) {
      method = method.toLocaleLowerCase()
      if (!HTTP_METHODS.includes(method)) continue
      const operationSchema = pathSchema[method]
      ctx.addedOperations.push({ method, path, schema: operationSchema })
    }
  }

  for (const path of removedKeys) {
    const pathSchema = targetPathsObjects[path]
    // TODO: check for $ref here
    for (let method in pathSchema) {
      method = method.toLocaleLowerCase()
      if (!HTTP_METHODS.includes(method)) continue
      const operationSchema = pathSchema[method]
      ctx.deletedOperations.push({ method, path, schema: operationSchema })
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
    schemasEquality: {},
    sourceSchemaId: randomUUID(),
    targetSchemaId: randomUUID(),
    sourceRefResolver: new RefResolver(),
    targetRefResolver: new RefResolver(),
    sameOperations: [],
    addedOperations: [],
    deletedOperations: [],
    modifiedOperations: []
  }
  ctx.sourceRefResolver.addSchema(sourceSchema, ctx.sourceSchemaId)
  ctx.targetRefResolver.addSchema(targetSchema, ctx.targetSchemaId)

  comparePathsObjects(ctx, sourceSchema.paths, targetSchema.paths)

  const isEqual =
    ctx.addedOperations.length === 0 &&
    ctx.deletedOperations.length === 0 &&
    ctx.modifiedOperations.length === 0

  return {
    isEqual,
    sameRoutes: ctx.sameOperations,
    addedRoutes: ctx.addedOperations,
    deletedRoutes: ctx.deletedOperations,
    modifiedRoutes: ctx.modifiedOperations
  }
}

module.exports = compareOpenApiSchemas
