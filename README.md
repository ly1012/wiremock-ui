WireMock UI 基於 [Wiremock](https://wiremock.org/) Admin API 開發，用於 Stub Mapping 數據的可視化管理。

本項目為前端項目，僅提供可視化數據管理功能，不提供 Wiremock 實例服務管理、用戶管理等功能。

如有需要請使用官方的 [Wiremock Cloud](https://www.wiremock.io/) 服務，或自行開發。

## 1. 使用說明

**使用步驟**

1. 啟動一個 Wiremock 服務，參考 [webhooks-and-callbacks](https://wiremock.org/docs/webhooks-and-callbacks/)。
2. 訪問 https://qadoc.cn/wiremock，添加一個項目，填寫服務地址。
3. 選擇剛添加的項目，開始使用（項目數據存放在瀏覽器的 LocalStorage）。

### 1.1. 在線使用

推薦使用在線網站 https://qadoc.cn/wiremock

### 1.2. 本地啟動

1. `npm install` 安裝項目依賴。
2. 以開發模式啟動項目：`npm run dev`。

### 1.3. 私有部署

1. `npm install` 安裝項目依賴。
2. 生產環境打包：`npm run build`。
3. 將打包後生成的 dist 目錄下的文件部署到相應服務器下。這里以 Nginx 為例。

**域名部署**

vite.config.ts 基礎路徑配置。

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

**IP和PORT部署**

執行時請先設定好環境變數

Hostname: VITE_HOST

Port: VITE_PORT

範例:

export VITE_HOST='0.0.0.0'

export VITE_PORT=5173


**二級目錄部署**

vite.config.ts 中修改二級目錄路徑，這裡是 wiremock。

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

## 2. 開發項目

推薦開發環境：VSCode + Vue Language Features (Volar) 插件。

- 以開發模式啟動項目：`npm run dev`。
- 運行單元測試：`npm run test:unit`。

## 3. Todo List

- [ ] feature：Stubs - 詳情頁 - request - JSON/XML/HTML 編輯器
- [ ] feature：Stubs - 詳情頁 - request - customMatcher
- [ ] feature：Stubs - 詳情頁 - response - transformers
- [ ] feature：Stubs - 詳情頁 - 表單校驗
- [ ] feature：Stubs - 搜索 - 高級搜索
- [ ] feature：Stubs - Record
- [ ] feature：Stubs - Import
- [ ] feature：Stubs - 場景管理
- [ ] feature：Stubs - 文件管理
- [ ] feature：Logs - 日誌詳情頁 - 表單形式展示
- [ ] feature：Logs - 搜索 - 高級搜索
- [ ] feature：Settings - 語言選擇
- [ ] feature：Settings - Wiremock 全局設置
- [ ] feature：Settings - 關機
- [ ] feature：Settings - 在線/離線檢測？
- [ ] fix：重構詳情頁渲染數據結構（分塊：general/request/response/postserveactions）