#!/bin/bash

# Aphelion Pulsar 一键部署脚本
# 适用于 Ubuntu 20.04+ / Debian 10+

set -e

echo "🚀 开始部署 Aphelion Pulsar..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    echo "使用: sudo bash deploy.sh"
    exit 1
fi

# 1. 更新系统
echo -e "${GREEN}[1/10] 更新系统...${NC}"
apt update && apt upgrade -y

# 2. 安装 Node.js
echo -e "${GREEN}[2/10] 安装 Node.js 18.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi
echo "Node.js 版本: $(node -v)"

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
    git pull
fi

# 7. 安装依赖
echo -e "${GREEN}[7/10] 安装依赖...${NC}"
npm install --production

# 8. 配置环境变量
echo -e "${GREEN}[8/10] 配置环境变量...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}请配置 .env 文件${NC}"
    cp .env.production .env
    echo "请编辑 .env 文件并填写您的配置"
    echo "编辑完成后按回车继续..."
    read
fi

# 9. 初始化数据库
echo -e "${GREEN}[9/10] 初始化数据库...${NC}"
node scripts/migrate-leveling-invites.js
node scripts/migrate-add-avatar.js
node scripts/migrate-add-bio.js
node scripts/migrate-badges.js
node scripts/migrate-features.js
node scripts/migrate-resonance.js
node scripts/migrate-verification.js
node scripts/migrate-friends.js
node scripts/migrate-create-messages.js
node scripts/set-admin.js

# 10. 构建项目
echo -e "${GREEN}[10/10] 构建项目...${NC}"
npm run build

# 启动应用
echo -e "${GREEN}启动应用...${NC}"
pm2 start ecosystem.config.json
pm2 save
pm2 startup

echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "管理员凭据："
node scripts/get-admin-creds.js
echo ""
echo "应用已启动在端口 3006"
echo "查看状态: pm2 status"
echo "查看日志: pm2 logs aphelion-pulsar"
echo ""
echo -e "${YELLOW}建议：${NC}"
echo "1. 配置 Nginx 反向代理"
echo "2. 配置 HTTPS 证书"
echo "3. 配置防火墙"
echo ""
echo "详细文档请查看 SERVER_DEPLOYMENT.md"
