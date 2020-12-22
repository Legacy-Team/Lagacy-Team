const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  user_id1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  user_id2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  messages: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }],
    trim: true
  }
});


module.exports = mongoose.model("room", RoomSchema);
