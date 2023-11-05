# openapi-schema-diff

__openapi-schema-diff__ is a javascript library that compares two OpenAPI schemas and returns the differences between them.

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

<a name="installation"></a>

## Installation

```bash
npm install openapi-schema-diff
```

<a name="usage"></a>

## Usage

```javascript
const compareOpenApiSchemas = require('openapi-schema-diff')

const schema1 = {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    version: '1.0.0'
  },
  paths: {
    '/pets': {
      get: {
        summary: 'Returns all pets',
        responses: {
          '200': {
            description: 'A list of pets.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string'
                      },
                      age: {
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
}

const schema2 = {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    version: '1.0.0'
  },
  paths: {
    '/pets': {
      get: {
        summary: 'Returns all pets',
        responses: {
          '200': {
            description: 'A list of pets.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string'
                      },
                      age: {
                        type: 'integer'
                      },
                      breed: {
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
  }
}

const differences = compareOpenApiSchemas(schema1, schema2)
assert.deepEqual(differences, {
  isEqual: false,
  sameRoutes: [],
  addedRoutes: [],
  deletedRoutes: [],
  modifiedRoutes: [
    {
      method: 'get',
      path: '/pets',
      additions: [],
      deletions: [
        {
          jsonPath: '#/responses/200/content/application/json/schema/items/properties/breed',
          value: { type: 'string' }
        }
      ],
      modifications: []
    }
  ]
})
```

<a name="license"></a>
## License

MIT
