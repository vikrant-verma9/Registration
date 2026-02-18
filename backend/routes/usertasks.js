const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const authMiddleware = require("../middleware/authMiddleware");


// ============================================
// ✅ GET LOGGED-IN USER TASKS
// ============================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

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

    // 🔐 If employee → only their tasks
    if (role === "employee") {
      query += " WHERE t.assigned_to = $1";
      values.push(userId);
    }

    query += " ORDER BY t.created_at DESC";

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      tasks: result.rows
    });

  } catch (error) {
    console.error("User Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// ============================================
// ✅ UPDATE TASK STATUS (Employee allowed)
// ============================================
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status required" });
    }

    // Employee can only update their own tasks
    const checkTask = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );

    if (!checkTask.rows[0]) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (
      req.user.role === "employee" &&
      checkTask.rows[0].assigned_to !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      "UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, taskId]
    );

    res.json({
      success: true,
      message: "Task status updated",
      task: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
