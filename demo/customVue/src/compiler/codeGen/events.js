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
export function genElement(ast) {
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
