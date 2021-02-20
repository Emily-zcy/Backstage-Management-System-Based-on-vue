// 项目发布阶段需要使用到的Babel插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // ...为展开运算符，表示将prodPlugins数组里的每一项展开放到该数组中
    // 发布产品时候的插件数组
    ...prodPlugins,
    // 'transform-remove-console',
    '@babel/plugin-syntax-dynamic-import'
  ]
}
