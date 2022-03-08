import { mutableHandlers, readonlyHandlers, shallowReactiveHandlers, shallowReadonlyHandlers } from "./baseHandlers";
import { isObject } from "../../shared";

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw'
}

// WeakMap 键的引用是 “弱引用”
const reactiveMap = new WeakMap()
const shallowReactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
const shallowReadonlyMap = new WeakMap()

export function readonly(target) {
  return createReactiveObject(
    target,
    readonlyHandlers,
    readonlyMap
  )
}

export function shallowReadonly(target) {
  return createReactiveObject(
    target,
    shallowReadonlyHandlers,
    shallowReadonlyMap
  )
}

/**
 * The reactive conversion is "deep"—it affects all nested properties.
 */
export function reactive(target: object) {
  // target is already a Proxy, return it
  if(isReactive(target)) {
    return target
  }

  return createReactiveObject(
    target,
    mutableHandlers,
    reactiveMap
  )
}

export function shallowReactive(target: object) {
  return createReactiveObject(
    target,
    shallowReactiveHandlers,
    shallowReactiveMap
  )
}

// 虽然函数内容只有一行，但是通过 `createReactiveObject` 可以知道这个函数做了什么
function createReactiveObject(
  target,
  proxyHandler,
  proxyMap
) {
  // target should be Object
  if(!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`)
    return target
  }

  // 查询是否已存在
  let res = proxyMap.get(target)

  if(!res) {
    res = new Proxy(target, proxyHandler)
    proxyMap.set(target, res)
  }

  return res
}

export function isReadonly(value) {
  // 1.访问 target 的任意属性，会触发 proxyHandler 的 get
  //   通过判断 get 的返回值可以判断出是否为 readonly
  // 2. `!!` 转为 boolean 值
  //
  // 需要判断的数据类型
  //   1. 原始类型判断 const original = { age: 11 }
  //   2. reactive 类型判断
  //   3. object 嵌套属性也应该是 readonly
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isReactive(value): boolean {
  if (isReadonly(value)) {
    return false
  }
  // 因为原始类型不会触发 proxyHandler 的 get
  // 所以这里如果是原始类型 `ReactiveFlags.IS_REACTIVE` 返回值一定是 undefined
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isShallow(value): boolean {
  return !!value[ReactiveFlags.IS_SHALLOW]
}

export function isProxy(value): boolean {
  return isReactive(value) || isReadonly(value)
}

/* toRaw() can return the original object from proxies created by
   reactive(), readonly(), shallowReactive() or shallowReadonly().
   https://vuejs.org/api/reactivity-advanced.html#toraw
* */
export function toRaw(observer) {
  // 如果 observer 不是 Proxy 对象，直接返回 observer
  const res = observer[ReactiveFlags.RAW]
  return res ? res : observer
}
