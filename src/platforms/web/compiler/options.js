/* @flow */

import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from '../util/index'

import modules from './modules/index'
import directives from './directives/index'
import { genStaticKeys } from 'shared/util'
import { isUnaryTag, canBeLeftOpenTag } from './util'

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules, // // 提供了对 class、:class、style、:style，以及 input 标签的 :type、v-for、v-if 的解析；transformNode 函数数组分别有处理 class 和 style 的解析函数；preTransformNode 为解析 input 标签的解析函数
  directives, // 提供了 v-model、v-html、v-text 指令的解析
  isPreTag, // 是否为 pre 标签
  isUnaryTag, // 是否为单标签，area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr
  mustUseProp, // 对于表单的 value、option 的 selected、type="checkbox" 的 input 的 checked、video 的 muted，需使用 prop 参数传递
  canBeLeftOpenTag, // 是否可以自闭合标签，colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source
  isReservedTag, // 是否为平台保留标签（跟保留字类似），即所有的 html 标签
  getTagNamespace, // 获取标签是否为 svg 类型的标签（svg、circle、g等），或者是否为 math 标签
  staticKeys: genStaticKeys(modules) // 是否为静态属性（ staticClass, staticStyle），标签中的 class 和 style 会被保存在 ast 对象中的 staticClass 和 staticStyle 属性
}
