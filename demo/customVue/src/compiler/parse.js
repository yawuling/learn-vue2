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
export function parseHTML(html) {
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
