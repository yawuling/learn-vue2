# Vue 创建过程

使用 vscode 的 `debugger for chrome` 插件，对代码中进行断点，执行 `npm run dev:demo` 进行查看分析。

## Vue 类创建过程

一、`src/core/instance/index.js`，创建一个 Vue class，并给其挂上 init 初始化、state 数据绑定功能、event 事件（on、off、emit等）、lifecycle 生命周期、render 渲染函数。

> 这一步都只是挂载函数，未进行 Vue 的实例化

1. `src/core/instance/init.js`，`initMixin(Vue)` 方法给 Vue.prototype 添加 `_init` 函数，在 Vue 的 constructor 中执行初始化
2. `src/core/instance/state.js`，`stateMixin(Vue)` 方法给 Vue.prototype 添加 `$data`、`$props`、`$set`、`$delete`、`$watch` 方法
3. `src/core/instance/event.js`，`eventMixin(Vue)` 方法给 Vue.prototype 添加 `$on`、`$once`、`$off`、`$emit` 方法
4. `src/core/instance/lifecycle.js`，`lifecycleMixin(Vue)` 方法给 `Vue.prototype` 添加 `_update`、`$forceUpdate`、`$destroy` 方法
5. `src/core/instance/render.js`，`renderMixin(Vue)` 方法给 Vue.prototype 添加渲染辅助 helper 函数：

```javascript
Vue.prototype._o = markOnce
Vue.prototype._n = toNumber
Vue.prototype._s = toString
Vue.prototype._l = renderList
Vue.prototype._t = renderSlot
Vue.prototype._q = looseEqual
Vue.prototype._i = looseIndexOf
Vue.prototype._m = renderStatic
Vue.prototype._f = resolveFilter
Vue.prototype._k = checkKeyCodes
Vue.prototype._b = bindObjectProps
Vue.prototype._v = createTextVNode
Vue.prototype._e = createEmptyVNode
Vue.prototype._u = resolveScopedSlots
Vue.prototype._g = bindObjectListeners
Vue.prototype._d = bindDynamicKeys
Vue.prototype._p = prependModifier
```

并给 Vue.prototype 添加 `$nextTick`、`_render` 方法

二、`src/core/index.js`，主要是添加 Vue 的静态方法、属性，以及在 Vue.prototype 添加 `$isServer`、`$ssrContext` 属性，`FunctionalRenderContext` 函数

1. initGlobalAPI(Vue)，给 Vue 添加类静态方法、属性，添加了：
  1）`Vue.config`
  2）`Vue.util.warn`，用于开发环境警告日志
  3）`Vue.util.extend`，用于合并两个对象，相同属性下后者覆盖前者
  4）`Vue.util.mergeOptions`，用于合并2个 Vue 的 options 对象
  5）`Vue.util.defineReactive`
  6）`Vue.set`
  7）`Vue.delete`
  8）`Vue.netxTick`
  9）`Vue.observable`，调用的 core/observer/index.js 下的 observe 函数
  10）`Vue.options` = {}
  11）`Vue.options.components = { KeepAlive }`，里面挂载了 `keep-alive` 组件
  12）`Vue.options.directives = {}`
  13）`Vue.options.filters = {}`
  14）`Vue.options._base = Vue`
  15）`initUse(Vue)` ，给 Vue 添加了 `Vue.use` 方法
  16）`initMixin(Vue)` ，给 Vue 添加了 `Vue.mixin` 方法，该方法本质上是调用了 `mergeOptions` 方法，将 2 个 Vue 的 options 对象进行合并
  17）`initExtend(Vue)` ，给 Vue 添加了 `Vue.extend` 方法，用于组件继承
  18）`initAssetRegisters(Vue)` ，给 Vue 添加了 `Vue.components(id, definition)` 、`Vue.directives(id, definition)`、`Vue.filters(id, definition)` 函数，这三个函数执行注册时，都是将当前传入的 `definition` 挂载到 `this.options[id]` 上，并未做其他操作
