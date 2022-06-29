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
      Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
    }
  }
  /**
   *
   * @param {*} target 目标对象
   * @param {*} key 需要拦截的键值
   * @param {*} value 当前获取的键值对应的数据
   */
  function defineReactive(target, key, value) {
    // 对象 key {  }
    // 拦截取值的过程
    // 拦截赋值的过程
    observe(value);
    // 只能拦截当前target 存在的 key
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log("get", value);
        return value;
      },
      set(newValue) {
        if (newValue === value) {
          return;
        }
        console.log("set", newValue);
        observe(newValue);
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

  function initState(vm) {
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
        target[sourceKey][key] = newValue;
      }
    });
  }

  function initData(vm) {
    let data = vm.$options.data;
    data = typeof data === "function" ? data.call(vm) : data || {};
    // observe(data)
    // _ $ 
    vm._data = data;
    observe(data);
    // vm.key -> vm._data.key
    Object.keys(data).forEach(key => proxy(vm, '_data', key));
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      console.log(options);
      const vm = this;
      // mergeOptions $ _
      vm.$options = options;
      // data  props method
      initState(vm);
      vm._self = vm;
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
