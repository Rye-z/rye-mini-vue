import { trackEffects, triggerEffects } from "./effect";
import { hasChanged, isObject } from "../../shared";
import { reactive } from "./reactive";

class RefImpl {
  private _value
  private _rawValue

  public dep = new Set()

  private __v_isRef = true

  constructor(value) {
    // 如果传进来的是一个对象，就转为 reactive
    this._value = convert(value)
    this._rawValue = value
  }

  get value() {
    const res = this._value
    // Ref 的依赖对应的是 depsMap 中的一个 dep => Set([effect, effect])
    trackEffects(this.dep)
    return res
  }

  set value(val) {
    this._value = val
    if (hasChanged(val, this._rawValue)) {
      triggerEffects(this.dep)
      this._value = convert(val)
      this._rawValue = val
    }
  }
}

function convert(val) {
  return isObject(val) ? reactive(val) : val
}

function createRef(value) {
  return new RefImpl(value)
}

export function ref(value?) {
  return createRef(value)
}

export function isRef(r) {
  return Boolean(r && r.__v_isRef)
}

/* Can be used to create a ref for a property on a source reactive object.
    The created ref is synced with its source property:
    mutating the source property will update the ref, and vice-versa.
* */
export function toRef() {
}
