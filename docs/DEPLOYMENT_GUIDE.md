# 光影矩阵部署指南

## 目录

- [环境要求](#环境要求)
- [本地开发部署](#本地开发部署)
- [生产环境部署](#生产环境部署)
- [Docker部署](#docker部署)
- [云服务部署](#云服务部署)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 环境要求

### 系统要求
- **操作系统**: Linux, macOS, Windows
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **内存**: 最少 512MB，推荐 2GB+
- **存储**: 最少 1GB 可用空间

### 网络要求
- **端口**: 3000 (前端), 7676 (后端API)
- **协议**: HTTP/HTTPS
- **带宽**: 建议 1Mbps+

## 本地开发部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd Light_chess_solver
```

### 2. 安装依赖

```bash
# 安装根目录依赖 (如果有)
npm install

# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install
```

### 3. 环境配置

#### 后端环境变量
创建 `backend/.env` 文件：

```env
# 服务器配置
PORT=7676
NODE_ENV=development

# 数据库配置 (如果使用)
DATABASE_URL=your_database_url

# 日志级别
LOG_LEVEL=debug
```

#### 前端环境变量
创建 `frontend/.env` 文件：

```env
# API配置
VITE_API_BASE_URL=http://127.0.0.1:7676/api
VITE_APP_TITLE=光影矩阵

# 开发配置
VITE_DEV_MODE=true
```

### 4. 启动开发服务器

#### 启动后端服务
```bash
cd backend
npm run dev
```

后端服务将在 `http://127.0.0.1:7676` 启动

#### 启动前端服务
```bash
cd frontend
npm run dev
```

前端应用将在 `http://localhost:3000` 启动

### 5. 验证部署

#### 检查后端健康状态
```bash
curl http://127.0.0.1:7676/
```

应该返回：
```json
{
  "message": "光影矩阵 (Lights Matrix) API Server",
  "version": "1.0.0",
  "status": "running"
}
```

#### 测试API功能
```bash
# 测试求解功能
curl -X POST http://127.0.0.1:7676/api/solve \
  -H "Content-Type: application/json" \
  -d '{"rows": 3, "cols": 3, "board": [[0,0,0],[0,0,0],[0,0,0]]}'
```

#### 访问前端应用
打开浏览器访问 `http://localhost:3000`

## 生产环境部署

### 1. 构建生产版本

#### 构建后端
```bash
cd backend
npm run build
npm test  # 运行测试确保构建正确
```

#### 构建前端
```bash
cd frontend
npm run build
npm run lint  # 代码检查
```

### 2. 生产环境配置

#### 后端生产配置
创建 `backend/.env.production`：

```env
# 服务器配置
PORT=7676
NODE_ENV=production

# 安全配置
HELMET_ENABLED=true
CORS_ORIGIN=https://your-domain.com

# 日志配置
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/lights-matrix/app.log

# 性能配置
MAX_REQUEST_SIZE=10mb
REQUEST_TIMEOUT=30000
```

#### 前端生产配置
创建 `frontend/.env.production`：

```env
# API配置
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_TITLE=光影矩阵

# 生产配置
VITE_DEV_MODE=false
VITE_ENABLE_ANALYTICS=true
```

### 3. 使用PM2管理进程

#### 安装PM2
```bash
npm install -g pm2
```

#### 创建PM2配置文件
创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'lights-matrix-backend',
      script: './src/index.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 7676
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

#### 启动应用
```bash
# 启动后端服务
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

### 4. 使用Nginx作为反向代理

#### 安装Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 配置Nginx
创建 `/etc/nginx/sites-available/lights-matrix`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL配置
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api {
        proxy_pass http://127.0.0.1:7676;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 启用gzip压缩
    gzip on;
    gzip_types
        text/plain
        text/css
        text/js
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss;
}
```

#### 启用配置
```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/lights-matrix /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载Nginx
sudo systemctl reload nginx
```

## Docker部署

### 1. 后端Docker化

创建 `backend/Dockerfile`：

```dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建日志目录
RUN mkdir -p /app/logs

# 暴露端口
EXPOSE 7676

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=7676

# 启动应用
CMD ["npm", "start"]
```

### 2. 前端Docker化

创建 `frontend/Dockerfile`：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose配置

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "7676:7676"
    environment:
      - NODE_ENV=production
      - PORT=7676
    volumes:
      - ./backend/logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7676/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

### 4. 部署命令

```bash
# 构建和启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

## 云服务部署

### 1. AWS部署

#### 使用AWS Elastic Beanstalk
```bash
# 安装EB CLI
pip install awsebcli

# 初始化项目
eb init

# 创建环境
eb create production

# 部署应用
eb deploy
```

#### 使用AWS ECS
```bash
# 创建ECS任务定义
aws ecs register-task-definition --family lights-matrix --cli-input-json file://task-definition.json

# 创建ECS服务
aws ecs create-service --cluster lights-matrix --service-name backend --task-definition lights-matrix --desired-count 2 --launch-type FARGATE
```

### 2. Google Cloud Platform

#### 使用Cloud Run
```bash
# 构建并推送Docker镜像
gcloud builds submit --tag gcr.io/PROJECT-ID/lights-matrix-backend

# 部署到Cloud Run
gcloud run deploy --image gcr.io/PROJECT-ID/lights-matrix-backend --platform managed
```

### 3. Azure部署

#### 使用Azure App Service
```bash
# 创建资源组
az group create --name lights-matrix-rg --location eastus

# 创建应用服务计划
az appservice plan create --name lights-matrix-plan --resource-group lights-matrix-rg --sku B1

# 创建Web应用
az webapp create --name lights-matrix-backend --resource-group lights-matrix-rg --plan lights-matrix-plan --runtime "NODE|18LTS"

# 部署应用
az webapp deployment source config-zip --resource-group lights-matrix-rg --name lights-matrix-backend --src backend.zip
```

## 监控和维护

### 1. 应用监控

#### PM2监控
```bash
# 查看应用状态
pm2 status

# 查看实时日志
pm2 logs lights-matrix-backend

# 查看性能指标
pm2 monit

# 重启应用
pm2 restart lights-matrix-backend
```

#### 系统监控
```bash
# CPU使用率
top -p $(pgrep -f "node.*src/index.js")

# 内存使用
free -h

# 磁盘使用
df -h

# 网络连接
netstat -tulpn | grep :7676
```

### 2. 日志管理

#### 日志轮转配置
创建 `/etc/logrotate.d/lights-matrix`：

```
/var/log/lights-matrix/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 nodejs nodejs
}
```

#### 日志分析
```bash
# 查看错误日志
grep ERROR /var/log/lights-matrix/error.log

# 统计API调用
grep "POST /api/solve" /var/log/lights-matrix/access.log | wc -l

# 分析响应时间
grep "solve" /var/log/lights-matrix/access.log | awk '{print $NF}' | sort -n
```

### 3. 性能优化

#### Node.js优化
```javascript
// 在 backend/src/index.js 中添加
// 增加内存限制
cluster.setupMaster({
  exec: 'src/index.js',
  args: ['--max-old-space-size=4096']
});

// 连接池优化
const pool = {
  maxSockets: 100,
  maxFreeSockets: 10,
  keepAlive: true,
  keepAliveMsecs: 30000
};
```

#### Nginx优化
```nginx
# 在nginx.conf中添加
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 10M;
```

### 4. 备份和恢复

#### 数据备份脚本
创建 `scripts/backup.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/backup/lights-matrix"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/lights-matrix"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份应用代码
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# 备份日志
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz -C /var/log/lights-matrix .

# 备份配置文件
cp $APP_DIR/backend/.env.production $BACKUP_DIR/env_$DATE

# 清理30天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "备份完成: $BACKUP_DIR/app_$DATE.tar.gz"
```

#### 定时备份
```bash
# 添加到crontab
crontab -e

# 添加每天凌晨2点备份
0 2 * * * /path/to/scripts/backup.sh
```

## 故障排除

### 1. 常见问题

#### 端口占用
```bash
# 查看端口占用
netstat -tulpn | grep :7676

# 杀死占用进程
kill -9 <PID>
```

#### 内存泄漏
```bash
# 查看Node.js进程内存使用
ps aux | grep node

# 使用heapdump分析内存
node --inspect --expose-gc src/index.js
```

#### API超时
```bash
# 增加超时时间
export NODE_OPTIONS="--max-old-space-size=4096"

# 检查网络连接
curl -I http://127.0.0.1:7676/
```

### 2. 性能问题

#### 慢查询优化
```javascript
// 添加查询日志
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log(`Slow query: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
});
```

#### 内存优化
```javascript
// 定期垃圾回收
setInterval(() => {
  if (global.gc) {
    global.gc();
    console.log('Garbage collection performed');
  }
}, 60000);
```

### 3. 安全问题

#### SSL证书更新
```bash
# 使用Let's Encrypt自动更新
certbot renew --dry-run

# 设置定时更新
0 0 1 * * /usr/bin/certbot renew --quiet
```

#### 防火墙配置
```bash
# Ubuntu UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 更新和维护

### 1. 应用更新

#### 蓝绿部署
```bash
# 部署新版本
docker-compose -f docker-compose.blue.yml up -d

# 健康检查
curl -f http://localhost:7676/health

# 切换流量
docker-compose -f docker-compose.green.yml up -d
docker-compose -f docker-compose.blue.yml down
```

#### 滚动更新
```bash
# PM2滚动更新
pm2 reload lights-matrix-backend --update-env
```

### 2. 依赖更新

#### 安全更新
```bash
# 检查安全漏洞
npm audit

# 修复安全漏洞
npm audit fix

# 更新依赖
npm update
```

### 3. 数据库维护 (如果使用)

#### 备份策略
```bash
# 每日备份
0 2 * * * /usr/bin/mongodump --db lights-matrix --out /backup/mongo/

# 每周清理
0 3 * * 0 find /backup/mongo/ -name "*" -mtime +30 -exec rm {} \;
```

---

*部署指南最后更新: 2025-10-02*