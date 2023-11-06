'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const compareOpenApiSchemas = require('../index.js')

test('adding request body schema property value', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {}
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const diff = compareOpenApiSchemas(source, target)
  assert.deepStrictEqual(diff, {
    isEqual: false,
    sameRoutes: [],
    addedRoutes: [],
    deletedRoutes: [],
    changedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        changes: [
          {
            type: 'requestBody',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#',
                before: undefined,
                after: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'string'
                    }
                  }
                }
              }
            ],
            comment: 'request body for "application/json" media type has been added to GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('changing request body schema property value', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'integer'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const diff = compareOpenApiSchemas(source, target)
  assert.deepStrictEqual(diff, {
    isEqual: false,
    sameRoutes: [],
    addedRoutes: [],
    deletedRoutes: [],
    changedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        changes: [
          {
            type: 'requestBody',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#/properties/bar/type',
                before: 'integer',
                after: 'string'
              }
            ],
            comment: 'request body for "application/json" media type has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('removing request body schema property value', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {}
      }
    }
  }

  const diff = compareOpenApiSchemas(source, target)
  assert.deepStrictEqual(diff, {
    isEqual: false,
    sameRoutes: [],
    addedRoutes: [],
    deletedRoutes: [],
    changedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        changes: [
          {
            type: 'requestBody',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#',
                before: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'string'
                    }
                  }
                },
                after: undefined
              }
            ],
            comment: 'request body for "application/json" media type has been deleted from GET "/foo" route'
          }
        ]
      }
    ]
  })
})
