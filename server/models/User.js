const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: function() { return this.isSignup; } }, // name only required on signup
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isShop: { type: Boolean, default: false },
  picURL: {
    type: String,
    default: "https://avatars.githubusercontent.com/u/123496530?s=96&v=4",
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
