import { compileToFunctions } from "./compiler/index";
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
    initState(vm);
    // 初始化状态，比如 data/computed/props等等
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    const opts = vm.$options;
    // 先查找render
    if (!opts.render) {
      let template = opts.template;
      // 如果当前没有render没那就解析template
      if (!template && el) {
        // 有template解析template，没有就解析使用el获取dom元素
        // outerHTML获取序列化后的html片段
        template = el.outerHTML;
      }
      if (template) {
        // 如果有模板需要对模板进行编译，即 html -> ast语法树
        // 生成render函数，并挂载到opts上
        const render = compileToFunctions(template)
        // jsx -> 渲染函数 h('div', { ... 描述 })
        // 这一步骤只有在打包时才会有，runtime Only 如果是runtime+compiler则是把编译过程放在运行时做
        opts.render = render
      }
    }
  };
}
export default initMixin;
