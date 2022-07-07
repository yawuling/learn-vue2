import { initState } from "./state";

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // 在init里面我们可以做一些初始化的操作
    // 在Vue中一般使用 $xxx 来表示一些Vue的私有属性
    // 在Vue源码中，此处其实是做了一个参数合并的动作
    // 将用户的操作挂载在实例上
    this.$options = options;
    vm._self = vm;
    initState(vm)
    // 初始化状态，比如 data/computed/props等等
  };
}
export default initMixin;
