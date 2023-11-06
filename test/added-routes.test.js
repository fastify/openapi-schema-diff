'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const compareOpenApiSchemas = require('../index.js')

test('adding new route', () => {
  const target = {
    openapi: '1.0.0',
    paths: {}
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
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
  }

  const diff = compareOpenApiSchemas(source, target)
  assert.deepStrictEqual(diff, {
    isEqual: false,
    sameRoutes: [],
    addedRoutes: [
      {
        method: 'get',
        path: '/foo',
        schema: source.paths['/foo'].get
      }
    ],
    deletedRoutes: [],
    changedRoutes: []
  })
})

test('adding new operation object', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'target'
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'source',
        get: {
          responses: {
            200: {
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
  }

  const diff = compareOpenApiSchemas(source, target)
  assert.deepStrictEqual(diff, {
    isEqual: false,
    sameRoutes: [],
    addedRoutes: [
      {
        method: 'get',
        path: '/foo',
        schema: source.paths['/foo'].get
      }
    ],
    deletedRoutes: [],
    changedRoutes: []
  })
})
