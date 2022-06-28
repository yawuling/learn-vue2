import { observe } from "./observe/index";
/**
 * 实现数据的代理，可由vm.xxx 代理到 vm._data上
 * @param {*} target 目标对象
 * @param {*} sourceKey 当前key对应真实位置
 * @param {*} key 被查找的key
 */
function proxy(target, sourceKey, key) {
  // vm[name] -> vm[sourceKey][key]
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
  // data 可能是函数也可能是一个对象
  // 如果是函数希望执行
  // 不是函数直接使用data
  data = typeof data === "function" ? data.call(vm) : data;
  vm._data = data;
  // 响应式实现，对data进行劫持
  observe(data);
  Object.keys(data).forEach(key => {
    proxy(vm, '_data', key)
  })
}

export function initState(vm) {
  const opts = vm.$options;
  // 初始化data、props、method等
  if (opts.data) {
    initData(vm);
  }
}
