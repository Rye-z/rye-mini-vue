import { ReactiveEffect } from "./effect";


class ComputedRefImpl {
  private _getter: any;
  private _dirty: boolean;
  private _value: any;
  private _effect: ReactiveEffect;

  constructor(getter) {
    this._getter = getter
    this._dirty = true
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._value = this._effect.run()
      this._dirty = false
    }
    return this._value
  }
}

export function computed(getter) {
  // getter 计算属性的 getter
  return new ComputedRefImpl(getter)
}
