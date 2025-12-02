#!/bin/bash

# Aphelion Pulsar 一键部署脚本（兼容 Ubuntu 18.04）
# 使用 Node.js 16 以兼容旧版本 Ubuntu

set -e

echo "🚀 开始部署 Aphelion Pulsar (Ubuntu 18.04 兼容版)..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    echo "使用: sudo bash deploy-ubuntu18.sh"
    exit 1
fi

# 1. 更新系统
echo -e "${GREEN}[1/10] 更新系统...${NC}"
apt update && apt upgrade -y

# 2. 安装 Node.js 16 (兼容 Ubuntu 18.04)
echo -e "${GREEN}[2/10] 安装 Node.js 16.x...${NC}"
if ! command -v node &> /dev/null; then
    # 移除可能存在的旧源
    rm -f /etc/apt/sources.list.d/nodesource.list
    
    # 安装 Node.js 16
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    apt install -y nodejs
fi
echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

# 3. 安装 Git
echo -e "${GREEN}[3/10] 安装 Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
fi

# 4. 安装 PM2
echo -e "${GREEN}[4/10] 安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 5. 创建项目目录
echo -e "${GREEN}[5/10] 创建项目目录...${NC}"
PROJECT_DIR="/var/www/aphelion-pulsar"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 6. 克隆代码
echo -e "${GREEN}[6/10] 克隆代码...${NC}"
if [ ! -d ".git" ]; then
    git clone https://github.com/aspinojony/aphelion-pulsar.git .
else
    echo "代码已存在，执行 git pull..."
    git pull
fi

# 7. 安装依赖
echo -e "${GREEN}[7/10] 安装依赖...${NC}"
npm install

# 8. 配置环境变量
echo -e "${GREEN}[8/10] 配置环境变量...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}创建 .env 文件...${NC}"
    cp .env.production .env
    echo ""
    echo -e "${YELLOW}==================================================${NC}"
    echo -e "${YELLOW}重要：请编辑 .env 文件并配置您的邮箱信息${NC}"
    echo -e "${YELLOW}==================================================${NC}"
    echo ""
    echo "执行以下命令编辑配置："
    echo "  nano $PROJECT_DIR/.env"
    echo ""
    echo "需要修改的内容："
    echo "  - SMTP_USER: 您的 Gmail 邮箱"
    echo "  - SMTP_PASS: 您的应用专用密码"
    echo "  - EMAIL_FROM: 发件人信息"
    echo "  - SESSION_SECRET: 随机字符串"
    echo ""
    echo -e "${YELLOW}配置完成后，运行以下命令继续：${NC}"
    echo "  cd $PROJECT_DIR"
    echo "  sudo bash deploy-ubuntu18.sh --continue"
    echo ""
    exit 0
fi

# 9. 初始化数据库
echo -e "${GREEN}[9/10] 初始化数据库...${NC}"
node scripts/migrate-leveling-invites.js || true
node scripts/migrate-add-avatar.js || true
node scripts/migrate-add-bio.js || true
node scripts/migrate-badges.js || true
node scripts/migrate-features.js || true
node scripts/migrate-resonance.js || true
node scripts/migrate-verification.js || true
node scripts/migrate-friends.js || true
node scripts/migrate-create-messages.js || true
node scripts/set-admin.js || true

# 10. 构建项目
echo -e "${GREEN}[10/10] 构建项目...${NC}"
npm run build

# 启动应用
echo -e "${GREEN}启动应用...${NC}"
pm2 delete aphelion-pulsar 2>/dev/null || true
pm2 start ecosystem.config.json
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}管理员凭据：${NC}"
node scripts/get-admin-creds.js
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}应用信息：${NC}"
echo "  • 端口: 3006"
echo "  • 访问: http://$(hostname -I | awk '{print $1}'):3006"
echo ""
echo -e "${GREEN}常用命令：${NC}"
echo "  • 查看状态: pm2 status"
echo "  • 查看日志: pm2 logs aphelion-pulsar"
echo "  • 重启应用: pm2 restart aphelion-pulsar"
echo ""
echo -e "${YELLOW}下一步建议：${NC}"
echo "  1. 配置 Nginx 反向代理"
echo "  2. 配置 HTTPS 证书"
echo "  3. 配置防火墙规则"
echo ""
echo "详细文档: SERVER_DEPLOYMENT.md"
echo ""

