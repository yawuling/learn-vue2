import { def } from "../utils/index";
import { newArrayProto } from "./array";

class Observer {
  constructor(data) {
    /**
     * object.defineProperty 只能劫持当前存在的属性，对新增的和删除的监听不到
     * 因此在Vue2中需要写一些单独的api 比如 $set $delete
     */
    // 将__ob__变成不可枚举，这样循环的时候就无法枚举当前属性了
    def(data, '__ob__', this)
    // Object.defineProperty(data, "__ob__", {
    //   enumerable: false,
    //   value: this,
    // });
    // data.__ob__ = this;
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto;
      // data.push() -> 这里的data就是push自定义中的执行上下文（this）
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  walk(obj) {
    // 循环对象对属性进行依次劫持
    // 此处会重新定义属性，相当于把data中的数据重新复制一遍
    Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
  }
  observeArray(arr) {
    arr.forEach((data) => observe(data));
  }
}

/**
 * 把当前的对象定义为响应式(这个方法可以在$set 和 $delete中使用)
 * @param {*} obj 对象
 * @param {*} key 键名
 * @param {*} val 键值
 */
export function defineReactive(obj, key, value) {
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

export function observe(data) {
  if (typeof data !== "object" || data === null) {
    return;
  }
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  // 添加属性标记，如果一个实例被创建过或者被标记过就不标记直接返回
  return new Observer(data);
}
