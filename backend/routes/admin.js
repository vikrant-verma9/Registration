const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// ================= ADMIN DASHBOARD ROUTES =================

// 1️⃣ Get Dashboard Stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    // Total Users
    const usersResult = await pool.query(
      "SELECT COUNT(*) FROM users"
    );

    // Total Reports
    // const reportsResult = await pool.query(
    //   "SELECT COUNT(*) FROM reports"
    // );

    // Total Roles (distinct roles)
    const rolesResult = await pool.query(
      "SELECT COUNT(DISTINCT role) FROM users"
    );

    // Task Counts by Status
    const tasksResult = await pool.query(
      "SELECT status, COUNT(*) FROM tasks GROUP BY status"
    );

    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;

    tasksResult.rows.forEach((task) => {
      const count = parseInt(task.count);

      totalTasks += count;

      if (task.status === "Completed") {
        completedTasks = count;
      }

      if (task.status === "Pending") {
        pendingTasks = count;
      }

      if (task.status === "In Progress") {
        inProgressTasks = count;
      }
    });

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
    //   totalReports: parseInt(reportsResult.rows[0].count),
      totalRoles: parseInt(rolesResult.rows[0].count),
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
});


// 2️⃣ Get Recent Users
router.get("/recent-users", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, status, created_at FROM users ORDER BY id DESC LIMIT 5"
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Recent Users Error:", error);
    res.status(500).json({ message: error.message });
  }
});


// 3️⃣ Get Recent Tasks (FIXED VERSION)
router.get("/recent-tasks", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tasks.id,
        tasks.title,
        tasks.priority,
        tasks.status,
        tasks.due_date,
        tasks.created_at,
        users.email AS assigned_user
      FROM tasks
      LEFT JOIN users ON tasks.assigned_to = users.id
      ORDER BY tasks.id DESC
      LIMIT 5
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Recent Tasks Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
