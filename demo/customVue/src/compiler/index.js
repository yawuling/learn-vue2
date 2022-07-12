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
 * 主要做了两个操作
 * 1. 将template 生成ast语法树
 * 2. 生成render函数
 * @param {*} template
 */
export function compileToFunctions(template) {
  console.log(template);
  // 解析template
  const ast = parseHTML(template);
}
/**
 * 拆解template 生成ast语法树
 * @param {*} template 模板
 * @returns ast语法树
 */
function parseHTML(html) {
  // 处理一个解析一个，直至最后全部处理完成
  let last;
  let index = 0;
  last = html;
  let replaceStr = last.match(startTagOpen);
  // last = last.replace(last.match(startTagOpen)[0], "");
  // last = last.replace(last.match(attribute)[0], "");
  // last = last.replace(last.match(startTagClose)[0], "");
  console.log(replaceStr);
  // console.log(last.match(attribute))
  // while (html) {
  //   last = html;
  // }
  return {};
}
