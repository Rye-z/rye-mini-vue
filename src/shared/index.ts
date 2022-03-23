export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

export const extend = Object.assign

export function hasChanged(value, oldValue) {
  return !Object.is(value, oldValue);
}
