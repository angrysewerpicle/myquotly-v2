const mongoose = require('mongoose')

const verifloginSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  uniqueString: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }

})

module.exports = mongoose.model('veriflogin', verifloginSchema)