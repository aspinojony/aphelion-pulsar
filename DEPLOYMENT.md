# Aphelion Pulsar 部署指南

## 🚀 生产部署步骤

### 1. 安装依赖
```bash
npm install --production
```

### 2. 构建生产版本
```bash
npm run build
```

### 3. 配置环境变量
复制 `.env.production` 并根据您的服务器配置修改：
```bash
cp .env.production .env
```

### 4. 启动应用

#### 方式一：使用 PM2（推荐）
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.json

# 查看状态
pm2 status

# 查看日志
pm2 logs aphelion-pulsar

# 设置开机自启
pm2 startup
pm2 save
```

#### 方式二：直接启动
```bash
npm start
```

## 📊 内存优化措施

### 已实施的优化：

1. **数据库连接池**
   - ✅ 使用单例模式防止连接泄漏
   - ✅ SQLite 内存占用小（约 10-20MB）

2. **前端优化**
   - ✅ 聊天轮询间隔从 3秒 增加到 10秒
   - ✅ 启用 gzip 压缩
   - ✅ 图片格式优化（WebP/AVIF）
   - ✅ 代码分割和懒加载

3. **构建优化**
   - ✅ 生产环境移除 console.log
   - ✅ Standalone 输出模式（减少依赖）
   - ✅ 包导入优化

4. **进程管理**
   - ✅ PM2 内存限制：512MB
   - ✅ 自动重启机制
   - ✅ 日志轮转

## 🔧 服务器要求

### 最低配置：
- **CPU**: 1 核心
- **内存**: 512MB RAM
- **存储**: 2GB 可用空间
- **系统**: Linux/Windows Server

### 推荐配置：
- **CPU**: 2 核心
- **内存**: 1GB RAM
- **存储**: 5GB 可用空间

## 📈 性能监控

### 使用 PM2 监控
```bash
pm2 monit
```

### 内存使用检查
```bash
pm2 show aphelion-pulsar
```

## 🛡️ 安全建议

1. **环境变量**
   - 修改 `.env` 中的 `SESSION_SECRET`
   - 使用强密码和应用专用密码

2. **防火墙**
   - 只开放必要端口（如 3006）
   - 配置 HTTPS（使用 Nginx 反向代理）

3. **数据库备份**
   ```bash
   # 定期备份数据库
   cp aphelion.db aphelion.db.backup
   ```

## 🔄 更新部署

```bash
# 拉取最新代码
git pull

# 安装依赖
npm install --production

# 重新构建
npm run build

# 重启应用
pm2 restart aphelion-pulsar
```

## 📝 日志管理

日志文件位置：
- 错误日志：`./logs/err.log`
- 输出日志：`./logs/out.log`

清理日志：
```bash
pm2 flush
```

## ⚡ 性能优化建议

1. **使用 CDN** 托管静态资源
2. **启用 Redis** 缓存（可选）
3. **配置 Nginx** 反向代理和负载均衡
4. **定期清理** 数据库和日志文件

## 🆘 故障排查

### 内存占用过高
```bash
# 查看内存使用
pm2 show aphelion-pulsar

# 重启应用
pm2 restart aphelion-pulsar
```

### 应用崩溃
```bash
# 查看错误日志
pm2 logs aphelion-pulsar --err

# 查看所有日志
pm2 logs aphelion-pulsar
```

## 📞 支持

如有问题，请查看日志文件或联系技术支持。
