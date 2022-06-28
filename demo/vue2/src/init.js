import { initState } from "./state";

export default function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    // mergeOptions，父组件和子组件之间公用的变量，Vue.extend 
    vm.$options = options

    // 初始化data 初始化props 初始化methods
    initState(vm)
  };
}
