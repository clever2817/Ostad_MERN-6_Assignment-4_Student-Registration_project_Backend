const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

// Register a student
exports.registerStudent = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent)
      return res.status(400).json({ msg: "Student already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
    });

    await newStudent.save();
    res.status(201).json({ msg: "Student registered successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Login a student
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ msg: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .cookie("token", token, { httpOnly: true })
      .json({ msg: "Login successful", token });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get student profile
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    res.json(student);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    );
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// File upload using multer
exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  try {
    const student = await Student.findById(req.user.id);
    student.profilePic = req.file.path;
    await student.save();
    res.json({ msg: "File uploaded successfully", file: req.file });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// File read API
exports.readFile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student.profilePic)
      return res.status(400).json({ msg: "No file uploaded" });
    res.sendFile(student.profilePic, { root: "." });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Single file delete API
exports.deleteFile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student.profilePic)
      return res.status(400).json({ msg: "No file to delete" });

    const fs = require("fs");
    fs.unlinkSync(student.profilePic); // Delete file
    student.profilePic = null;
    await student.save();

    res.json({ msg: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
