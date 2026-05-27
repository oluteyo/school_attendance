const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../models/User");

jest.setTimeout(120000);

let mongoServer;
let adminToken;
let teacherToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "password",
    role: "admin",
  });

  const teacher = await User.create({
    name: "Teacher User",
    email: "teacher@example.com",
    password: "password",
    role: "teacher",
  });

  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || "secretkey", {
    expiresIn: "1h",
  });

  teacherToken = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET || "secretkey", {
    expiresIn: "1h",
  });
});

afterAll(async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
});

test("admin can create a student profile", async () => {
  const response = await request(app)
    .post("/api/students")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      studentId: "S1001",
      firstName: "Test",
      lastName: "Student",
      grade: "10",
      admissionNumber: "A1001",
      section: "A",
    });

  expect(response.statusCode).toBe(201);
  expect(response.body.student).toHaveProperty("studentId", "S1001");
  expect(response.body.student).toHaveProperty("createdBy");
});

test("teacher cannot create a student profile", async () => {
  const response = await request(app)
    .post("/api/students")
    .set("Authorization", `Bearer ${teacherToken}`)
    .send({
      studentId: "S1002",
      firstName: "Teacher",
      lastName: "Attempt",
      grade: "10",
      admissionNumber: "A1002",
    });

  expect(response.statusCode).toBe(403);
  expect(response.body).toHaveProperty("message", "Access denied");
});

test("teacher can access student list", async () => {
  const response = await request(app)
    .get("/api/students")
    .set("Authorization", `Bearer ${teacherToken}`);

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("students");
  expect(Array.isArray(response.body.students)).toBe(true);
});
