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

export function observe(data) {
  if (typeof data !== "object" || data === null) {
    return;
  }
  return new Observer(data);
}
