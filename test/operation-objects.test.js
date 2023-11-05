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
          bar: 42
        }
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          bar: 42
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
        schema: {
          bar: 42
        }
      }
    ],
    addedRoutes: [],
    deletedRoutes: [],
    modifiedRoutes: []
  })
})

test('changing schema property value', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          bar: 42
        }
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        get: {
          bar: 43
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
    modifiedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        additions: [],
        deletions: [],
        modifications: [
          {
            jsonPath: '#/bar',
            before: 42,
            after: 43
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
          bar: 42
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
    modifiedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        additions: [],
        deletions: [
          {
            jsonPath: '#/bar',
            value: 42
          }
        ],
        modifications: []
      }
    ]
  })
})

test('adding schema property', () => {
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
          bar: 42
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
    modifiedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        additions: [
          {
            jsonPath: '#/bar',
            value: 42
          }
        ],
        deletions: [],
        modifications: []
      }
    ]
  })
})

test('adding new route', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo1': {
        get: {}
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo1': {
        get: {}
      },
      '/foo2': {
        get: {
          bar: 11
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
        path: '/foo1',
        schema: {}
      }
    ],
    addedRoutes: [
      {
        method: 'get',
        path: '/foo2',
        schema: {
          bar: 11
        }
      }
    ],
    deletedRoutes: [],
    modifiedRoutes: []
  })
})

test('adding new operation object', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo1': {
        get: {}
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo1': {
        get: {},
        post: {
          bar: 11
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
        path: '/foo1',
        schema: {}
      }
    ],
    addedRoutes: [
      {
        method: 'post',
        path: '/foo1',
        schema: {
          bar: 11
        }
      }
    ],
    deletedRoutes: [],
    modifiedRoutes: []
  })
})

test('removing an operation object', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo1': {
        get: {},
        post: {
          bar: 11
        }
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo1': {
        get: {}
      }
    }
  }

  const diff = compareOpenApiSchemas(source, target)
  assert.deepStrictEqual(diff, {
    isEqual: false,
    sameRoutes: [
      {
        method: 'get',
        path: '/foo1',
        schema: {}
      }
    ],
    addedRoutes: [],
    deletedRoutes: [
      {
        method: 'post',
        path: '/foo1',
        schema: {
          bar: 11
        }
      }
    ],
    modifiedRoutes: []
  })
})

test('removing a route', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo1': {
        get: {}
      },
      '/foo2': {
        get: {
          bar: 11
        }
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo1': {
        get: {}
      }
    }
  }

  const diff = compareOpenApiSchemas(source, target)
  assert.deepStrictEqual(diff, {
    isEqual: false,
    sameRoutes: [
      {
        method: 'get',
        path: '/foo1',
        schema: {}
      }
    ],
    addedRoutes: [],
    deletedRoutes: [
      {
        method: 'get',
        path: '/foo2',
        schema: {
          bar: 11
        }
      }
    ],
    modifiedRoutes: []
  })
})

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
          $ref: '#/components/schemas/Bar'
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
          $ref: '#/components/schemas/Bar'
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
    modifiedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        additions: [],
        deletions: [],
        modifications: [
          {
            jsonPath: '#/properties/bar/type',
            before: 'integer',
            after: 'string'
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
          $ref: '#/components/schemas/Bar1'
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
          $ref: '#/components/schemas/Bar2'
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
    modifiedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        additions: [],
        deletions: [],
        modifications: [
          {
            jsonPath: '#/$ref',
            before: '#/components/schemas/Bar1',
            after: '#/components/schemas/Bar2'
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
          $ref: '#/components/schemas/Bar'
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
        schema: {
          $ref: '#/components/schemas/Bar'
        }
      }
    ],
    addedRoutes: [],
    deletedRoutes: [],
    modifiedRoutes: []
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
            self: {
              $ref: '#/components/schemas/Bar'
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
          $ref: '#/components/schemas/Bar'
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
            self: {
              $ref: '#/components/schemas/Bar'
            },
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
          $ref: '#/components/schemas/Bar'
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
    modifiedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        additions: [],
        deletions: [],
        modifications: [
          {
            jsonPath: '#/properties/bar/type',
            before: 'integer',
            after: 'string'
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
          $ref: '#/components/schemas/Bar1'
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
        schema: {
          $ref: '#/components/schemas/Bar1'
        }
      }
    ],
    addedRoutes: [],
    deletedRoutes: [],
    modifiedRoutes: []
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
          $ref: '#/components/schemas/Bar1'
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
              type: 'string'
            }
          }
        }
      }
    },
    paths: {
      '/foo': {
        get: {
          $ref: '#/components/schemas/Bar1'
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
    modifiedRoutes: [
      {
        method: 'get',
        path: '/foo',
        sourceSchema: source.paths['/foo'].get,
        targetSchema: target.paths['/foo'].get,
        additions: [],
        deletions: [],
        modifications: [
          {
            jsonPath: '#/properties/self/properties/bar/type',
            before: 'integer',
            after: 'string'
          }
        ]
      }
    ]
  })
})

test('should not count summery and description properties', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'target',
        get: {
          bar: 42
        }
      },
      '/bar': {
        get: {
          bar: 42
        }
      },
      '/baz': {
        summary: 'target',
        get: {
          bar: 42
        }
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'source',
        get: {
          bar: 42
        }
      },
      '/bar': {
        description: 'source',
        get: {
          bar: 42
        }
      },
      '/baz': {
        get: {
          bar: 42
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
        schema: {
          bar: 42
        }
      },
      {
        method: 'get',
        path: '/bar',
        schema: {
          bar: 42
        }
      },
      {
        method: 'get',
        path: '/baz',
        schema: {
          bar: 42
        }
      }
    ],
    addedRoutes: [],
    deletedRoutes: [],
    modifiedRoutes: []
  })
})

test('should not count summery and description properties', () => {
  const target = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'target',
        get: {
          bar: 42
        }
      },
      '/bar': {
        summary: 'target',
        get: {
          bar: 42
        }
      }
    }
  }

  const source = {
    openapi: '1.0.0',
    paths: {
      '/foo': {
        description: 'source',
        get: {
          bar: 42
        }
      },
      '/baz': {
        description: 'source',
        get: {
          bar: 42
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
          bar: 42
        }
      }
    ],
    addedRoutes: [
      {
        method: 'get',
        path: '/baz',
        schema: {
          bar: 42
        }
      }
    ],
    deletedRoutes: [
      {
        method: 'get',
        path: '/bar',
        schema: {
          bar: 42
        }
      }
    ],
    modifiedRoutes: []
  })
})
