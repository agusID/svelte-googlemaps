import { cleanup } from '@testing-library/svelte'
import { mixcls, isObject } from '@helpers'

beforeEach(cleanup)

describe('helpers', () => {
  test('mixcls', () => {
    expect(mixcls(['foo', 'bar'])).toEqual('foo bar')
    expect(mixcls('baz')).toEqual('baz')
    expect(mixcls({ className: true })).toEqual('className')
    expect(mixcls(true)).toEqual('')
    expect(mixcls('')).toEqual('')
    expect(mixcls('', '')).toEqual('')
    expect(mixcls(['foo'])).toEqual('foo')
  })

  test('isObject', () => {
    expect(isObject(['obj1', 'obj2'])).toEqual(true)
    expect(isObject('Not Object')).toEqual(false)
  })
})
