const mongoose = require('mongoose')

const loginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }, 
  verified: {
    type: Boolean,
    required: false //NOT REQUIRED FOR NOW
  }
})

module.exports = mongoose.model('login', loginSchema)