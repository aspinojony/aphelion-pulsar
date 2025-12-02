# Aphelion Pulsar 服务器部署完整指南

## 🚀 快速部署（推荐新手）

### 方案一：使用 Vercel（最简单，免费）

1. **访问 Vercel**
   - 前往 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择 `aspinojony/aphelion-pulsar` 仓库
   - 点击 "Import"

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   ```
   NODE_ENV=production
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM="Aphelion Pulsar <your_email@gmail.com>"
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待 2-3 分钟
   - 完成！您的网站会得到一个 `.vercel.app` 域名

**优点**：
- ✅ 完全免费（个人项目）
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署（推送代码即部署）

---

## 🖥️ 自建服务器部署（完全控制）

### 方案二：Linux VPS 部署（推荐）

#### 前置要求
- Linux 服务器（Ubuntu 20.04+ / CentOS 7+）
- 至少 512MB RAM
- Node.js 18+

#### 步骤 1：连接服务器

```bash
# 使用 SSH 连接
ssh root@your_server_ip
```

#### 步骤 2：安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Git
sudo apt install -y git

# 安装 PM2（进程管理器）
sudo npm install -g pm2

# 验证安装
node -v  # 应该显示 v18.x.x
npm -v
pm2 -v
```

#### 步骤 3：克隆项目

```bash
# 创建项目目录
cd /var/www
sudo mkdir aphelion-pulsar
sudo chown $USER:$USER aphelion-pulsar
cd aphelion-pulsar

# 克隆代码
git clone https://github.com/aspinojony/aphelion-pulsar.git .

# 安装依赖
npm install --production
```

#### 步骤 4：配置环境变量

```bash
# 创建 .env 文件
nano .env
```

复制以下内容并修改：
```env
NODE_ENV=production
PORT=3006

# 数据库
DATABASE_URL="file:./aphelion.db"

# SMTP 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Aphelion Pulsar <your_email@gmail.com>"

# 安全配置
SESSION_SECRET=请改为随机字符串
```

保存并退出（Ctrl+X, Y, Enter）

#### 步骤 5：初始化数据库

```bash
# 运行所有迁移脚本
node scripts/migrate-leveling-invites.js
node scripts/migrate-add-avatar.js
node scripts/migrate-add-bio.js
node scripts/migrate-badges.js
node scripts/migrate-features.js
node scripts/migrate-resonance.js
node scripts/migrate-verification.js
node scripts/migrate-friends.js
node scripts/migrate-create-messages.js

# 创建管理员账号
node scripts/set-admin.js

# 查看管理员凭据
node scripts/get-admin-creds.js
```

#### 步骤 6：构建项目

```bash
# 构建生产版本
npm run build

# 测试运行（可选）
npm start
# 访问 http://your_server_ip:3006 测试
# 测试成功后按 Ctrl+C 停止
```

#### 步骤 7：使用 PM2 启动

```bash
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

#### 步骤 8：配置 Nginx 反向代理（推荐）

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/aphelion-pulsar
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your_domain.com;  # 改为您的域名或服务器IP

    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/aphelion-pulsar /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

#### 步骤 9：配置 HTTPS（可选但推荐）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书（需要域名）
sudo certbot --nginx -d your_domain.com

# 自动续期
sudo certbot renew --dry-run
```

#### 步骤 10：配置防火墙

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH

# 启用防火墙
sudo ufw enable
sudo ufw status
```

---

## 🔄 日常维护

### 更新代码
```bash
cd /var/www/aphelion-pulsar
git pull
npm install --production
npm run build
pm2 restart aphelion-pulsar
```

### 查看日志
```bash
pm2 logs aphelion-pulsar
pm2 logs aphelion-pulsar --err  # 只看错误
```

### 备份数据库
```bash
cp aphelion.db aphelion.db.backup-$(date +%Y%m%d)
```

### 监控资源
```bash
pm2 monit
```

---

## 🐛 故障排查

### 应用无法启动
```bash
# 查看详细日志
pm2 logs aphelion-pulsar --lines 100

# 检查端口占用
sudo netstat -tulpn | grep 3006

# 重启应用
pm2 restart aphelion-pulsar
```

### 内存不足
```bash
# 查看内存使用
free -h
pm2 show aphelion-pulsar

# 重启释放内存
pm2 restart aphelion-pulsar
```

### 数据库错误
```bash
# 检查数据库文件权限
ls -la aphelion.db

# 修复权限
chmod 644 aphelion.db
```

---

## 📊 性能优化建议

1. **启用 Gzip 压缩**（Nginx 已配置）
2. **配置缓存**
   ```nginx
   # 在 Nginx 配置中添加
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **定期清理日志**
   ```bash
   pm2 flush
   ```

4. **监控磁盘空间**
   ```bash
   df -h
   ```

---

## 🆘 获取帮助

- 查看日志：`pm2 logs aphelion-pulsar`
- PM2 文档：https://pm2.keymetrics.io/
- Next.js 部署：https://nextjs.org/docs/deployment

---

## ✅ 部署检查清单

- [ ] 服务器已安装 Node.js 18+
- [ ] 代码已克隆到服务器
- [ ] 环境变量已配置
- [ ] 数据库已初始化
- [ ] 项目已构建
- [ ] PM2 已启动应用
- [ ] Nginx 反向代理已配置
- [ ] 防火墙已配置
- [ ] HTTPS 证书已安装（可选）
- [ ] 开机自启已设置

完成以上步骤后，您的博客就成功部署了！🎉
