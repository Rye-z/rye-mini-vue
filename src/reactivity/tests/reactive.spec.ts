import { reactive } from "../reactive";

describe('reactive', () => {
    it('happy path', () => {
        // ================ Step one ================
        // 所以先实现 reactive 可以满足 以下两个测试
        const original = { foo: 1, name: 'zhou' }
        const observer = reactive(original)
        // 二者不相等
        expect(observer).not.toBe(original)
        expect(observer.foo).toBe(1)

        //
    })
})
