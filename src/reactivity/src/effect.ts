let activeEffect

const targetMap = new WeakMap()

class ReactiveEffect {
  constructor(public fn) {}
  run() {
    // fn 可能有返回值
    activeEffect  = this
    return this.fn()
  }
  stop() {}
}

export function effect(fn) {
  let _effect: any;
  _effect = new ReactiveEffect(fn);
  // fn 函数是立刻执行的
  //  - `lazy` 参数延迟执行 => computed 实现
  _effect.run()

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function track(target, key) {
  // track 的工作就是收集当前 target 对应 key 的依赖
  // 需要触发的对象 => target
  // 需要触发的对象的某个属性 => target.key
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let deps = depsMap.get(key)
  if(!deps) {
    depsMap.set(key, (deps = new Set()))
  }

  deps.add(activeEffect)

}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  const deps = depsMap.get(key)
  if (!deps) {
    return
  }

  deps.forEach(effect => effect.run())
}