2. 给 Vue.prototype 添加了 `$isServer`、`$ssrContext` 属性，用于判断是否在服务端执行以及 ssr 上下文
3. 给 Vue.prototype 添加了 `FunctionalRenderContext` 函数

三、`src/platforms/web/runtime/index.js`

1. `Vue.config.mustUseProp = mustUseProp`，该函数为判断标签是否需要使用 prop 传参：input,textarea,option,select,progress,option,video
2. `Vue.config.isReservedTag = isReservedTag`，该函数为判断标签是否为保留的标签（dom官方标签）
3. `Vue.config.isReservedAttr = isReservedAttr`，该函数为判断标签属性是否为保留的标签属性（dom官方标签属性）：style,class，用于判断自定义组件中是否自动将 style、class 属性绑定到组件根结点上
4. `Vue.config.getTagNamespace = getTagNamespace`，该函数用于获取标签的所属类型，svg/math
5. `Vue.config.isUnknownElement = isUnknownElement`，该函数用于判断标签是否为 unknown 标签（即非浏览器可识别的标签，如果是服务端渲染，则统一都列为不可识别，因为服务端没有 dom 结构）
6. `extend(Vue.options.directives, platformDirectives)`，添加 `v-model` 和 `v-show` 指令，此时 `Vue.options.directives` 的值更新为 `{ modal, show }`
7. `extend(Vue.options.components, platformComponents)`，添加 `Transition` 和 `TransitionGroup` 组件，此时 `Vue.options.components` 的值更新为 `{ KeepAlive, Transition, TransitionGroup }`
8. `Vue.prototype.__patch__` 如果是在浏览器中，则添加 `patch`，否则则是个 `noop` 空函数
9. `Vue.prototype.$mount` 添加 `$mount` 挂载方法
10. 之后判断如果是 development 版本，且浏览器存在 devtool，则执行 `devtool.emit('init', Vue)`，否则则做 info 提示；如果页面使用了 development 版本且 Vue.config.productionTip 设置为 true 则提示应该使用 production 版本

四、`src/platforms/web/entry-runtime-with-compiller.js`

1. 扩展 `Vue.prototype.$mount`，
2. 添加静态方法 `Vue.compile = compileToFunctions`

## new Vue(options) 执行过程

一、执行 `_init(options)` 方法

1. 每个 vue 实例上都会有 `_uid` 字段，用来标记当前这个实例的唯一 id
2. 添加 `this._isVue = true` 避免将 `this` 实例对象进行 observe 响应式绑定
3. `options._isComponent` 判断是不是组件，如果是组件，则执行 `initInternalComponent(this, options)`，后续：待补充；否则，执行

```javascript
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```

将 Vue.options 与当前的 options 进行合并，如果 options 中存在 extends 或者 mixins，则也将 extends 或 mixins 与 options 进行合并，且相同属性的参数，以下是参数合并的规则：

> mergeOptions(parent, options)，这里 parent 指向 Vue.options，mergeOptions 内部还会再调用自身 parent = mergeOptions(parent, options.extend) 或者遍历 options.mixins （为数组）进行 mergeOptions(parent, mixins[i])；mergeOptions 来自 src/core/utils/options.js 文件，在该文件中初始化好对不同属性的合并逻辑

1）el/propsData: 优先使用后者的属性
2）data: 2 个对象或函数合并，如果是函数，则先执行函数得到返回结果后，再进行合并；相同属性下优先使用后者的属性
3）lifycycle 生命周期合并: 将 key: value 的 value 值转化为数组，将两者推入数组中，且对数组进行去重，避免同个 options 的同个生命周期被多次调用
4）component/directive/filter/props/methods/inject/computed: 2 个对象合并，相同属性下优先使用后者的属性
5）watch: 2 个对象合并，将 key: value 的 value 值转化为数组，将两者推入数组中

4. `vm._renderProxy = vm`
5. `vm._self = vm`
6. 执行 `initLifecycle(vm)`，挂载上:

```javascript
vm.$parent = parent
vm.$root = parent ? parent.$root : vm

vm.$children = []
vm.$refs = {}

vm._watcher = null
vm._inactive = null
vm._directInactive = false
vm._isMounted = false
vm._isDestroyed = false
vm._isBeingDestroyed = false
```

