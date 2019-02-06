const mongoose = require('mongoose')
mongoose.set('debug', true)
require('dotenv').config()

const host = process.env.MONGO_HOST
const database = process.env.MONGO_DATABASE
const username = process.env.MONGO_USERNAME
const password = process.env.MONGO_PASSWORD
const port = process.env.MONGO_PORT
const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`

class Database {
  constructor () {
    this._connect()
  }

  _connect () {
    mongoose.connect(uri)
      .then(() => {
        console.log('Database connection successful')
      })
      .catch(err => {
        console.error('Database connection error')
        console.log(err)
      })
  }
}

module.exports = new Database()
