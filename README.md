[![Express Logo](https://i.cloudup.com/zfY6lL7eFa-3000x3000.png)](http://expressjs.com/)

# [Express](https://www.npmjs.com/package/express) 应用程序生成器。

**此项目基于 [express-generator](https://github.com/expressjs/generator) 分叉而来，并新增了一些功能特性。**

**其中，ES6 支持的实现参考了 [Dr. Jeff Jackson](https://github.com/drjeffjackson) 提交的 [Pull Request](https://github.com/expressjs/generator/pull/316)，并在其基础上进行了进一步优化和调整。**

## 功能特性

- **🚀 ES6支持**：代码更现代简洁。
- **🔀 路由拆分**：独立文件，便于管理维护。
- **📁 中间件模块化**：新增文件夹存放中间件。
- **🔧 增加环境变量配置**：多环境管理更便捷。
- **🔄 集成nodemon**：开发时自动重启服务。
- **📄 新增 README.md**：包含项目简介和基本功能说明。
- **📦 内置配置**：默认包含`.prettierrc`（代码格式化）和`.gitignore`（文件忽略）。

## 快速开始

使用express最快的方式是利用可执行文件`express(1)`来生成一个应用，如下所示：

创建应用：

```bash
$ npx clwy-express-generator --view=ejs --es6 es6-demo && cd es6-demo
```

安装依赖：

```bash
$ npm install
```

在 `http://localhost:3000/` 启动您的 Express.js 应用：

```bash
$ npm start
```

## 命令行选项

此生成器还可以通过以下命令行标志进行进一步配置。

        --version        输出版本号
    -v, --view <engine>  添加视图引擎 <engine> 支持 (dust|ejs|hbs|hjs|pug|twig|vash|api)（默认为 ejs）
        --no-view        使用静态html而不是视图引擎
    -c, --css <engine>   添加样式表引擎 <engine> 支持 (less|stylus|compass|sass)（默认为纯 css）
        --git            添加 .gitignore 文件
        --es6            生成 ES6 代码和模块类型项目（需要Node 14.x或更高版本）
    -o, --orm            使用 Prisma ORM
    -f, --force          强制在非空目录上操作
    -h, --help           输出使用信息

------------

# [Express'](https://www.npmjs.com/package/express) application generator.

**This project is a fork of [express-generator](https://github.com/expressjs/generator), enhanced with new features.**

**The ES6 support was adapted and improved from [Dr Jeff Jackson](https://github.com/drjeffjackson)'s [Pull Request](https://github.com/expressjs/generator/pull/316).**

## Features

- **🚀 ES6 Support**: Modern and cleaner code.
- **🔀 Split Routes**: Separate files for easier management and maintenance.
- **📁 Modular Middleware**: Dedicated folder for middleware.
- **🔧 Environment Variables**: Easier multi-environment configuration.
- **🔄 Nodemon Integration**: Auto-restart during development.
- **📄 Added basic README.md**: Describes the project as a simple Express app with static file serving and basic routing.
- **📦 Built-in Configs**: Includes `.prettierrc` (code formatting) and `.gitignore` (file exclusion) by default.

## Quick Start

The quickest way to get started with express is to utilize the executable `express(1)` to generate an application as shown below:

Create the app:

```bash
$ npx clwy-express-generator --view=ejs --es6 es6-demo && cd es6-demo
```

Install dependencies:

```bash
$ npm install
```

Start your Express.js app at `http://localhost:3000/`:

```bash
$ npm start
```

## Command Line Options

This generator can also be further configured with the following command line flags.

        --version        output the version number
    -v, --view <engine>  add view <engine> support (dust|ejs|hbs|hjs|pug|twig|vash|api) (defaults to ejs)
        --no-view        use static html instead of view engine
    -c, --css <engine>   add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)
        --git            add .gitignore
        --es6            generate ES6 code and module-type project (requires Node 14.x or higher)
    -o, --orm            use the Prisma ORM
    -f, --force          force on non-empty directory
    -h, --help           output usage information

------------

## License

[MIT](LICENSE)
