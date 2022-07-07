const oldArrayProto = Array.prototype;

// newArrayProto.__proto__ = Array.prototype
export let newArrayProto = Object.create(oldArrayProto);

// 需要重写的是可能会改变当前数组本身的操作
const methods = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

methods.forEach((method) => {
  newArrayProto[method] = function (...args) {
    console.log("执行了自定义方法", args);
    let result = oldArrayProto[method].call(this, ...args);
    const ob = this.__ob__;
    // push unshift splice
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        // splice(0, 2, {name:2}, {name:3})
        inserted = args.slice(2);
        break;
      default:
        break;
    }
    if (inserted) {
      ob.observeArray(inserted);
    }
    console.log("新增数据", inserted);
    return result;
  };
});
