'use strict'

const isArray = Array.isArray
const keyList = Object.keys
const hasProp = Object.prototype.hasOwnProperty

function equal(a: any, b: any) {
  if (a === b) {
    return true
  }

  const arrA = isArray(a)
  const arrB = isArray(b)
  let i
  let length
  let key

  if (arrA && arrB) {
    length = a.length
    if (length !== b.length) {
      return false
    }
    for (i = 0; i < length; i++) {
      if (!equal(a[i], b[i])) {
        return false
      }
    }

    return true
  }

  if (arrA !== arrB) {
    return false
  }

  const dateA = a instanceof Date
  const dateB = b instanceof Date

  if (dateA !== dateB) {
    return false
  }

  if (dateA && dateB) {
    return a.getTime() === b.getTime()
  }

  const regexpA = a instanceof RegExp
  const regexpB = b instanceof RegExp

  if (regexpA !== regexpB) {
    return false
  }

  if (regexpA && regexpB) {
    return a.toString() === b.toString()
  }

  if (a instanceof Object && b instanceof Object) {
    const keys = keyList(a)
    length = keys.length

    if (length !== keyList(b).length) {
      return false
    }

    for (i = 0; i < length; i++) {
      if (!hasProp.call(b, keys[i])) {
        return false
      }
    }

    for (i = 0; i < length; i++) {
      key = keys[i]
      if (key === '_owner' && a.$$typeof && a._store) {
        // React-specific: avoid traversing React elements' _owner.
        //  _owner contains circular references
        // and is not needed when comparing the actual elements (and not their owners)
        // .$$typeof and ._store on just reasonable markers of a react element
        continue
      } else {
        // all other properties should be traversed as usual
        if (!equal(a[key], b[key])) {
          return false
        }
      }
    }

    return true
  }

  return false
}

export const isEqual = (a: any, b: any) => {
  try {
    return equal(a, b)
  } catch (error) {
    if (error.message && error.message.match(/stack|recursion/i)) {
      // warn on circular references, don't crash
      // browsers give this different errors name and messages:
      // chrome/safari: "RangeError", "Maximum call stack size exceeded"
      // firefox: "InternalError", too much recursion"
      // edge: "Error", "Out of stack space"
      // tslint:disable-next-line no-console
      console.warn(
        'Warning: react-fast-compare does not handle circular references.',
        error.name,
        error.message,
      )
      return false
    }
    // some other error. we should definitely know about these
    throw error
  }
}
