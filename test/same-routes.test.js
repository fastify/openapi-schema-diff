'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const compareOpenApiSchemas = require('../index.js')

test('compare two equal schemas', () => {
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

  const source = target

  const diff = compareOpenApiSchemas(source, target)
  assert.deepStrictEqual(diff, {
    isEqual: true,
    sameRoutes: [
      {
        method: 'get',
        path: '/foo',
        schema: source.paths['/foo'].get
      }
    ],
    addedRoutes: [],
    deletedRoutes: [],
    changedRoutes: []
  })
})
