'use strict'

function compareObjectKeys (sourceObject, targetObject) {
  const sameKeys = []
  const addedKeys = []
  const removedKeys = []

  for (const key of Object.keys(targetObject)) {
    if (sourceObject[key] === undefined) {
      addedKeys.push(key)
    } else {
      sameKeys.push(key)
    }
  }

  for (const key of Object.keys(sourceObject)) {
    if (targetObject[key] === undefined) {
      removedKeys.push(key)
    }
  }

  return { sameKeys, addedKeys, removedKeys }
}

module.exports = {
  compareObjectKeys
}
