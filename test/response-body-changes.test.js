'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const compareOpenApiSchemas = require('../index.js')

test('adding response body schema', () => {
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
            type: 'responseBody',
            statusCode: '200',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#',
                before: undefined,
                after: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'integer'
                    }
                  }
                }
              }
            ],
            comment: 'response body for "200" "application/json" has been added to GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('adding response body schema for status code', () => {
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
            type: 'responseBody',
            statusCode: '200',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#',
                before: undefined,
                after: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'integer'
                    }
                  }
                }
              }
            ],
            comment: 'response body for "200" "application/json" has been added to GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('removing response body schemas', () => {
  const target = {
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
            type: 'responseBody',
            statusCode: '200',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#',
                before: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'integer'
                    }
                  }
                },
                after: undefined
              }
            ],
            comment: 'response body for "200" "application/json" has been deleted from GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('removing response body schema for status code', () => {
  const target = {
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
            type: 'responseBody',
            statusCode: '200',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#',
                before: {
                  type: 'object',
                  properties: {
                    bar: {
                      type: 'integer'
                    }
                  }
                },
                after: undefined
              }
            ],
            comment: 'response body for "200" "application/json" has been deleted from GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('adding response body schema property', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object'
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
            type: 'responseBody',
            statusCode: '200',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#/properties',
                before: undefined,
                after: {
                  bar: {
                    type: 'integer'
                  }
                }
              }
            ],
            comment: 'response body for "200" "application/json" has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('removing schema property', () => {
  const target = {
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
                    type: 'object'
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
            type: 'responseBody',
            statusCode: '200',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#/properties',
                before: {
                  bar: {
                    type: 'integer'
                  }
                },
                after: undefined
              }
            ],
            comment: 'response body for "200" "application/json" has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('adding schema property', () => {
  const target = {
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
                    type: 'object'
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
            type: 'responseBody',
            statusCode: '200',
            mediaType: 'application/json',
            schemaChanges: [
              {
                jsonPath: '#/properties',
                before: {
                  bar: {
                    type: 'integer'
                  }
                },
                after: undefined
              }
            ],
            comment: 'response body for "200" "application/json" has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})