7. 执行 `initEvent(vm)`，该函数主要是针对组件进行处理的，待补充

```javascript
vm._events = Object.create(null)
vm._hasHookEvent = false
// init parent attached events
const listeners = vm.$options._parentListeners
if (listeners) {
  updateComponentListeners(vm, listeners)
}
```

8. 执行 `initRender(vm)`

设置 vnode `vm.$vnode = options._parentVnode`；

获取 slot 插槽，`vm.$slots = resolveSlots(options._renderChildren, renderContext)`；

`vm.$scopedSlots = emptyObject` 设置为空对象；

`vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)`，待补充；

`vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)` ，待补充；

对 `vm.$attrs` 和 `vm.$listeners` 对象设置相应式监听，其值为父节点的值和监听事件：

```javascript
defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
```

9. 执行 `callHook(vm, 'beforeCreate')` ，触发 `beforeCreate` 生命周期，因为这时还未对 data、props、computed 进行处理，因此 `this` 还未能获取到变量的值。支持通过 `vm.$on` 监听 `hook:` 的方式来监听生命周期。

10. 执行 `initInjections(vm)` ，对 options.inject 进行深度监听（即如果属性的值为对象类型，则也进行 observe）

11. 执行 `initState(vm)`

设置 `vm._watchers = []`;

1) 如果 `options.props` 存在，执行 `initProps(vm, opts.props)`，添加 `vm._props = {}`， `vm.$options._propKeys = []`，props 中的 key 都会存入 `vm.$options._propKeys` 数组中，如果当前 vm 实例非根组件，则不对 props 的属性进行深度监听，如果为根组件，则进行深度监听。同时如果 vm[key] 不存在，则设置 vm[key] 的 get 和 set 为直接获取和设置 vm._props[key]，因此我们可以直接通过 `this[key]` 来获取 props 上的变量

2）如果 `options.methods` 存在，执行 `initMethods(vm, opts.methods)`，遍历 methods，执行 `vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)`，因此可以 method 方法中 `this` 指向 `vm`

3）如果 `options.data` 存在，执行 `initData(vm, opts.data)`，否则执行 `observe(vm._data = {}, true /* asRootData */)`。两种方式最后都会添加 `vm._data` 且对其进行 `observe` 进行数据响应式绑定，且对于 data 的属性进行深度监听。同时如果 vm[key] 不存在，则设置 vm[key] 的 get 和 set 为直接获取和设置 vm._data[key]，因此我们可以直接通过 `this[key]` 来获取 data 

4）如果 `options.computed` 存在，执行 `initComputed(vm, opts.computed)`，添加 `vm._computedWatchers = Object.create(null)`，遍历 computed，执行：

```javascript
watchers[key] = new Watcher(
  vm,
  getter || noop, // computed key 对应的函数
  noop,
  computedWatcherOptions // { lazy: true }
)
```

**依赖收集**

在这里，computed 属性作为监听者 watchers[key]，实例化中 vm._watchers.push(this)，vm._watchers 会存储监听者。监听者中添加属性 `this.deps = []`，用于保存依赖项，当 watchers[key] 实例执行 `this.get()` 时，将会自动收集依赖 dep，也就是监听 dep 。

```javascript
get () {
  pushTarget(this)
  let value
  const vm = this.vm
  try {
    value = this.getter.call(vm, vm)
  } catch (e) {
    if (this.user) {
      handleError(e, vm, `getter for watcher "${this.expression}"`)
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value)
    }
    popTarget()
    this.cleanupDeps()
  }
  return value
}
```

而因为之前对 props、data 进行了 `observe` 监听操作，重写了其 `get` 函数：

```javascript
get: function reactiveGetter () {
  const value = getter ? getter.call(obj) : val
  if (Dep.target) {
    dep.depend()
    if (childOb) {
      childOb.dep.depend()
      if (Array.isArray(value)) {
        dependArray(value)
      }
    }
  }
  return value
},
```

