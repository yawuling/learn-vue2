(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  class Observer {
    constructor(data) {
      this.walk(data);
    }
    walk(data) {
      // 获取
      // 设置
      Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
    }
  }

  /**
   *
   * @param {*} obj 当前被劫持的对象
   * @param {*} key 遍历到的key
   * @param {*} value 当前key对应的value
   */
  function defineReactive(obj, key, value) {
    // debugger
    /**
     * 1. 只能劫持当前存在的对象
     * 2. $set $delete 去实现的 移除和添加响应
     */
    observe(value);
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log("获取了当前的value", value);
        return value;
      },
      set(newValue) {
        if (newValue === value) {
          return;
        }
        console.log("修改了了当前的value", newValue);
        value = newValue;
      },
    });
  }
  function observe(data) {
    if (typeof data !== "object" || data === null) {
      return;
    }
    return new Observer(data);
  }

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
  function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      const vm = this;
      // mergeOptions，父组件和子组件之间公用的变量，Vue.extend 
      vm.$options = options;

      // 初始化data 初始化props 初始化methods
      initState(vm);
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
