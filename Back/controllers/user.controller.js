const UserModel = require("../models/user.model");
const RoomModel = require("../models/room.model");
// to verify each time if the id's are existing in our database
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  // select() to select all the propyoritise except password
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};
module.exports.userInfo = (req, res) => {
  console.log(req.params);
  // the function is valid will test if the id existe on the data base if not it will exit the function
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("Id unknown : " + req.params.id);
  } else {
    UserModel.findById(req.params.id)
      .populate("friends")
      .exec((err, data) => {
        if (!err) {
          res.send(data);
        } else {
          console.error;
        }
      })
      .select("-password");
  }
};
module.exports.friendsOfFriends = (req, res) => {
  // the function is valid will test if the id existe on the data base if not it will exit the function
  UserModel.findById(req.body.id).exec((err, data) => {
    if (!err) {
      res.send(data);
    } else {
      console.error;
    }
  });
};
module.exports.getroom = (req, res) => {
  console.log("i  m fucking here");
  // the function is valid will test if the id existe on the data base if not it will exit the function
  RoomModel.findById(req.body.id)
    .populate("messages")
    .populate("user_id1")
    .populate("user_id2")
    .exec((err, room) => {
      if (!err) return res.json(room);
      if (err) return res.status(500).json(err);
    });
};

module.exports.updateUserPicture = (req, res) => {
  console.log("hey");
};
module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).json("Id unknown : " + req.params.id);

  try {
    await UserModel.findOneAndUpdate(
      {
        _id: req.params.id
      },
      {
        $set: {
          bio: req.body.bio
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      },
      (err, data) => {
        if (!err) return res.json(data);
        if (err) return res.status(500).json(err);
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
};
module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).json("Id unknown : " + req.params.id);
  try {
    await UserModel.remove({ _id: req.params.id }).exec();
    res.status(200).json("deleted!");
  } catch (err) {
    return res.status(500).json(err);
  }
};
module.exports.accept = async (req, res) => {
  if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.params.id2))
    return res.status(400).json("Id unknown : " + req.params.id);
  try {
    // add to the friends list
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { friends: req.params.id2 } },
      { new: true, upsert: true },
      (err, data) => {
        // if (!err) res.status(201).json(data);
        // else return res.status(400).json(err);
      }
    );
    await UserModel.findByIdAndUpdate(
      req.params.id2,
      { $addToSet: { friends: req.params.id } },
      { new: true, upsert: true },
      (err, data) => {
        // if (!err) res.status(201).json(data);
        // else return res.status(400).json(err);
      }
    );
    // add to invitations list
    await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          invitations: req.params.id2
        }
      },
      { safe: true },
      (err, data) => {
        if (!err) res.status(201).json(data);
        if (err) return res.status(400).json(err);
      }
    );

    // add a room for both users
    let room = new RoomModel();
    room.user_id1 = req.params.id;
    room.user_id2 = req.params.id2;
    room.messages = [];
    room.save().then(async (createdRoom) => {
      await UserModel.findByIdAndUpdate(
        req.params.id2,
        { $addToSet: { rooms: createdRoom._id } },
        { new: true, upsert: true },
        (err, data) => {
          // if (!err) res.status(201).json(data);
          // else return res.status(400).json(err);
        }
      );
      await UserModel.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { rooms: createdRoom._id } },
        { new: true, upsert: true },
        (err, data) => {
          // if (!err) res.status(201).json(data);
          // else return res.status(400).json(err);
        }
      );
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};
module.exports.invite = async (req, res) => {
  if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.params.id2))
    return res.status(400).json("Id unknown : " + req.params.id);
  try {
    // add to invitations list
    console.log(req.params.id2);
    await UserModel.findByIdAndUpdate(
      req.params.id2,
      { $addToSet: { invitations: req.params.id } },
      { new: true, upsert: true },
      (err, data) => {
        if (!err) res.status(201).json(data);
        if (err) return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
};
module.exports.desinvitations = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToDesinvitations)
  )
    return res.status(400).json("Id unknown : " + req.params.id);

  try {
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { invitations: req.body.idToDesinvitations } },
      { new: true, upsert: true },
      (err, data) => {
        if (!err) res.status(201).json(data);
        else return res.status(400).json(err);
      }
    );
    // add to invitations list
    await UserModel.findByIdAndUpdate(
      req.body.idToDesinvitations,
      { $pull: { friends: req.params.id } },
      { new: true, upsert: true },
      (err, data) => {
        // if(!err) res.status(201).json(data);
        if (err) return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
};
