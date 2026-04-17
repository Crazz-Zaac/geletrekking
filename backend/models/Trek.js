const mongoose = require("mongoose");

const trekSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: String,
  difficulty: String,
  duration: String,
  price: Number,
  description: String,
  image: String,
});

module.exports = mongoose.model("Trek", trekSchema);