dep 执行 `depend` 方法时，会执行 watchers[key] 实例的 `addDep(this)` 方法将 dep 添加为 watchers[key] 的依赖，而 `addDep` 中又会执行 dep 的 `addSub(this)`，给 dep 添加监听者 watchers[key]。

```javascript
addSub (sub: Watcher) {
  this.subs.push(sub)
}

depend () {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
}
```

```javascript
addDep (dep: Dep) {
  const id = dep.id
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    if (!this.depIds.has(id)) {
      dep.addSub(this)
    }
  }
}
```

watchers[key] 最后会执行依赖更新，更新 dep 中的 subs。

```javascript
cleanupDeps () {
  let i = this.deps.length
  while (i--) {
    const dep = this.deps[i]
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this)
    }
  }
  let tmp = this.depIds
  this.depIds = this.newDepIds
  this.newDepIds = tmp
  this.newDepIds.clear()
  tmp = this.deps
  this.deps = this.newDeps
  this.newDeps = tmp
  this.newDeps.length = 0
}
```

至此，dep 中的 `subs` 数组会保存对 watchers[key] 的引用，而 watchers[key] 中的 `deps` 数组保存对 dep 的引用。

**依赖值更新触发监听者更新**

除了对 props 、data 进行 `get` 的劫持，同时也对 `set` 进行了劫持：

```javascript
set: function reactiveSetter (newVal) {
  const value = getter ? getter.call(obj) : val
  /* eslint-disable no-self-compare */
  // 如果新值和旧值相等或者新旧值都为 undefined，则直接 return
  if (newVal === value || (newVal !== newVal && value !== value)) {
    return
  }
  /* eslint-enable no-self-compare */
  if (process.env.NODE_ENV !== 'production' && customSetter) {
    customSetter()
  }
  // #7981: for accessor properties without setter
  if (getter && !setter) return
  if (setter) {
    setter.call(obj, newVal)
  } else {
    val = newVal
  }
  // 更新子属性对象的监听对象
  childOb = !shallow && observe(newVal)
  // 执行更新
  dep.notify()
}
```

重点在最后一句 `dep.notify()`，这句话会通知 dep 的所有 watcher 监听者进行更新：

```javascript
notify () {
  // stabilize the subscriber list first
  const subs = this.subs.slice()
  if (process.env.NODE_ENV !== 'production' && !config.async) {
    // subs aren't sorted in scheduler if not running async
    // we need to sort them now to make sure they fire in correct
    // order
    subs.sort((a, b) => a.id - b.id)
  }
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}
```

watcher 中执行 update：

```javascript
update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
```

一般情况下会执行进 `queueWatcher(this)`，将当前值的更新推进队列中等待更新：

```javascript
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // 已经在执行更新了则将当前的监听器放入到 id 值大于 watcher.id 的监听器之前
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}
```

5）对于 computed，继续执行 `defineComputed(vm, key, userDef)`，Object.defineProperty 定义 vm[key]，对 get 进行劫持：

```javascript
const watcher = this._computedWatchers && this._computedWatchers[key]
if (watcher) {
  if (watcher.dirty) {
    watcher.evaluate()
  }
  /**
   * 如果 Dep.target 存在，则执行 watcher.depend()，因为 computed 依赖 dep 的值，dep 更新时自动更新 computed，但 computed 不会通知到使用 computed 变量的监听者，
   * 需要给当前的监听者也添加上 computed 的 dep 依赖，等 dep 更新时，不只更新 computed，也会触发当前 watcher 的回调执行
   */
  if (Dep.target) {
    watcher.depend()
  }
  return watcher.value
}
```

6）如果 `options.watch` 存在，则执行 `initWatch(vm, opts.watch)`：

