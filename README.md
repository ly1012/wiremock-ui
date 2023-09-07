
WireMock UI 基于 [Wiremock](https://wiremock.org/) Admin API 开发，用于 Stub Mapping 数据的可视化管理。

本项目为前端项目，仅提供可视化数据管理功能，不提供 Wiremock 实例服务管理、用户管理等功能。

如有需要请使用官方的 [Wiremock Cloud](https://www.wiremock.io/) 服务，或自行开发。

## 1. 使用说明

**使用步骤**

1. 启动一个 Wiremock 服务，参考 [webhooks-and-callbacks](https://wiremock.org/docs/webhooks-and-callbacks/)。
2. 访问 https://qadoc.cn/wiremock，添加一个项目，填写服务地址。
3. 选择刚添加的项目，开始使用（项目数据存放在浏览器的 LocalStorage）。

### 1.1. 在线使用

推荐使用在线网站 https://qadoc.cn/wiremock

### 1.2. 本地启动

1. `npm install` 安装项目依赖。
2. 以开发模式启动项目：`npm run dev`。

### 1.3. 私有部署

1. `npm install` 安装项目依赖。
2. 生产环境打包：`npm run build`。
3. 将打包后生成的 dist 目录下的文件部署到相应服务器下。这里以 Nginx 为例。

**IP和PORT部署**

執行時請先設定好環境變數

Hostname: VITE_HOST

Port: VITE_PORT

範例:

export VITE_HOST='0.0.0.0'

export VITE_PORT=5173


**域名部署**

vite.config.ts 基础路径配置。

```
base: './',
```

Nginx 配置。


```
    location / {
        root /home/wwwroot/wiremock_ui;
        index index.html;
        try_files $uri $uri/ index.html;
    }
```

**二级目录部署**

vite.config.ts 中修改二级目录路径，这里是 wiremock。

```
base: '/wiremock',
```

Nginx 配置。

```
    location ^~ /wiremock {
        alias /home/wwwroot/wiremock_ui/;
        index index.html;
        try_files $uri $uri/ /wiremock/index.html;
    }
```

## 2. 开发项目

推荐开发环境：VSCode + Vue Language Features (Volar) 插件。

- 以开发模式启动项目：`npm run dev`。
- 运行单元测试：`npm run test:unit`。

## 3. Todo List

- [ ] feature：Stubs - 详情页 - request - JSON/XML/HTML 编辑器
- [ ] feature：Stubs - 详情页 - request - customMatcher
- [ ] feature：Stubs - 详情页 - response - transformers
- [ ] feature：Stubs - 详情页 - 表单校验
- [ ] feature：Stubs - 搜索 - 高级搜索
- [ ] feature：Stubs - Record
- [ ] feature：Stubs - Import
- [ ] feature：Stubs - 场景管理
- [ ] feature：Stubs - 文件管理
- [ ] feature：Logs - 日志详情页 - 表单形式展示
- [ ] feature：Logs - 搜索 - 高级搜索
- [ ] feature：Settings - 语言选择
- [ ] feature：Settings - Wiremock 全局设置
- [ ] feature：Settings - 关机
- [ ] feature：Settings - 在线/离线检测？
- [ ] fix：重构详情页渲染数据结构（分块：general/request/response/postserveactions）


