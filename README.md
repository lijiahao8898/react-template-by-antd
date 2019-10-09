### 编译出配置文件

```
npm run eject
```

### 支持sass
```
npm install sass-loader node-sass --save-dev
```

修改 `webpack.config.dev.js` 和 `webpack.config.prod.js`

```
{
    loader: require.resolve('file-loader'),
    // Exclude `js` files to keep "css" loader working as it injects
    // it's runtime that would otherwise processed through "file" loader.
    // Also exclude `html` and `json` extensions so they get processed
    // by webpacks internal loaders.
    exclude: [/\.js$/, /\.html$/, /\.json$/,/\.scss$/],
    options: {
         name: 'static/media/[name].[hash:8].[ext]',
    },
},
{
    test: /\.scss$/,
    loaders: ['style-loader', 'css-loader', 'sass-loader'],
}
```

### ant-design 实现按需加载

`babel-plugin-import` 是一个用于按需加载组件代码和样式的 `babel` 插件（原理），现在我们尝试安装它并修改 `config/webpack.config.dev.js` 文件。

```
npm install babel-plugin-import --save-dev
```

```js
// Process JS with Babel.
{
  test: /\.(js|jsx)$/,
  include: paths.appSrc,
  loader: 'babel',
  query: {
+   plugins: [
+     ['import', [{ libraryName: "antd", style: 'css' }]],
+   ],
    // This is a feature of `babel-loader` for webpack (not Babel itself).
    // It enables caching results in ./node_modules/.cache/babel-loader/
    // directory for faster rebuilds.
    cacheDirectory: true
  }
},
```

> 注意，由于 `create-react-app eject` 之后的配置中没有 `.babelrc` 文件，所以需要把配置放到 `webpack.config.js` 或 `package.json` 的 `babel` 属性中。

然后移除前面在 `src/App.css` 里全量添加的 ``@import '~antd/dist/antd.css'`; 样式代码，现在 `babel-plugin-import` 会按需加载样式。
最后重启 `yarn start` 访问页面，此时上面的警告信息应该没了，`antd` 组件的 `js` 和 `css` 代码都会按需加载。

### 配置代理

在 `package.json` 中增加配置：
```json
"proxy": {
    "/api": {
      "target": "http://172.20.20.200:31003",
      "changeOrigin": true,
      "pathRewrite": {
        "^/api": ""
      }
    }
  }
```
