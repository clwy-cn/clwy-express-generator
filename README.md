[![Express Logo](https://i.cloudup.com/zfY6lL7eFa-3000x3000.png)](http://expressjs.com/)

[Express'](https://www.npmjs.com/package/express) application generator.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][github-actions-ci-image]][github-actions-ci-url]
[![Windows Build][appveyor-image]][appveyor-url]

Forked from [express-generator](https://github.com/expressjs/generator), this project is a fork with some new features.

## Features

- **🚀 Support for ES6 syntax**: The project now supports using ES6 syntax, making the code more modern and concise.
- **🔀 Split routes**: The route files are now split into separate files, making them easier to manage and maintain.
- **📁 Added middleware folder**: A new middleware folder has been added to store various middleware, improving the modularity of the code.
- **🔧 Added environment variable configuration file**: The project now includes a configuration file for environment variables, making it easier to manage different environments.
- **🔄 nodemon has been added**: The project now uses nodemon by default, automatically restarting the server during development when file changes are detected.

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

Forked from [express-generator](https://github.com/expressjs/generator)，此项目是从这个项目派生而来，并添加了一些新特性。

## 功能特性

- **🚀 支持ES6语法**：项目现在支持使用ES6语法，使代码更加现代化和简洁。
- **🔀 分割路由**：路由文件现在被拆分到单独的文件中，使它们更易于管理和维护。
- **📁 新增中间件文件夹**：添加了一个新的中间件文件夹来存放各种中间件，提高了代码的模块化。
- **🔧 添加环境变量配置文件**：项目现在包含一个环境变量的配置文件，使管理不同环境变得更加容易。
- **🔄 增加了 nodemon**: 项目现在默认使用 nodemon，在开发过程中，当文件发生变化时会自动重启服务。

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

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/express-generator.svg
[npm-url]: https://npmjs.org/package/express-generator
[appveyor-image]: https://img.shields.io/appveyor/ci/dougwilson/generator/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/dougwilson/generator
[downloads-image]: https://img.shields.io/npm/dm/express-generator.svg
[downloads-url]: https://npmjs.org/package/express-generator
[github-actions-ci-image]: https://img.shields.io/github/workflow/status/expressjs/generator/ci/master?label=linux
[github-actions-ci-url]: https://github.com/expressjs/generator/actions/workflows/ci.yml
