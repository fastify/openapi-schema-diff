'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const compareOpenApiSchemas = require('../index.js')

test('should not count summery and description properties', () => {
  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'target',
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      },
      '/bar': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      },
      '/baz': {
        summary: 'target',
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      }
    }
  }

  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'source',
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      },
      '/bar': {
        description: 'source',
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      },
      '/baz': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      }
    }
  }

  const diff = compareOpenApiSchemas(source, target)
  assert.deepStrictEqual(diff, {
    isEqual: true,
    sameRoutes: [
      {
        method: 'get',
        path: '/foo',
        schema: source.paths['/foo'].get
      },
      {
        method: 'get',
        path: '/bar',
        schema: source.paths['/bar'].get
      },
      {
        method: 'get',
        path: '/baz',
        schema: source.paths['/baz'].get
      }
    ],
    addedRoutes: [],
    deletedRoutes: [],
    changedRoutes: []
  })
})

test('should not count summery and description properties', () => {
  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'target',
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      },
      '/bar': {
        summary: 'target',
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      }
    }
  }

  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'source',
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      },
      '/baz': {
        description: 'source',
        get: {
          responses: {
            200: {
              content: {
                'application/json': {}
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
    sameRoutes: [
      {
        method: 'get',
        path: '/foo',
        schema: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      }
    ],
    addedRoutes: [
      {
        method: 'get',
        path: '/baz',
        schema: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      }
    ],
    deletedRoutes: [
      {
        method: 'get',
        path: '/bar',
        schema: {
          responses: {
            200: {
              content: {
                'application/json': {}
              }
            }
          }
        }
      }
    ],
    changedRoutes: []
  })
})
