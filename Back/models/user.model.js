const mongoose = require("mongoose");
const { isEmail } = require("validator");
// if email if valid
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 40,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      validate: [isEmail],
      lowercase: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      // we put a long password length because it will be crypted
      max: 1030,
      minLength: 6
    },
    friends: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        }
      ]
    },
    rooms: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "room"
        }
      ]
    },
    invitations: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        }
      ]
    },
    picture: {
      type: String,
      default: "upload/placeholder.jpg"
    },
    bio: {
      type: String,
      default: "Just another nerd!"
    },
    stars: {
      type: [String]
    }
  },
  {
    timestamps: true
  }
);
// before saving we crypt our password for that reason we used bcrypt library and the function .pre
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email })
    .populate("friends")
    .populate("rooms")
    .populate("invitations");
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
