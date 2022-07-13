(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(props) {
    let code = "";
    props.forEach((attr) => {
      code += `,${attr.name}:${JSON.stringify(attr.value)}`;
    });
    return `{${code.slice(1)}}`;
  }
  function genChildren(children) {
    let code = "";
    children.forEach((child) => {
      code += "," + genElement(child);
    });
    return code.slice(1);
  }

  function genText({ text }) {
    let code;
    if (defaultTagRE.test(text)) {
      // _s(name) + text
      let tokens = [];
      let match;
      let index;
      let lastIndex = (defaultTagRE.lastIndex = 0);
      while ((match = defaultTagRE.exec(text))) {
        // 文本节点处于两次index之间
        index = match.index;
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        lastIndex = index + match[0].length;
        tokens.push(`_s(${match[1]})`);
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      code = `_v(${tokens.join("+")})`;
    } else {
      code = `_v(${JSON.stringify(text)})`;
    }
    return code;
    // return `_v(${ defaultTagRE.test(node.text) ?  : JSON.stringify(node.text)})`
  }

  /**
   * 生成render函数：_c('div',{id: 'app'}, _c('span', null,  _v(_s(msg))))
   * @param {*} ast
   * @returns
   */
  function genElement(ast) {
    if (ast.type === 2) {
      // 文本节点返回值
      return genText(ast);
    }
    // let code = `_c('div',{id: 'app'}, _c('span', null, _v(_s(msg))))`;
    let code = `
    _c(
       '${ast.tag}', 
        ${ast.attrs?.length ? genProps(ast.attrs) : null}, 
        ${ast.children?.length ? genChildren(ast.children) : null}
      )`;
    return code;
  }

  function generate (ast) {
    let code = genElement(ast);
    code = `with(this){return ${code}}`;
    let render = new Function(code);
    return {
      render
    }
  }

  // 属性正则：匹配属性 a = b  a="b" a='b'
  const attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
  // 匹配开始的标签<div
  const startTagOpen = new RegExp(`^<${qnameCapture}`); // 判断是否为开始标签的开头 <
  // 匹配开始的结束标签>
  const startTagClose = /^\s*(\/?)>/; // 判断是否为开始标签的结尾 >
  // 匹配关闭标签 </div>
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 判断是否为闭标签， </xxx>

  /**
   * 拆解template 生成ast语法树
   * @param {*} template 模板
   * @returns ast语法树
   */
  function parseHTML(html) {
    // 根节点
    let root = null;
    let currentParent = null;
    // 匹配开始结束的栈
    let stack = [];

    // 处理一个解析一个，直至最后全部处理完成
    while (html) {
      // 获取每一个标签的开始
      let textEnd = html.indexOf("<");
      if (textEnd === 0) {
        /**
         * 有两种情况
         * 1. 表示当前处于标签起始位置并通过起始位置处理当前标签
         * 2. 是关闭标签</div>
         * eg: <div id="app"></div>
         * textEnd: 0; 通过处理当前 <div id="app"> ‘<’ 和 ‘>’中间的部分
         */
        // 关闭标签的处理，直接除掉
        const endTagMatch = html.match(endTag);
        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }

        // 开始标签处理
        const startTagMatch = parseStartTag();
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          // 此时相当于处理完开始标签了
          continue;
        }
      }
      /**
       * 如果<并不是第一个索引，那么表示<div>aaa<span></span></div>
       */
      let text;
      if (textEnd > 0) {
        // 截取文本内容
        text = html.substring(0, textEnd);
        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }

    return root;

    function parseStartTag() {
      const start = html.match(startTagOpen);
      if (start) {
        // 是开始标签
        const match = {
          tagName: start[1],
          attrs: [],
        };
        // 处理后把当前处理结束的标签去掉
        advance(start[0].length);
        // 此时开始标签已经被移除，因此开始处理属性
        // 在遇到 '>' 前都是当前标签的属性
        let end, attr;
        while (
          !(end = html.match(startTagClose)) &&
          (attr = html.match(attribute))
        ) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5],
          });
          advance(attr[0].length);
        }
        if (end) {
          // 处理关闭标签
          advance(end[0].length);
        }
        return match;
      }
      return false;
    }
    /**
     * 处理html标签
     * @param {number} n
     */
    function advance(n) {
      html = html.substring(n);
    }

    function start(tag, attrs) {
      let element = createASTElement(tag, attrs);
      if (!root) {
        root = element;
      }
      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
      stack.push(element);
      currentParent = element;
    }
    function chars(text) {
      text = text.replace(/\s/g, "");
      text &&
        currentParent.children.push({
          text,
          type: 2,
          parent: currentParent,
        });
    }
    function end(tag) {
      stack.pop();
      if (stack.length) {
        currentParent = stack[stack.length - 1];
      }
    }
  }

  function createASTElement(tag, attrs) {
    return {
      tag,
      attrs,
      type: 1,
      children: [],
      parent: null,
    };
  }

  /**
   * 主要做了两个操作
   * 1. 将template 生成ast语法树
   * 2. 生成render函数
   * @param {*} template
   */
  function compileToFunctions(template) {
    // console.log(template);
    // 解析template
    const ast = parseHTML(template);
    // _c('div',{id: 'app'}, _c('span', null, _v(_s(msg) + 'text')))
    const { render } = generate(ast);
    // 生成对应的处理函数
    return render;
  }

  const def = function (obj, key, value) {
    Object.defineProperty(obj, key, {
      enumerable: false,
      value,
    });
  };

  const oldArrayProto = Array.prototype;

  // newArrayProto.__proto__ = Array.prototype
  let newArrayProto = Object.create(oldArrayProto);

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
      }
      if (inserted) {
        ob.observeArray(inserted);
      }
      console.log("新增数据", inserted);
      return result;
    };
  });

  class Observer {
    constructor(data) {
      /**
       * object.defineProperty 只能劫持当前存在的属性，对新增的和删除的监听不到
       * 因此在Vue2中需要写一些单独的api 比如 $set $delete
       */
      // 将__ob__变成不可枚举，这样循环的时候就无法枚举当前属性了
      def(data, '__ob__', this);
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
    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
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
      const vm = this;
      // 在init里面我们可以做一些初始化的操作
      // 在Vue中一般使用 $xxx 来表示一些Vue的私有属性
      // 在Vue源码中，此处其实是做了一个参数合并的动作
      // 将用户的操作挂载在实例上
      this.$options = options;
      vm._self = vm;
      initState(vm);
      // 初始化状态，比如 data/computed/props等等
      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      const vm = this;
      el = document.querySelector(el);
      const opts = vm.$options;
      // 先查找render
      if (!opts.render) {
        let template = opts.template;
        // 如果当前没有render没那就解析template
        if (!template && el) {
          // 有template解析template，没有就解析使用el获取dom元素
          // outerHTML获取序列化后的html片段
          template = el.outerHTML;
        }
        if (template) {
          // 如果有模板需要对模板进行编译，即 html -> ast语法树
          // 生成render函数，并挂载到opts上
          const render = compileToFunctions(template);
          // jsx -> 渲染函数 h('div', { ... 描述 })
          // 这一步骤只有在打包时才会有，runtime Only 如果是runtime+compiler则是把编译过程放在运行时做
          opts.render = render;
        }
      }
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
