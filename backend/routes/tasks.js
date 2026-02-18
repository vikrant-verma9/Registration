const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const authMiddleware = require("../middleware/authMiddleware");


// ==========================================
// ✅ CREATE TASK (Admin Only, Email Based)
// ==========================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, status, due_date, email } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    if (!title || !email) {
      return res.status(400).json({ message: "Title & Email required" });
    }

    // 🔥 Find user by email
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const assigned_to = userResult.rows[0].id;

    // 🔥 Insert task
    const result = await pool.query(
      `INSERT INTO tasks
       (title, description, priority, status, due_date, assigned_to, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        title,
        description || "",
        priority || "Medium",
        status || "Pending",
        due_date || null,
        assigned_to
      ]
    );

    res.status(201).json({
      message: "Task created successfully",
      task: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


// ==========================================
// ✅ GET ALL TASKS
// ==========================================
router.get("/", authMiddleware, async (req, res) => {
  try {

    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.created_at,
        u.email AS assigned_email
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
    `;

    let values = [];

    // Employee → only their own tasks
    if (req.user.role === "employee") {
      query += " WHERE t.assigned_to = $1";
      values.push(req.user.id);
    }

    query += " ORDER BY t.created_at DESC";

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


// ==========================================
// ✅ UPDATE TASK
// ==========================================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, status, due_date } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET 
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         priority = COALESCE($3, priority),
         status = COALESCE($4, status),
         due_date = COALESCE($5, due_date),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, priority, status, due_date, req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      message: "Task updated successfully",
      task: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


// ==========================================
// ✅ DELETE TASK (Admin Only)
// ==========================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
