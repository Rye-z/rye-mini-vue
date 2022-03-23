let activeEffect
let shouldTrack = true

const targetMap = new WeakMap()

class ReactiveEffect {
  // 用于 stop()
  active = true
  deps = []

  constructor(public fn, public scheduler) {
  }

  run() {
    // fn 可能有返回值
    activeEffect = this
    // 每次执行 fn 都会重新收集依赖
    // 调用 stop 之后就不再自动触发依赖了，但是可以通过手动触发
    // 在 fn 执行
    shouldTrack = true
    const res = this.fn()
    shouldTrack = false

    return res
  }

  stop() {
    // active 防止多次调用 stop 导致重复清理
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  const { deps } = effect
  deps.forEach(dep => {
    dep.delete(effect)
  })
  // 类数组 length
  deps.length = 0
}

export function effect(fn, options = {
  lazy: false,
  scheduler: undefined
}) {
  let _effect: any;
  const { scheduler } = options
  _effect = new ReactiveEffect(fn, scheduler);
  // fn 函数是立刻执行的
  //  - `lazy` 参数延迟执行 => computed 实现
  if (!options.lazy) {
    _effect.run()
  }

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}

export function track(target, key) {
  if (!activeEffect || !shouldTrack) return
  // track 的工作就是收集当前 target 对应 key 的依赖
  // 需要触发的对象 => target
  // 需要触发的对象的某个属性 => target.key
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  trackEffects(dep)

  // 反向收集 => dep 是一个 Set
  activeEffect.deps.push(dep)
}

export function trackEffects(dep) {
  if (activeEffect && shouldTrack) {
    // Set.prototype.has()
    if (dep.has(activeEffect)) return

    dep.add(activeEffect)
  }
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


  triggerEffects(deps)
}

export function triggerEffects(deps) {
  deps.forEach(effect => {
    effect.scheduler
      ? effect.scheduler()
      : effect.run()
  })
}
