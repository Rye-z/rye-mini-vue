const handler: any = {
    get(target, property, receiver) {
        // 等价于 return target[property]
        // 区别在于 Reflect 具有返回值，但是 target[property]
        return Reflect.get(target, property)

        // todo 依赖收集 track
    },
    set(target, property, value, receiver) {
        return Reflect.set(target, property, value)

        // todo 依赖触发 trigger
    }
}

export function reactive(target) {
    return new Proxy(target, handler)
}
