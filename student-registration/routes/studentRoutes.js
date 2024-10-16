const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateStudentProfile,
  uploadFile,
  readFile,
  deleteFile,
} = require("../controllers/studentController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/profile", authMiddleware, getStudentProfile);
router.put("/profile", authMiddleware, updateStudentProfile);
router.post("/upload", authMiddleware, upload.single("file"), uploadFile);
router.get("/file", authMiddleware, readFile);
router.delete("/file", authMiddleware, deleteFile);

module.exports = router;
