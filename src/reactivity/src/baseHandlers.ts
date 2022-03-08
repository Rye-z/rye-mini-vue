import { extend, isObject } from "../../shared";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { track, trigger } from "./effect";

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

const set = createSetter()
const shallowSet = createSetter(true)

// 这里利用了闭包里存储 isReadonly 变量
// 此 get 对应的 proxy 生命周期期间，此变量都存在
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    // receiver 是 Proxy 对象
    // target 是 设置 Proxy 前的原始对象
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return shallow
    } else if (
      // toRaw 的判断逻辑，首先 toRaw 需要
      key === ReactiveFlags.RAW
    ) {
      return target
    }

    const res = Reflect.get(target, key, receiver)

    // 注意以下判断的顺序
    // 如果是 shallow 则不会设置嵌套属性为 readonly 或 reactive
    if (shallow) {
      return res
    }

    if (!isReadonly) {
      // todo 依赖收集 track
      track(target, key)
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    // 等价于 return target[property]
    // 区别在于 Reflect 具有返回值，但是 target[property]
    return res
  }
}

function createSetter(shallow = false) {
  return function set(target, key, value) {
    // 注意 Reflect.set() 和 trigger() 的先后顺序 => 先赋值后触发依赖
    const res = Reflect.set(target, key, value)

    trigger(target, key)
    return res
  }
}

export const mutableHandlers: any = {
  get,
  set
}

export const readonlyHandlers: any = {
  get: readonlyGet,
  set(target, property) {
    console.warn(
      `set operation on key "${String(property)}" is failed: target is readonly`,
      target
    )
    return true
  }
}
export const shallowReactiveHandlers = extend(
  {},
    mutableHandlers,
    {
      get: shallowGet,
      set: shallowSet
    }
)


export const shallowReadonlyHandlers = extend(
  {},
  readonlyHandlers,
  {
    get: shallowReadonlyGet
  }
)