```javascript
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}
// $watch 跟 computed 流程不太一样，虽然都是创建 watcher 监听器，但 computed 主要是监听 dep 从 computed 函数中获取到值，expOrFn 为用户定义的 computed 函数，cb 为 noop；
// 而 watch 是监听 dep 然后执行 cb 回调函数（watch 函数作为回调函数），expOrFn 为 watch 的 key，而 cb 为用户定义的 watch 函数；
Vue.prototype.$watch = function (
  expOrFn: string | Function,
  cb: any,
  options?: Object
): Function {
  const vm: Component = this
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options)
  }
  options = options || {}
  options.user = true
  const watcher = new Watcher(vm, expOrFn, cb, options)
  if (options.immediate) {
    const info = `callback for immediate watcher "${watcher.expression}"`
    pushTarget()
    invokeWithErrorHandling(cb, vm, [watcher.value], vm, info)
    popTarget()
  }
  return function unwatchFn () {
    watcher.teardown()
  }
}
```

12. 执行 `initProvide(vm)`，处理 options.provided，如果 provided 为函数，则先执行 `prvided.call(vm)`，然后将执行结果赋值给 `vm._provided`；如果为对象，则直接赋值给 `vm._provided`

13. 执行 `callHook(vm, 'created')`，触发 `created` 生命周期钩子函数，因为已经处理过 inject、props、methods、data、computed、watch、provided，因此这时 `this` 上可以获取到变量和函数了

14. 执行 `vm.$mount(vm.$options.el)`

1）如果没有 options.render ，则为 template 渲染，template 渲染可以通过获取 el 标签下的 html 内容作为 template，也可以开发自己传入 options.template

2）对 template 字符串进行解析：

```javascript
const { render, staticRenderFns } = compileToFunctions(template, {
  outputSourceRange: process.env.NODE_ENV !== 'production',
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref,
  delimiters: options.delimiters,
  comments: options.comments
}, this)
```

之后会将获取到的 render 赋值给 options.render。

**接下来为 template 的 ast 解析**

3）compileToFunctions 函数是经过多个闭包函数得到的，先来梳理这个闭包关系

`src/platforms/web/compiler/index.js`:

```javascript
import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
```

这里 createCompiler(`src/compiler/index.js`) 又是一个闭包，主要为传入 baseOptions，这个 options 在后面多个地方使用。

`src/platforms/web/compiler/options.js`:

```javascript
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
  modules, // 提供了对 class、:class、style、:style，以及 input 标签的 :type、v-for、v-if 的解析；transformNode 函数数组分别有处理 class 和 style 的解析函数；preTransformNode 为解析 input 标签的解析函数
  directives, // 提供了 v-model、v-html、v-text 指令的解析
  isPreTag, // 是否为 pre 标签
  isUnaryTag, // 是否为单标签，area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr
  mustUseProp, // 对于表单的 value、option 的 selected、type="checkbox" 的 input 的 checked、video 的 muted，需使用 prop 参数传递
  canBeLeftOpenTag, // 是否可以自闭合标签，colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source
  isReservedTag, // 是否为平台保留标签（跟保留字类似），即所有的 html 标签
  getTagNamespace, // 获取标签是否为 svg 类型的标签（svg、circle、g等），或者是否为 math 标签
  staticKeys: genStaticKeys(modules) // 是否为静态属性（ staticClass, staticStyle），标签中的 class 和 style 会被保存在 ast 对象中的 staticClass 和 staticStyle 属性
}
```

`src/compiler/index.js`:

```javascript
import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```

这里 createCompilerCreator(`src/compiler/create-compiler.js`) 仍是个闭包，主要传入 baseCompile 解析函数，这里面主要为 `parse`（解析 ast） 函数，以及 `generate`（将 ast 进行加工） 函数 。

`src/compiler/create-compiler.js`:

```javascript
import { extend } from 'shared/util'
import { detectErrors } from './error-detector'
import { createCompileToFunctionFn } from './to-function'

export function createCompilerCreator (baseCompile: Function): Function {
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions // 这里传入的将是上面我们处理过的 new Vue(options) 中的 options
    ): CompiledResult {
      const finalOptions = Object.create(baseOptions)

      ...
      中间为对 finalOptions 进行处理，将 options 中的 modules、directives 进行合并，将 options 其他 key 赋值给 finalOptions
      ...

      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```

这个闭包的作用是传入 basecompile，而 createCompileToFunctionFn(`src/compiler/to-function.js`) 依旧是个闭包。

