const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: process.env.DB_NAME || 'multidex'
        });
        
        console.log(`MongoDB 已连接: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('数据库连接失败:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;