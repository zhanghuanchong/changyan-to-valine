# 畅言 -> Valine

导入畅言的留言数据到 Valine 中。Valine 使用 LeanCloud 作为数据存储。

### 使用
* git clone
* npm install
* cp .env.sample .env
* cp xxxx.json data.json # 导出畅言的评论，复制到当前目录下
* vim .env # 修改 APP_ID 和 APP_KEY
* npm run import

### 参考
* Valine: https://valine.js.org
* LeanCloud: https://leancloud.cn/docs/leanstorage-started-js.html
* 畅言评论格式说明: http://changyan.sohu.com/help/b-backup.html
* 阿里云 IP 归属地查询服务：https://market.aliyun.com/products/57000002/cmapi031829.html

### License
MIT