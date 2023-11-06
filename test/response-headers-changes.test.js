'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const compareOpenApiSchemas = require('../index.js')

test('adding response header schema property', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {}
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
          responses: {
            200: {
              headers: {
                'x-header-foo': {
                  schema: {
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
            type: 'responseHeader',
            statusCode: '200',
            header: 'x-header-foo',
            schemaChanges: [
              {
                jsonPath: '#',
                before: undefined,
                after: {
                  type: 'integer'
                }
              }
            ],
            comment: 'response header for "200" status code has been added to GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('removing response header schema property', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              headers: {
                'x-header-foo': {
                  schema: {
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

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {}
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
            type: 'responseHeader',
            statusCode: '200',
            header: 'x-header-foo',
            schemaChanges: [
              {
                jsonPath: '#',
                before: {
                  type: 'integer'
                },
                after: undefined
              }
            ],
            comment: 'response header for "200" status code has been deleted from GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('changing response header schema property', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              headers: {
                'x-header-foo': {
                  schema: {
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

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              headers: {
                'x-header-foo': {
                  schema: {
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
            type: 'responseHeader',
            statusCode: '200',
            header: 'x-header-foo',
            schemaChanges: [
              {
                jsonPath: '#/type',
                before: 'integer',
                after: 'string'
              }
            ],
            comment: 'response header for "200" status code has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})