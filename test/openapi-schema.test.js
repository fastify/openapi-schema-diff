'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const compareOpenApiSchemas = require('../index.js')

test('should throw if source schema is not an object', async () => {
  const target = { openapi: '1.0.0', paths: {} }
  const source = 3

  try {
    compareOpenApiSchemas(source, target)
    assert.fail('should throw')
  } catch (err) {
    assert.strictEqual(err.message, 'source schema must be an object')
  }
})

test('should throw if target schema is not an object', async () => {
  const target = 3
  const source = { openapi: '1.0.0', paths: {} }

  try {
    compareOpenApiSchemas(source, target)
    assert.fail('should throw')
  } catch (err) {
    assert.strictEqual(err.message, 'target schema must be an object')
  }
})

test('should throw if source schema is null', async () => {
  const target = { openapi: '1.0.0', paths: {} }
  const source = null

  try {
    compareOpenApiSchemas(source, target)
    assert.fail('should throw')
  } catch (err) {
    assert.strictEqual(err.message, 'source schema must be an object')
  }
})

test('should throw if target schema is null', async () => {
  const target = null
  const source = { openapi: '1.0.0', paths: {} }

  try {
    compareOpenApiSchemas(source, target)
    assert.fail('should throw')
  } catch (err) {
    assert.strictEqual(err.message, 'target schema must be an object')
  }
})
