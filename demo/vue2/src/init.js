import { initState } from "./state"

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    console.log(options)
    const vm = this
    // mergeOptions $ _
    vm.$options = options
    // data  props method
    initState(vm)
    vm._self = vm
  }
}