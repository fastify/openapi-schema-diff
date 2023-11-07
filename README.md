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

const sourceSchema = {
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
          200: {
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

const targetSchema = {
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
          200: {
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

const differences = compareOpenApiSchemas(sourceSchema, targetSchema)
assert.deepEqual(differences, {
  isEqual: false,
  sameRoutes: [],
  addedRoutes: [],
  deletedRoutes: [],
  changedRoutes: [
    {
      method: 'get',
      path: '/pets',
      sourceSchema: sourceSchema.paths['/pets'].get,
      targetSchema: targetSchema.paths['/pets'].get,
      changes: [
        {
          type: 'responseBody',
          statusCode: '200',
          mediaType: 'application/json',
          schemaChanges: [
            {
              jsonPath: '#/items/properties/breed',
              source: undefined,
              target: {
                type: 'string'
              }
            }
          ],
          comment: 'response body for "200" "application/json" has been changed in GET "/pets" route'
        }
      ]
    }
  ]
})
```

<a name="license"></a>
## License

MIT
