import { observe } from "./observe/index";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
}
/**
 * vm.msg -> vm._data.msg
 * @param {*} target 我要获取目标对象
 * @param {*} sourceKey 这个key值真正存在的位置
 * @param {*} key 需要获得key
 */
function proxy(target, sourceKey, key) {
  // vm.msg -> vm._data.msg
  // target => vm
  // key => msg
  // sourceKey => _data
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get() {
      return target[sourceKey][key]
    },
    set(newValue) {
      target[sourceKey][key] = newValue
    }
  })
}

function initData(vm) {
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(vm) : data || {};
  // observe(data)
  // _ $ 
  vm._data = data
  observe(data)
  // vm.key -> vm._data.key
  Object.keys(data).forEach(key => proxy(vm, '_data', key))
}
