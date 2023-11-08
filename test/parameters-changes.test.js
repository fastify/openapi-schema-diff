'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const compareOpenApiSchemas = require('../index.js')

test('adding request query schema property value', () => {
  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {}
      }
    }
  }

  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          parameters: [{
            name: 'bar',
            in: 'query',
            schema: {
              type: 'string'
            }
          }]
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
            type: 'parameter',
            action: 'added',
            name: 'bar',
            in: 'query',
            changes: [
              {
                keyword: 'schema',
                changes: [
                  {
                    jsonPath: '#',
                    source: undefined,
                    target: {
                      type: 'string'
                    }
                  }
                ]
              }
            ],
            comment: 'query parameter "bar" has been added to GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('changing request header schema property value', () => {
  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          parameters: [{
            name: 'bar',
            in: 'header',
            schema: {
              type: 'integer'
            }
          }]
        }
      }
    }
  }

  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          parameters: [{
            name: 'bar',
            in: 'header',
            schema: {
              type: 'string'
            }
          }]
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
            type: 'parameter',
            action: 'changed',
            name: 'bar',
            in: 'header',
            changes: [
              {
                keyword: 'schema',
                changes: [
                  {
                    jsonPath: '#/type',
                    source: 'integer',
                    target: 'string'
                  }
                ]
              }
            ],
            comment: 'header parameter "bar" has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('removing request path param schema property value', () => {
  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          parameters: [{
            name: 'bar',
            in: 'path',
            schema: {
              type: 'string'
            }
          }]
        }
      }
    }
  }

  const target = {
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
            type: 'parameter',
            action: 'deleted',
            name: 'bar',
            in: 'path',
            changes: [
              {
                keyword: 'schema',
                changes: [
                  {
                    jsonPath: '#',
                    source: {
                      type: 'string'
                    },
                    target: undefined
                  }
                ]
              }
            ],
            comment: 'path parameter "bar" has been deleted from GET "/foo" route'
          }
        ]
      }
    ]
  })
})
