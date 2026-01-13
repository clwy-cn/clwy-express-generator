[![Express Logo](https://i.cloudup.com/zfY6lL7eFa-3000x3000.png)](http://expressjs.com/)

# clwy-express-generator：[Express](https://www.npmjs.com/package/express) 应用程序生成器

**此项目基于 [express-generator](https://github.com/expressjs/generator) 分叉而来，并新增了一些功能特性。**

## 功能特性

- **🚀 ES6 支持**：代码更现代简洁。
- **🔀 路由拆分**：独立文件，便于管理维护。
- **🗄️ ORM 支持**：支持 Sequelize 或 Prisma ORM。
- **📁 中间件模块化**：新增文件夹存放中间件。
- **🔧 增加环境变量配置**：多环境管理更便捷。
- **🔄 集成 nodemon**：开发时自动重启服务。
- **🌐 集成 CORS**：允许跨域请求。
- **📄 新增 README.md**：包含项目简介和基本功能说明。
- **📦 内置配置**：默认包含`.prettierrc`（代码格式化）和`.gitignore`（文件忽略）。

## 快速开始

### 基础使用

使用express最快的方式是利用可执行文件`express(1)`来生成一个应用，如下所示：

创建应用：

```bash
$ npx clwy-express-generator --view=ejs --es6 es6-demo
# 或：npx clwy-express-generator -v=ejs --es6 es6-demo
$ cd es6-demo
```

安装依赖：

```bash
$ npm install
```

在 `http://localhost:3000/` 启动您的 Express.js 应用：

```bash
$ npm start
```

## 使用 ORM

### 使用数据库

安装好 Docker 并启动后：

```bash
$ docker-compose up -d
```

默认将启动 MySQL 数据库，PostgreSQL 和 Redis 配置已在 `docker-compose.yml` 中，请根据需求取消注释。

### 使用 Sequelize

**创建应用：**

```bash
$ npx clwy-express-generator --view=ejs --orm=sequelize --es6 es6-sequelize-demo
$ cd es6-sequelize-demo
$ npm i
```

**根据需求安装数据库引擎：**

```bash
$ npm install --save mysql2 # MySQL
$ npm install --save pg pg-hstore # Postgres
```

### 使用 clwy-sequelize-cli

当使用`--orm=sequelize`创建项目，会默认集成[clwy-sequelize-cli](https://github.com/clwy-cn/clwy-sequelize-cli)，使用以下命令会生成 **ES6** 风格的模型、迁移和种子文件。

**生成模型和迁移文件：**

```bash
$ npx sequelize model:generate --name Article --attributes title:string,content:text
```

**生成种子文件：**

```bash
$ npx sequelize seed:generate --name article
```

### 使用 Prisma

**创建应用：**

```bash
$ npx clwy-express-generator --view=ejs --orm=prisma --es6 es6-prisma-demo
$ cd es6-prisma-demo
$ npm i
```

**初始化数据库客户端：**

```bash
$ npx prisma generate
```

## 命令行选项

此生成器还可以通过以下命令行标志进行进一步配置。

        --version        输出版本号
    -v, --view <engine>  添加视图引擎 <engine> 支持 (dust|ejs|hbs|hjs|pug|twig|vash|api)（默认为 ejs）
        --no-view        使用静态html而不是视图引擎
    -o, --orm <orm>      添加 ORM <orm> 支持 (sequelize|prisma)
    -c, --css <engine>   添加样式表引擎 <engine> 支持 (less|stylus|compass|sass)（默认为纯 css）
        --git            添加 .gitignore 文件
        --es6            生成 ES6 代码和模块类型项目（需要Node 22.x或更高版本）
    -f, --force          强制在非空目录上操作
    -h, --help           输出使用信息

------------

# clwy-express-generator: [Express](https://www.npmjs.com/package/express) Application Generator

**This project is forked from [express-generator](https://github.com/expressjs/generator) with additional features.**

## Features

- **🚀 ES6 Support**: More modern and concise code.
- **🔀 Route Splitting**: Independent files for easier management and maintenance.
- **🗄️ ORM Support**: Supports Prisma or Sequelize ORM.
- **📁 Modular Middleware**: New folder for storing middleware.
- **🔧 Enhanced Environment Variable Configuration**: More convenient multi-environment management.
- **🔄 Integrated Nodemon**: Automatic service restart during development.
- **🌐 Integrated CORS**: Allows cross-origin requests.
- **📄 Added README.md**: Contains project introduction and basic feature descriptions.
- **📦 Built-in Configuration**: Includes `.prettierrc` (code formatting) and `.gitignore` (file ignore) by default.

## Quick Start

### Basic Usage

The fastest way to create an Express application is by using the executable `express(1)` to generate an app, as shown below:

Create the application:

```bash
$ npx clwy-express-generator --view=ejs --es6 es6-demo
$ cd es6-demo
```

Install dependencies:

```bash
$ npm install
```

Start your Express.js app at `http://localhost:3000/`:

```bash
$ npm start
```

## Using ORM

### Using a Database

After installing and starting Docker:

```bash
$ docker-compose up -d
```

By default, the MySQL database will be started. PostgreSQL and Redis configurations are already included in
docker-compose.yml; please uncomment them as needed.

### Using Sequelize

**Create the application:**

```bash
$ npx clwy-express-generator --view=ejs --orm=sequelize --es6 es6-sequelize-demo
$ cd es6-sequelize-demo
$ npm i
```

**Install the database engine as needed:**

```bash
$ npm install --save mysql2 # MySQL
$ npm install --save pg pg-hstore # Postgres
```

### Using clwy-sequelize-cli

When creating a project with`--orm=sequelize`, it will integrate [clwy-sequelize-cli](https://github.com/clwy-cn/clwy-sequelize-cli) by default. The following commands will generate model, migration, and seed files in **ES6 style**.

**Generate model and migration files:**

```bash
$ npx sequelize model:generate --name Article --attributes title:string,content:text
```

**Generate seed file:**

```bash
$ npx sequelize seed:generate --name article
```

### Using Prisma

**Create the application:**

```bash
$ npx clwy-express-generator --view=ejs --orm=prisma --es6 es6-prisma-demo
# or: npx clwy-express-generator -v=ejs -o=prisma --es6 es6-prisma-demo

$ cd es6-prisma-demo
$ npm i
```

**Initialize the database client:**

```bash
$ npx prisma generate
```

## Command Line Options

This generator can be further configured with the following command line flags.

        --version        Output the version number
    -v, --view <engine>  Add view engine <engine> support (dust|ejs|hbs|hjs|pug|twig|vash|api) (defaults to ejs)
        --no-view        Use static HTML instead of a view engine
    -o, --orm <orm>      Add ORM <orm> support (sequelize|prisma)
    -c, --css <engine>   Add stylesheet engine <engine> support (less|stylus|compass|sass) (defaults to plain css)
        --git            Add .gitignore file
        --es6            Generate ES6 code and module type project (requires Node 22.x or higher)
    -f, --force          Force operation on non-empty directory
    -h, --help           Output usage information

------------

## License

[MIT](LICENSE)
