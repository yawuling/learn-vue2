import Vue from 'vue'
import { formatComponentName, warn } from 'core/util/debug'

describe('Debug utilities', () => {
  it('$set/$delete', done => {
    const vm = new Vue({
      template: '<div>{{ a.msg }}</div>',
      data: {
        a: {}
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('')
    vm.$set(vm.a, 'msg', 'hello')
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('hello')
      vm.$delete(vm.a, 'msg')
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('')
    }).then(done)
  })
})
