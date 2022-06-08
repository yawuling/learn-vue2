/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    // 分支流程：在 development 环境下，进行 performance.mark 标记时间，用于渲染性能分析
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      // 打点性能分析
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      console.log(startTag,endTag)
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    // 这里判断组件的，先跳过
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      // 合并参数，将
      debugger
      const globalOptions = resolveConstructorOptions(vm.constructor)
      console.log('之前的options', options, '----', globalOptions)
      vm.$options = mergeOptions(
        globalOptions,
        options || {},
        vm
      )
      console.log('合并后的的options', vm.$options)
    }
    /* istanbul ignore else */
    // TODO 不知道这个干嘛的
    if (process.env.NODE_ENV !== 'production') {
      debugger
      console.log('前', vm)
      initProxy(vm)
      console.log('后', vm)
    } else {
      vm._renderProxy = vm
    }
    debugger
    // expose real self
    vm._self = vm
    // 初始化父子节点的关系
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)

    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

/**
 * mergeOptions 时 传入的参数
 * @param {*} Ctor 
 * @returns 
 */
export function resolveConstructorOptions (Ctor: Class<Component>) {
  /**
   * Ctor.options 等于 Vue.options，因为实例的 constructor 指向的是其类 Vue，这时:
   * options: {
   *   _base: Vue,
   *   components: {
   *     KeepAlive,
   *     Transition,
   *     TransitionGroup
   *   },
   *   directives: {
   *     modal,
   *     show
   *   },
   *   filter: {}
   * }
   */
  console.log('Ctor', Ctor, Ctor.options)
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
