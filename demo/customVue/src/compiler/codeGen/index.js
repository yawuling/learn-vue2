import { genElement } from "./events";

export function generate (ast) {
  let code = genElement(ast);
  code = `with(this){return ${code}}`
  let render = new Function(code);
  return {
    render
  }
}