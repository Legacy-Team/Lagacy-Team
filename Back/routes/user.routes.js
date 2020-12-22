const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller.js");
const uploadController = require("../controllers/upload.controller");

const multer = require("multer");
const roomModel = require("../models/room.model");
const upload = multer();
// Authentification
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logOut);
// User db
router.post("/friendsOfFriends", userController.friendsOfFriends);
router.put("/profile-picture", userController.updateUserPicture);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.userInfo);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/room", userController.getroom);
router.post("/accept/:id/:id2", userController.accept);
router.post("/invite/:id/:id2", userController.invite);
router.patch("/desinvitations/:id", userController.desinvitations);

// upload
router.post("/upload", upload.single("file"), uploadController.uploadProfil);

module.exports = router;
