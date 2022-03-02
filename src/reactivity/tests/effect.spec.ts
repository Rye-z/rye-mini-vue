describe("effect", () => {
    // 使用单元测试创建主逻辑
    // effect 的实现依赖于 reactive
    // 所以先实现 reactive 逻辑 => 创建对应的测试文件 `reactive.spec.ts`
    // happy path => 程序主逻辑
    it.skip('happy path', () => {
        const student = reactive({
            age: 10
        })

        let nextAge
        effect(() => {
            nextAge = student.age + 1
        })

        expect(nextAge).toBe(11)

        // update
        student.age++
        expect(nextAge).toBe(12)
    })
})
