        const express = require("express");
        const cors = require("cors");
        require("dotenv").config();

        const { connectDB } = require("./db");
        const authRoutes = require("./routes/authRoutes");
        const adminRoutes = require("./routes/admin");   // ✅ admin routes add
        const tasksRoutes = require("./routes/tasks");    // ✅ tasks routes added
const userTasksRoutes = require("./routes/usertasks");



        const app = express();

        // CORS setup: frontend URL
        app.use(cors({
        origin: "http://localhost:5173", // frontend URL
        credentials: true
        }));

        app.use(express.json());

        // Routes
        app.use("/api/auth", authRoutes);

        app.use("/api/auth", require("./routes/authRoutes"));

        app.use("/api/auth", authRoutes);

        // admin routes

app.use("/api/admin", adminRoutes);  // ✅ admin dynamic dashboard route
app.use("/api/tasks", tasksRoutes);  // ✅ tasks API route
app.use("/api/user-tasks", userTasksRoutes);



        

        // Start server only after DB connection
        const startServer = async () => {
        await connectDB();
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
        };

        startServer();
