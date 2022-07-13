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
  console.log('获取结果', ast)
}
