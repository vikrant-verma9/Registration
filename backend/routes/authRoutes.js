const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { pool } = require("../db");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");



// Register User
router.post("/register", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      fullName,
      email,
      phone,
      password,
      gender,
      dob,
      address,
      role,
      qualifications   // 👈 array aa raha hai
    } = req.body;

    await client.query("BEGIN");

    // Check if user exists
    const userExists = await client.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExists.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "User already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user and get ID
    const userResult = await client.query(
      `INSERT INTO users 
      (full_name, email, phone, password, gender, dob, address, role)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id`,
      [fullName, email, phone, hashedPassword, gender, dob, address, role]
    );

    const userId = userResult.rows[0].id;

    // Insert multiple qualifications
    for (let q of qualifications) {
      await client.query(
        `INSERT INTO qualifications
        (user_id, qualification, degree_name, passing_year, percentage)
        VALUES ($1,$2,$3,$4,$5)`,
        [
          userId,
          q.qualification,
          q.degreeName,
          q.passingYear,
          q.percentage
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({ message: "User registered successfully ✅" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Server error ❌" });
  } finally {
    client.release();
  }
});


// PDF Document api 


const PDFDocument = require("pdfkit");

router.post("/download-pdf", authMiddleware, async (req, res) => {
  try {
    const { fullName, email, phone, gender, dob, address, qualifications } = req.body;

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=registration-details.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("Registration Details", { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Full Name: ${fullName}`);
    doc.text(`Email: ${email}`);
    doc.text(`Phone: ${phone}`);
    doc.text(`Gender: ${gender}`);
    doc.text(`DOB: ${dob}`);
    doc.text(`Address: ${address}`);
    doc.moveDown();

    doc.text("Qualifications:");
    doc.moveDown();

    qualifications.forEach((q, index) => {
      doc.text(
        `${index + 1}. ${q.qualification} - ${q.degreeName} (${q.passingYear}) - ${q.percentage}%`
      );
    });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF generation failed ❌" });
  }
});


// Login api
// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid Email ❌" });
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password ❌" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login Successful ✅",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});




module.exports = router;
