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
export function observe(data) {
  if (typeof data !== "object" || data === null) {
    return;
  }
  return new Observer(data);
}
