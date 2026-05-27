const Student = require("../models/Student");

// Generate a short random code for student QR association.
const generateQrCodeId = () => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

// Admin-only: create a new student profile.
const createStudentProfile = async (req, res) => {
  try {
    const {
      studentId,
      firstName,
      lastName,
      grade,
      section,
      admissionNumber,
      dateOfBirth,
      gender,
      guardianName,
      guardianPhone,
      email,
      phone,
      address,
    } = req.body;

    if (!studentId || !firstName || !lastName || !grade || !admissionNumber) {
      return res.status(400).json({
        message: "studentId, firstName, lastName, grade, and admissionNumber are required",
      });
    }

    const existingStudent = await Student.findOne({
      $or: [{ studentId }, { admissionNumber }],
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Student with the same studentId or admissionNumber already exists",
      });
    }

    const qrCodeId = generateQrCodeId();

    const student = await Student.create({
      studentId,
      firstName,
      lastName,
      grade,
      section,
      admissionNumber,
      dateOfBirth,
      gender,
      guardianName,
      guardianPhone,
      email,
      phone,
      address,
      createdBy: req.user._id,
      qrCodeId,
    });

    res.status(201).json({
      message: "Student profile created successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin + teacher: get a paginated list of students with filters and search.
const getStudentProfiles = async (req, res) => {
  try {
    const { grade, section, search, page = 1, limit = 25 } = req.query;

    const filters = {};
    if (grade) filters.grade = grade;
    if (section) filters.section = section;

    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Student.countDocuments(filters);
    const students = await Student.find(filters)
      .sort({ grade: 1, section: 1, lastName: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      students,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin + teacher: get a single student profile by ID.
const getStudentProfileById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    res.json({
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin + teacher: update a student profile.
const updateStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const updates = req.body;
    Object.assign(student, updates);

    await student.save();

    res.json({
      message: "Student profile updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createStudentProfile,
  getStudentProfiles,
  getStudentProfileById,
  updateStudentProfile,
};
