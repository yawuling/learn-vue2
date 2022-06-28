(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  class Observer {
    constructor(data) {
      /**
       * object.defineProperty 只能劫持当前存在的属性，对新增的和删除的监听不到
       * 因此在Vue2中需要写一些单独的api 比如 $set $delete
       */
      this.walk(data);
    }
    walk(obj) {
      // 循环对象对属性进行依次劫持
      // 此处会重新定义属性，相当于把data中的数据重新复制一遍
      Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
    }
  }

  /**
   * 把当前的对象定义为响应式(这个方法可以在$set 和 $delete中使用)
   * @param {*} obj 对象
   * @param {*} key 键名
   * @param {*} val 键值
   */
  function defineReactive(obj, key, value) {
    // 对所有对象都进行属性劫持
    observe(value);
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log("get", value);
        return value;
      },
      set(newValue) {
        // 更新value
        if (value === newValue) {
          return;
        }
        console.log("set", newValue);
        value = newValue;
      },
    });
  }

  function observe(data) {
    if (typeof data !== "object" || data === null) {
      return;
    }
    // 添加属性标记，如果一个实例被创建过或者被标记过就不标记直接返回
    return new Observer(data);
  }

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
      proxy(vm, '_data', key);
    });
  }

  function initState(vm) {
    const opts = vm.$options;
    // 初始化data、props、method等
    if (opts.data) {
      initData(vm);
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      console.log(options);
      const vm = this;
      // 在init里面我们可以做一些初始化的操作
      // 在Vue中一般使用 $xxx 来表示一些Vue的私有属性
      // 在Vue源码中，此处其实是做了一个参数合并的动作
      // 将用户的操作挂载在实例上
      this.$options = options;
      vm._self = vm;
      initState(vm);
      // 初始化状态，比如 data/computed/props等等
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
