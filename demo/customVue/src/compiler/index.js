import { generate } from "./codeGen/index";
import { parseHTML } from "./parse";

/**
 * 主要做了两个操作
 * 1. 将template 生成ast语法树
 * 2. 生成render函数
 * @param {*} template
 */
export function compileToFunctions(template) {
  // console.log(template);
  // 解析template
  const ast = parseHTML(template);
  // _c('div',{id: 'app'}, _c('span', null, _v(_s(msg) + 'text')))
  const { render } = generate(ast);
  // 生成对应的处理函数
  return render;
}
