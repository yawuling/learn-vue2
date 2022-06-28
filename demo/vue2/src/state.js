import { observe } from "./observe/index";
/**
 * vm.xxx -> vm._data.xxx
 * @param {*} target 获取数据用的目标对象
 * @param {*} sourceKey 我当前从哪里才能代理到这个key的键名
 * @param {*} key 我们当前访问或者是操作的这个一个key值
 */
function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    get() {
      return target[sourceKey][key];
    },
    set(newValue) {
      target[sourceKey][key] = newValue;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(vm) : data;
  vm._data = data;
  observe(data);
  // vm.xxx 某一个key  vm._data.xxx
  Object.keys(data).forEach((key) => proxy(vm, "_data", key));
}
export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
}
