const PostModel = require("../models/post.model");
const MessageModel = require("../models/message.model");
const { uploadErrors } = require("../utils/errors.utils");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const multer = require("multer");

module.exports.createMessage = (req, res) => {
  const newMessage = new MessageModel({
    senderId: req.body.userId,
    receiverId: req.body.receiverId,
    message: req.body.message
  });

  newMessage.save();
  res.json({ success: true });
};

module.exports.createPostTest = (req, res, next) => {
  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    picture: req.file !== null ? "./upload/" + req.file.originalname : "",
    video: req.body.video,
    likers: [],
    comments: []
  });

  newPost.save();
  res.json({ success: true });
};

module.exports.readPost = (req, res) => {
  PostModel.find({})
    .sort({ createdAt: -1 })
    .populate("posterId")
    .exec((err, docs) => {
      console.log(docs);
      if (!err) res.json(docs);
      else console.log("Error to get data : " + err);
    });
};

module.exports.createPost = async (req, res) => {
  console.log("got here");
  let fileName;
  if (req.file !== null) {
    try {
      if (
        req.file.detectedMimeType != "image/jpg" &&
        req.file.detectedMimeType != "image/png" &&
        req.file.detectedMimeType != "image/jpeg"
      )
        throw Error("invalid file");

      if (req.file.size > 500000) throw Error("max size ");
    } catch (err) {
      const errors = uploadErrors(err);
      return res.status(201).json({ errors });
    }

    fileName = req.body.posterId + Date.now() + ".jpg";

    await pipeline(
      req.file.stream,
      fs.createWriteStream(
        `${__dirname}/../client/public/uploads/posts/${fileName}`
      )
    );
  }

  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    picture: req.file !== null ? "./uploads/posts/" + fileName : "",
    video: req.body.video,
    likers: [],
    comments: []
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.updatePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("Id unknown : " + req.params.id);
  }
  const updatedPost = {
    message: req.body.message
  };
  PostModel.findByIdAndUpdate(
    req.params.id,
    { $set: updatedPost },
    { new: true },
    (err, data) => {
      if (!err) res.json(data);
      else console.log(err);
    }
  );
};

module.exports.deletePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("Id unknown : " + req.params.id);
  }
  PostModel.findByIdAndRemove(req.params.id, (err, data) => {
    if (!err) res.json(data);
    else console.log(err);
  });
};

module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("Id unknown : " + req.params.id);
  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likers: req.body.id }
      },
      { new: true },
      (err, data) => {
        if (err) return res.status(400).json(err);
      }
    );
    await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { stars: req.params.id }
      },
      { new: true },
      (err, data) => {
        if (!err) return res.json(data);
        else return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(400).json(err);
  }
};

module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("Id unknown : " + req.params.id);
  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likers: req.body.id }
      },
      { new: true },
      (err, data) => {
        if (err) return res.status(400).json(err);
      }
    );
    await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { stars: req.params.id }
      },
      { new: true },
      (err, data) => {
        if (!err) return res.json(data);
        else return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(400).json(err);
  }
};

module.exports.commentPost = (req, res) => {
  console.log(req.body.comment);
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("Id unknown : " + req.params.id);
  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.comment.commenterId,
            commenterUsername: req.body.comment.commenterUsername,
            text: req.body.comment.text,
            timestamp: new Date().getTime()
          }
        }
      },
      { new: true },
      (err, data) => {
        if (!err) return res.json(data);
        else return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(400).json(err);
  }
};

module.exports.editCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("Id unknown : " + req.params.id);
  try {
    return PostModel.findById(req.params.id, (err, data) => {
      const theComment = data.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      );
      if (!theComment) return res.status(404).json("comment not found");

      theComment.text = req.body.text;
      return data.save((err) => {
        if (!err) return res.status(200).json(data);
        return res.status(500).json(err);
      });
    });
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.deleteCommentPost = (req, res) => {
  console.log("hello");
  console.log(req.body);
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("Id unknown : " + req.params.id);
  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.params.id2 
          }
        }
      },
      {
        new: true
      },
      (err, data) => {
        if (!err) return res.json(data);
        else return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(400).json(err);
  }
};
