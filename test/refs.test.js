'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const compareOpenApiSchemas = require('../index.js')

test('modifying routes schema through ref', () => {
  const target = {
    openapi: '1.0.0',
    components: {
      schemas: {
        Bar: {
          type: 'object',
          properties: {
            bar: {
              type: 'integer'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar'
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
    components: {
      schemas: {
        Bar: {
          type: 'object',
          properties: {
            bar: {
              type: 'string'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar'
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
                jsonPath: '#/properties/bar/type',
                before: 'integer',
                after: 'string'
              }
            ],
            comment: 'response body for "200" "application/json" has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('different $ref property values', () => {
  const target = {
    openapi: '1.0.0',
    components: {
      schemas: {
        Bar1: {
          type: 'object',
          properties: {
            bar: {
              type: 'integer'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar1'
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
    components: {
      schemas: {
        Bar2: {
          type: 'object',
          properties: {
            bar: {
              type: 'string'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar2'
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
                jsonPath: '#/$ref',
                before: '#/components/schemas/Bar1',
                after: '#/components/schemas/Bar2'
              }
            ],
            comment: 'response body for "200" "application/json" has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('compare two equal schemas with circular refs', () => {
  const target = {
    openapi: '1.0.0',
    components: {
      schemas: {
        Bar: {
          type: 'object',
          properties: {
            bar: {
              type: 'integer'
            },
            self: {
              $ref: '#/components/schemas/Bar'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar'
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const source = JSON.parse(JSON.stringify(target))

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

test('compare two different schemas with circular refs', () => {
  const target = {
    openapi: '1.0.0',
    components: {
      schemas: {
        Bar: {
          type: 'object',
          properties: {
            bar: {
              type: 'integer'
            },
            self: {
              $ref: '#/components/schemas/Bar'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar'
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
    components: {
      schemas: {
        Bar: {
          type: 'object',
          properties: {
            bar: {
              type: 'string'
            },
            self: {
              $ref: '#/components/schemas/Bar'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar'
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
                jsonPath: '#/properties/bar/type',
                before: 'integer',
                after: 'string'
              }
            ],
            comment: 'response body for "200" "application/json" has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})

test('compare two equal schemas with cross circular refs', () => {
  const target = {
    openapi: '1.0.0',
    components: {
      schemas: {
        Bar1: {
          type: 'object',
          properties: {
            self: {
              $ref: '#/components/schemas/Bar2'
            },
            bar: {
              type: 'integer'
            }
          }
        },
        Bar2: {
          type: 'object',
          properties: {
            self: {
              $ref: '#/components/schemas/Bar1'
            },
            bar: {
              type: 'integer'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar1'
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const source = JSON.parse(JSON.stringify(target))

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

test('compare two different schemas with cross circular refs', () => {
  const target = {
    openapi: '1.0.0',
    components: {
      schemas: {
        Bar1: {
          type: 'object',
          properties: {
            self: {
              $ref: '#/components/schemas/Bar2'
            },
            bar: {
              type: 'integer'
            }
          }
        },
        Bar2: {
          type: 'object',
          properties: {
            self: {
              $ref: '#/components/schemas/Bar1'
            },
            bar: {
              type: 'integer'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar1'
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
    components: {
      schemas: {
        Bar1: {
          type: 'object',
          properties: {
            self: {
              $ref: '#/components/schemas/Bar2'
            },
            bar: {
              type: 'string'
            }
          }
        },
        Bar2: {
          type: 'object',
          properties: {
            self: {
              $ref: '#/components/schemas/Bar1'
            },
            bar: {
              type: 'integer'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Bar1'
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
                jsonPath: '#/properties/bar/type',
                before: 'integer',
                after: 'string'
              }
            ],
            comment: 'response body for "200" "application/json" has been changed in GET "/foo" route'
          }
        ]
      }
    ]
  })
})