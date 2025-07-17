-- 创建数据库
CREATE DATABASE IF NOT EXISTS multidex;
USE multidex;

-- 用户表
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) UNIQUE,
  referral_code VARCHAR(8),
  twitter_follow BOOLEAN DEFAULT 0,
  twitter_retweet BOOLEAN DEFAULT 0,
  twitter_like BOOLEAN DEFAULT 0,
  twitter_comment BOOLEAN DEFAULT 0,
  referral_count INT DEFAULT 0,
  earned_tokens DECIMAL(18, 8) DEFAULT 0,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 代币表
CREATE TABLE tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  chain VARCHAR(20) NOT NULL,
  contract_address VARCHAR(42),
  liquidity DECIMAL(30, 8) DEFAULT 0,
  volume_24h DECIMAL(30, 8) DEFAULT 0,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 交易表
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('swap', 'limit', 'liquidity', 'bridge') NOT NULL,
  from_token VARCHAR(10),
  to_token VARCHAR(10),
  amount DECIMAL(30, 8),
  value_usd DECIMAL(30, 8),
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 初始管理员用户
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@multidex.com', '$2a$10$X8z5C8o5Tj8e8gZ9h6YJ0eJgL8Vz7rW1cZ7eY6dX3vK4lS5fD4sW3', 'admin');

-- 初始代币
INSERT INTO tokens (name, symbol, chain, contract_address, liquidity, status) 
VALUES 
  ('Bitcoin', 'BTC', 'Ethereum', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 42500000.00, 'active'),
  ('Ethereum', 'ETH', 'Ethereum', NULL, 68200000.00, 'active'),
  ('Binance Coin', 'BNB', 'BSC', '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 28300000.00, 'active');