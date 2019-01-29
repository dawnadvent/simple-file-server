# 简介

由于chfs自带的前端页面显示内容太窄，于是参考chfs的api文档，新开发了一个简单的文件服务器的前端页面(chfs gui)。

后端直接使用chfs(Cute Http File Server）作为服务端。

目前支持windows和linux两个平台。

## 效果预览

![](https://qooop.github.io/images/file-server-index.png "首页")

![](https://qooop.github.io/images/file-server-upload.png "文件上传")

## 安装依赖
```
npm install
```

### 启动后端http服务
```
npm run http-server
```

### 新开一个终端，启动前端页面服务
```
npm run serve
```

### 前端页面打包
```
npm run build
```
