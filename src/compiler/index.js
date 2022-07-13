/* @flow */

import { parse } from "./parser/index";
import { optimize } from "./optimizer";
import { generate } from "./codegen/index";
import { createCompilerCreator } from "./create-compiler";

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
/**
 * ast语法树的处理过程
 * 1. parse： 词法分析+语法分析
 * 2. transform: 递归的处理数据，通过使用visitor修改parse过程中组装的数据
 * 3. generate: 把处理后的ast，生成目标代码以及sourcemap
 */
export const createCompiler = createCompilerCreator(function baseCompile(
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    // 优化，遍历 AST，为每个节点做静态标记
    // 标记每个节点是否为静态节点，然后进一步标记出静态根节点
    // 这样在后续更新中就可以跳过这些静态节点了
    // 标记静态根，用于生成渲染函数阶段，生成静态根节点的渲染函数
    optimize(ast, options);
  }
  const code = generate(ast, options);
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns,
  };
});
