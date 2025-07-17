module.exports = {
  database: process.env.MONGODB_URI || 'mongodb://localhost:27017/multidex',
  secret: process.env.APP_SECRET || 'yoursecretkey'
};