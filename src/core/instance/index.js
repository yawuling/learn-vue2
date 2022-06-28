import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 创建一个Vue的类
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  debugger
  // 主流程1: 进行初始化，将 options 传入 _init 函数，该函数为 initMixin 挂载到 Vue.prototype 上的
  this._init(options)
}

// 先看下Vue引入时都做了什么
console.log('初始化Mixin')
debugger
initMixin(Vue)
// 初始化
stateMixin(Vue)
// 初始化事件
eventsMixin(Vue)
// 初始化生命周期
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue