test
====

nodejs实践之socket.io--聊天室

1. 初始化：
  npm install
2. 运行
  node index.js
3. 浏览器中预览： 127.0.0.1:3000或者本地可用域名:3000(local.test.com:3000)
4. 备注：
  a. 当前cluster与socket.io之间有兼容问题，待修(已解决，参考https://github.com/elad/node-cluster-socket.io)
  b. js压缩采用uglify,具体可在gruntfile.js中配置
  c. 样式以bootstrap为基础
  d. 仿照socket.io官网给出的例子，具体见：http://chat.socket.io/