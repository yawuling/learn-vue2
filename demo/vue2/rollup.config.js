import babel from 'rollup-plugin-babel'

// rollup可以导出一个对象作为打包的配置
export default {
  input: './src/index.js',
  output: {
    file: './dist/vue.js',
    name: 'Vue',
    format: 'umd', // cmd amd
    sourcemap: true
  },
  plugin: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}