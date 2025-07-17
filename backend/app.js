const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db'); // 修改为新的连接方式

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tokenRoutes = require('./routes/tokens');
const transactionRoutes = require('./routes/transactions');

// 引入市场数据服务
require('./services/market'); // 新增CoinGecko集成

const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 连接到MongoDB - 使用新连接方式
connectDB().then(() => {
  console.log('MongoDB connected successfully');
  
  // 使用路由
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tokens', tokenRoutes);
  app.use('/api/transactions', transactionRoutes);

  // 错误处理
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Database connection failed', err);
  process.exit(1);
});