`src/compiler/to-function.js`:

```javascript
export function createCompileToFunctionFn (compile: Function): Function {
  const cache = Object.create(null)

  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    options = extend({}, options) // 对 options 进行浅拷贝
    const warn = options.warn || baseWarn
    delete options.warn

    // check cache
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    if (cache[key]) {
      return cache[key]
    }

    // compile
    const compiled = compile(template, options)

    // turn code into functions
    const res = {}
    const fnGenErrors = []
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    return (cache[key] = res)
  }
}
```

这个闭包的作用在于将 template 的解析结果进行缓存，避免重复解析消耗性能。

4）代码执行进入 `src/compiler/create-compiler.js` 的 `const compiled = baseCompile(template.trim(), finalOptions)`，走进 `src/compiler/index.js` 的 basecompile，主要看 `const ast = parse(template.trim(), options)` 的执行，对 template 进行 ast 解析，进入 `src/compiler/parser/index.js`。

5）对 template html 模板字符串进行 ast 解析

```javascript
const ast = parse(template.trim(), options)
```

进入到 `src/compiler/parser/index.js`，查看 `parse` 函数，里面调用了 `src/compiler/parser/html-parser.js` 的 `parseHTML`，定义了 `start` 处理开始标签、`end` 处理结束标签、`chars` 处理字符串、`comment` 处理注释，`parseHTML` 主要作用为使用正则表达式对 template 进行逐步解析，解析出标签名、属性、start、end。之后在 `start`、`end`、`chars` 函数中解析标签的 ref、v-if、v-for、slot、v-bind、component、attrs 等。

解析后的 ast 值为：

