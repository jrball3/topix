const mongoose = require('mongoose');
require('dotenv').config();

const host = process.env.MONGO_HOST;
const database = process.env.MONGO_DATABASE;
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;

class Database {
  constructor() {
    this._connect()
  }

  _connect() {
     mongoose.connect(`mongodb://${username}:${password}@${host}/${database}`)
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       })
  }
}

module.exports = new Database();
