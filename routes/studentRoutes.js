const express = require("express");
const {
  createStudentProfile,
  getStudentProfiles,
  getStudentProfileById,
  updateStudentProfile,
} = require("../controllers/studentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createStudentProfile);
router.get("/", protect, authorizeRoles("admin", "teacher"), getStudentProfiles);
router.get("/:id", protect, authorizeRoles("admin", "teacher"), getStudentProfileById);
router.put("/:id", protect, authorizeRoles("admin", "teacher"), updateStudentProfile);

module.exports = router;