![](https://tva1.sinaimg.cn/large/008i3skNly1guki9cy8xkj612i0u0djx02.jpg)

6）generate 将 ast 转成函数字符串

```javascript
const code = generate(ast, options)
// code 值为 'with(this){return _c('div',{attrs:{"id":"app"}},[_c('div',[_c('div',{ref:"firstDom"},[_v("data: "+_s(firstName))]),_v(" "),_c('div',[_c('input',{directives:[{name:"model",rawName:"v-model",value:(firstName),expression:"firstName"}],domProps:{"value":(firstName)},on:{"input":function($event){if($event.target.composing)return;firstName=$event.target.value}}}),_v(" "),_c('button',{on:{"click":reset}},[_v("reset")])]),_v(" "),_c('div',[_v("computed: "+_s(fullName))]),_v(" "),_c('div',[_v("watch: "+_s(reverseFirstName))])])])}'
```

之后通过 `new Function(code)` 将 code 字符串转换为 function，便于执行，将 function 赋值给 options.render

```javascript
function render () {
  with(this) {
    return _c('div', {
      attrs: {
        "id": "app"
      }
    }, [_c('div', [_c('div', {
      ref: "firstDom"
    }, [_v("data: " + _s(firstName))]), _v(" "), _c('div', [_c('input', {
      directives: [{
        name: "model",
        rawName: "v-model",
        value: (firstName),
        expression: "firstName"
      }],
      domProps: {
        "value": (firstName)
      },
      on: {
        "input": function ($event) {
          if ($event.target.composing) return;
          firstName = $event.target.value
        }
      }
    }), _v(" "), _c('button', {
      on: {
        "click": reset
      }
    }, [_v("reset")])]), _v(" "), _c('div', [_v("computed: " + _s(fullName))]), _v(" "), _c('div', [_v("watch: " + _s(reverseFirstName))])])])
  }
}
```

**ast解析结束**

15. 进入到 `src/core/instance/lifecycle.js` 中的 `mountComponent` 函数：

触发 `callHook(vm, 'beforeMount')` 生命周期函数。

```javascript
let updateComponent
updateComponent = () => {
  vm._update(vm._render(), hydrating) // 这里 _render 是之前 vue 初始化时 renderMixin 挂在原型上的
}
new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
```

创建一个监听器 watcher ，执行 `vm._update(vm._render(), hydrating)`，这里 _render 是之前 vue 初始化时 renderMixin 挂在原型上的，里面会执行通过 template 解析获取到的 `render` 函数，因为 data、props、computed 中的变量在 vue 实例化 create 阶段就已经设置了原型 set、get 拦截，因此 `render` 函数本质上是一个更大一点的监听器，跟 computed 的变量类似，当执行 `render` 时，依赖的 data、props、computed 变量会自动进行依赖收集，这样等 data、props、computed 更新时，会触发重新执行 `render` 函数。

创建一个新的 watcher 时，还传入了 `before` 参数，在每次更新的时候，会先触发 `callHook(vm, 'beforeUpdate')` 生命周期函数。

16. 创建监听器后，会立马执行一次监听器的 get 函数，进而触发 `src/core/instance/render.js` 的 `_render` 函数，之后触发 template 解析获得的 `render` 函数，之后得到一个 virtual dom 的 vnode 节点。

17. 执行 `vm._update(vm._render(), hydrating)` ，从 vm._render() 获取到一个 vnode 实例，执行进入 `_update` (src/core/instance/lifecycle.js)，执行：

```javascript
if (!prevVnode) {
  // initial render
  vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
} else {
  // updates
  vm.$el = vm.__patch__(prevVnode, vnode)
}
```

当实例首次渲染时，执行 `vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)`；如果为非首次渲染，则表示页面上已经渲染内容了，这时候执行 `vm.$el = vm.__patch__(prevVnode, vnode)`，这里将会进行节点 diff 计算（diff 算法）。

> diff 算法先提前看下其他人分析的主要逻辑，那么看下面就比较清晰了：https://segmentfault.com/a/1190000008782928

18. 接下来看 `vm.__patch__`(src/platforms/web/runtime/index.js)，`patch` 函数来自 `src/platforms/web/runtime/patch.js`,

```javascript
/* @flow */

import * as nodeOps from 'web/runtime/node-ops' // dom 节点操作的方法封装
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index' // 
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```

modules 是对 attrs, class, dom-props(input value), events, style, transition 的处理（标签属性设置、类名设置、dom 标签节点属性设置，如 input.value 、事件绑定、style 设置、transition 组件的 enter 设置）

19. 转到 `src/core/vdom/patch.js`，`createPatchFunction` 是个闭包，定义了 `cbs` 存储 hooks 函数，vnode 节点渲染为浏览器真实 dom 节点，内部定义了 `['create', 'activate', 'update', 'remove', 'destroy']` 生命周期 hooks，每个 hooks 钩子函数来自于 `modules`

```javascript
let i, j
const cbs = {}

const { modules, nodeOps } = backend

for (i = 0; i < hooks.length; ++i) {
  cbs[hooks[i]] = []
  for (j = 0; j < modules.length; ++j) {
    if (isDef(modules[j][hooks[i]])) {
      cbs[hooks[i]].push(modules[j][hooks[i]])
    }
  }
}
```

此外定义了一些函数，并最后返回一个 `patch` 函数，前面的 `vm.__patch__` 就是执行这里返回的 `patch` 函数。

20. `patch` 函数中，传入参数 `patch (oldVnode, vnode, hydrating, removeOnly)` 主要分 2 种情况：

1）如果 oldVnode 为非真实 dom 节点，且 oldVnode 和 vnode 为 sameVnode ，则进行 `patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)` 这里就是网上常说的 diff

> vue 首次渲染时 oldVnode 为 el dom 节点（如 <div id="app"></div>）

2）如果 oldVnode 为真实 dom 节点，或者 oldVnode 和 vnode 不是 sameVnode，则直接丢弃 oldVnode，使用新的 vnode 进行渲染（将 dom 节点进行 `removeVnodes` 或 oldVnode 进行 `invokeDestroyHook`）

21. 看下 `sameVnode` 函数：

```javascript
function sameVnode (a, b) {
  return (
    a.key === b.key &&
    a.asyncFactory === b.asyncFactory && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```

什么情况下两个 vnode 是 sameVnode：

1）2 个 vnode 的 key 相同（若无指定 key 属性，则 key 属性为 undefined，也视为相同的 key）；
2）2 个 vnode 的 asyncFactory 相同，即构造方法相同，对于 html 标签则为 undefined，对于 component 组件则为 component 的 Ctor
3）2 个 vnode 的 tag 相同且 isComment 相同且 data 都有定义，且 input 的 type 相同，或者 oldVnode.isAsyncPlaceholder 为 true，vnode.asyncFactory.error 为 undefined

其实主要就是看 key，以及是不是同一类标签或者组件。

21. 分析 20.2 首次渲染的情况，根据 vnode 创建 dom 节点渲染

```javascript
createElm(
  vnode,
  insertedVnodeQueue,
  // extremely rare edge case: do not insert if old element is in a
  // leaving transition. Only happens when combining transition +
  // keep-alive + HOCs. (#4590)
  oldElm._leaveCb ? null : parentElm,
  nodeOps.nextSibling(oldElm)
)
```

这里面 vue 的事件绑定策略是：用 addEventListener，直接给目标节点绑定事件，与 preact 一致；
而 react 是使用事件合成机制，通过事件冒泡（事件委托）来实现，事件绑定在 document 上，通过冒泡方式来触发对应节点的事件。

vue 的事件绑定还不是直接将开发者定义的事件函数直接绑定上去，如 `<div @click="handleClick"></div>` 不会直接将 `handleClick` 绑定到 div 的 click 事件上，而是给 div 的 click 事件绑定一个桥接函数，该函数中存储开发者定义好的 `事件函数数组`，也就是在事件绑定时中间加了一层处理，这样的好处就是在进行 diff 算法时，对于节点事件函数的 diff，可以只通过修改 `事件函数数组` 达到修改，而不用先 removeEventListener 再进行 addEventListener。

> 事件的逻辑在 `src/platforms/web/runtime/modules/events.js` 中

21. 分析 `patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)` diff 逻辑，

```javascript
let i
const data = vnode.data
if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
  i(oldVnode, vnode)
}

const oldCh = oldVnode.children
const ch = vnode.children
if (isDef(data) && isPatchable(vnode)) {
  for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
  if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
}
```

通过 hooks 对 oldVnode 的 dom 节点进行更新。

如果 oldVnode.children 不存在，而 vnode.children 存在，则对 vnode 执行 `addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)`；
如果 vnode.children 不存在，而 oldVnode.children 存在，则对 vnode 执行 `removeVnodes(oldCh, 0, oldCh.length - 1)`；
如果 oldVnode.children 和 oldVnode.children 均存在，则需要对两者进行 diff，执行 `updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)`：

diff 的同级比较算法：
定义 oldStartIdx, oldEndIdx, newStartIdx, newEndIdx, oldStartVnode, oldEndVnode, newStartVnode, newEndVnode
sameVnode 比较时，如果 key 相同（2个 key 为 undefined 也相同）且构造函数相同 asyncFactory (如同个 html 标签或者同个 vue 组件)，则认为相同，可进行复用
当 oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx 时
1. 比较 oldStartVnode 和 newStartVnode，如果为同个 vnode，则进行 patchVnode, oldStartIdx + 1, newStartIdx + 1
2. 比较 oldEndVnode 和 newEndVnode，如果为同个 vnode，则进行 patchVnode, oldEndIdx - 1, newEndIdx - 1
3. 比较 oldStartVnode 和 newEndVnode，如果为同个 vnode，则进行 patchVnode, oldStartIdx + 1, newEndIdx - 1
4. 比较 oldEndVnode 和 newStartVnode，如果为同个 vnode，则进行 patchVnode, oldEndIdx - 1, newStartIdx + 1
5. 找出 newStartVnode 在 oldCh 中的 sameVnode 的下标 idxInOld, newStartIdx + 1, oldCh[idxInOld] 设置为 undefined

当循环结束时：
1. 若 newCh 剩余节点时 ( oldStartIdx > oldEndIdx), 将剩下的 newCh add 上
2. 否则，即 oldCh 剩余节点，将剩下的 oldCh remove 掉


----

至此，vue 2.0 源码核心内容基本过完。