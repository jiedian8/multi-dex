# MultiDEX 多语言去中心化交易所项目
该项目核心文件已经删除，防止别有用心之人盗取劳动成功。
本团队承接各种网站、应用开发，二次开发、服务器维护、有需要的请用电报联系。看到会回复
项目开发唯一联系方式：电报@breekarnes 
项目开发唯一联系方式：电报@breekarnes 
项目开发唯一联系方式：电报@breekarnes 

MultiDEX 是一个多语言去中心化交易所，具有以下核心功能：
多语言用户界面（支持6种语言）
多链资产支持（Ethereum, BSC, Polygon, Solana）
混合交易模式（AMM + 订单簿）
流动性池管理
跨链原子交换
管理员后台监控系统
## 项目背景
MultiDEX 是一个多语言去中心化交易所，支持多链资产交易、流动性提供和跨链交换。项目已完成前端界面、管理后台和基础后端开发，目前需要完成区块链集成和安全增强。
<img width="1501" height="994" alt="QQ_1752778734518" src="https://github.com/user-attachments/assets/f5aab4d2-07d7-4340-9ac6-758ae1165df9" />
<img width="1514" height="945" alt="QQ_1752778762001" src="https://github.com/user-attachments/assets/69a44c71-3186-4697-b20e-2d456652c1ea" />
<img width="1475" height="868" alt="QQ_1752778780065" src="https://github.com/user-attachments/assets/cfa439dd-d064-4739-ad72-a55f2d56a32b" />
<img width="1520" height="977" alt="QQ_1752778792543" src="https://github.com/user-attachments/assets/8334b203-32f6-4d8b-acc2-6734b0fb7cfa" />
<img width="1456" height="840" alt="QQ_1752778805501" src="https://github.com/user-attachments/assets/1fd1bff4-e24d-4be7-ac53-f7bb403cf105" />
<img width="1502" height="843" alt="QQ_1752778842580" src="https://github.com/user-attachments/assets/92ecbc24-a2e8-48f4-8301-a957c187310d" />

项目目录结构
multi-dex/
├── blockchain/               # 智能合约
│   ├── contracts/            # Solidity合约
│   ├── migrations/           # 部署脚本
│   ├── test/                 # 合约测试
│   └── hardhat.config.js     # Hardhat配置
├── backend/                  # 后端服务
│   ├── src/
│   │   ├── controllers/      # API控制器
│   │   ├── models/           # 数据库模型
│   │   ├── routes/           # 路由定义
│   │   ├── services/         # 业务逻辑
│   │   ├── utils/            # 工具类
│   │   ├── app.js            # 应用入口
│   │   └── config.js         # 配置
│   ├── package.json
│   └── ecosystem.config.js   # PM2配置
├── frontend/                 # 网页版前端
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env
├── ios/                      # iOS应用
│   ├── MultiDex/             # 主应用
│   └── Podfile
├── docs/                     # 文档
│   ├── API.md                # API文档
│   ├── DEPLOYMENT.md         # 部署指南
│   └── ARCHITECTURE.md       # 架构说明
├── scripts/                  # 实用脚本
├── .gitignore
├── LICENSE
└── README.md
服务器搭建教程
1. 服务器要求
操作系统: Ubuntu 20.04 LTS
CPU: 4核+
内存: 8GB+
存储: 100GB+ SSD
带宽: 10Mbps+
2. 环境配置
   # 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y git curl build-essential

# 安装Node.js
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 安装MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# 安装PM2
sudo npm install -g pm2

# 安装Nginx
sudo apt install -y nginx

3.项目部署步骤
# 1. 克隆项目
git clone https://github.com/jiedian8/multi-dex.git
cd multi-dex

# 2. 部署智能合约
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network bsc

# 3. 配置后端
cd ../backend
npm install
cp .env.example .env
# 编辑 .env 文件

# 4. 初始化数据库
mysql -u root -p
> CREATE DATABASE multidex;
> USE multidex;
> source init_db.sql;

# 5. 启动后端
npm run build
pm2 start npm --name "backend" -- run start

# 6. 部署前端
cd ../frontend
npm install
npm run build

# 7. 配置Nginx
sudo nano /etc/nginx/sites-available/multidex.conf

# Nginx配置示例
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/multi-dex/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/multidex.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. 启用HTTPS
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com


- 将 MultiDEX.sol 合约部署到 BSC 测试网
- 完成前端 swap 功能的合约交互
- 实现滑点风险检查的前端提示
- 修复用户余额显示不更新的问题

## 技术栈
- 前端：Bootstrap 5, Chart.js, ethers.js
- 后端：Node.js/Express, MongoDB
- 区块链：Solidity 0.8.x, BSC/Polygon
- 工具：Hardhat, Git

## 关键文件位置
1. 智能合约：`/contracts/MultiDEX.sol`
2. 前端区块链交互：`/frontend/js/blockchain.js`
3. 市场数据服务：`/backend/services/market.js`
4. 安全中间件：`/backend/middleware/security.js`



## 环境信息
- 测试网：BSC Testnet
- RPC URL：https://data-seed-prebsc-1-s1.binance.org:8545/
- 链ID：97
- 测试代币：已部署在 0x... 和 0x...

## 如何开始
1. 克隆代码库：`git clone https://github.com/jiedian8/multi-dex.git`
2. 安装依赖：`npm install`
3. 配置环境变量：复制 `.env.example` 到 `.env` 并填写
4. 启动开发环境：`npm run dev`
