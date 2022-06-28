import babel from 'rollup-plugin-babel'

// rollup可以导出一个对象作为打包的配置
export default {
  input: './src/index.js',
  output: {
    file: './dist/vue.js',
    name: 'Vue',
    // umd 是一种既兼容 cjs又兼容esm的方式，表示当前代码即可在浏览器中运行又可以在node环境里运行
    format: 'umd', // 模块化的方式
    sourcemap: true
  },
  plugin: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}