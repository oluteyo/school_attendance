const express = require("express");

const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route accessed",
    user: req.user,
  });
});

router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    message: "Welcome admin. You can access this route.",
  });
});

router.get("/teacher-only", protect, authorizeRoles("teacher"), (req, res) => {
  res.json({
    message: "Welcome teacher. You can access this route.",
  });
});

module.exports = router;