const router = require("express").Router();
const postController = require("../controllers/post.controller");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./upload/");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
var upload = multer({ storage: storage, fileFilter: fileFilter });

router.get("/", postController.readPost);
router.post("/", upload.single("file"), postController.createPost);
router.post("/create", upload.single("picture"), postController.createPostTest);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);
router.patch("/like-post/:id", postController.likePost);
router.patch("/unlike-post/:id", postController.unlikePost);
//comments
router.patch("/comment-post/:id", postController.commentPost);
router.patch("/edit-comment-post/:id", postController.editCommentPost);
router.delete(
  "/delete-comment-post/:id/:id2",
  postController.deleteCommentPost
);
router.post("/createMessage", postController.createMessage);

module.exports = router;
