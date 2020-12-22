const express = require("express");
const app = express();
const port = 3001;
const path = require("path");
require("dotenv").config({ path: "./config/.env" });
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const cors = require("cors");
app.use(cors());
const MessageModel = require("./models/message.model");
const RoomModel = require("./models/room.model");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
require("./config/db");

let http = require("http").Server(app);

var io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// enables reading from the upload folder
const directory = path.join(__dirname, "upload");
app.use("/upload", express.static(directory));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id);
});
// routes
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

io.on("connection", (socket) => {
  // Log whenever a user connects
  console.log("user connected");

  // Log whenever a client disconnects from our websocket server
  socket.on("disconnect", function () {
    console.log("user disconnected");
  });

  // When we receive a 'message' event from our client, print out
  // the contents of that message and then echo it back to our client
  // using `io.emit()`
  socket.on("message", (msgData) => {
    console.log(msgData);
    // get the message, the sender, the reciever and store it to DB
    let newMessage = new MessageModel({
      sender_id: msgData.senderId,
      receiver_id: msgData.receiverId,
      message: msgData.message
    });

    newMessage.save().then(async (createdMessage) => {
      console.log(createdMessage);
      await RoomModel.findByIdAndUpdate(
        msgData.roomId,
        { $addToSet: { messages: createdMessage } },
        { upsert: true },
        (err, data) => {
          // emit something back to the client
          RoomModel.findById(data._id)
            .populate("messages")
            .populate("user_id1")
            .populate("user_id2")
            .exec((err, room) => {
              if (!err) {
                io.emit("message", { type: "new-message", text: room });
              }
            });
          // if (!err) res.status(201).json(data);
          // else return res.status(400).json(err);
        }
      );
    });
  });
});

app.get("/", (req, res) => {
  res.send({ msg: "hello" });
});
// connect the server
http.listen(port, () => {
  console.log(`server running on port ${port}`);
});
