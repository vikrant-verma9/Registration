import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  Shield,
  LogOut,
  Menu,
  CheckSquare,
  CheckCircle
} from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import API from "../api/axios";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const statsRes = await API.get("/admin/stats");
      setStats(statsRes.data);

      const tasksRes = await API.get("/admin/recent-tasks");
      setRecentTasks(tasksRes.data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format Date
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  // Priority Color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-600";
      case "Medium":
        return "bg-yellow-100 text-yellow-600";
      case "Low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Status Color
  const getStatusColor = (status) =>
    status === "Completed"
      ? "bg-green-100 text-green-600"
      : "bg-yellow-100 text-yellow-600";

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-indigo-700 to-blue-600 text-white p-6 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <h2 className="text-2xl font-bold mb-10">
          {sidebarOpen ? "Admin Panel" : "AP"}
        </h2>

        <ul className="space-y-6">
          <li
            onClick={() => navigate("/admin-dashboard")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80"
          >
            <Users size={20} />
            {sidebarOpen && "Dashboard"}
          </li>

          <li
            onClick={() => navigate("/admin-dashboard/tasks")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80"
          >
            <CheckSquare size={20} />
            {sidebarOpen && "Tasks"}
          </li>

          <li className="flex items-center gap-3 cursor-pointer hover:opacity-80">
            <FileText size={20} />
            {sidebarOpen && "Reports"}
          </li>

          <li className="flex items-center gap-3 cursor-pointer hover:opacity-80">
            <Shield size={20} />
            {sidebarOpen && "Roles"}
          </li>

          <li
            onClick={handleLogout}
            className="flex items-center gap-3 cursor-pointer hover:text-red-300"
          >
            <LogOut size={20} />
            {sidebarOpen && "Logout"}
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">

        {/* Topbar */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-indigo-600 text-white rounded-lg"
          >
            <Menu size={20} />
          </button>

          <div className="text-right">
            <h2 className="text-xl font-semibold">
              Welcome, {user?.email}
            </h2>
            <p className="text-gray-500 text-sm">Admin Dashboard</p>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Dashboard Stats */}
            {location.pathname === "/admin-dashboard" && (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">

                <div className="bg-white shadow-xl rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={28} className="text-indigo-600" />
                    <h3 className="text-gray-500">Total Users</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    {stats.totalUsers || 0}
                  </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={28} className="text-blue-600" />
                    <h3 className="text-gray-500">Reports</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    {stats.totalReports || 0}
                  </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={28} className="text-green-600" />
                    <h3 className="text-gray-500">Active Roles</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    {stats.totalRoles || 0}
                  </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={28} className="text-yellow-600" />
                    <h3 className="text-gray-500">Tasks</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    {stats.totalTasks || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Completed: {stats.completedTasks || 0} | Pending:{" "}
                    {stats.pendingTasks || 0}
                  </p>
                </div>

              </div>
            )}

            {/* Recent Tasks Table */}
            {recentTasks.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow overflow-x-auto">
                <h3 className="text-xl font-semibold mb-4">
                  Recent Tasks
                </h3>

                <table className="w-full text-left min-w-[900px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Assigned On</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 font-medium">
                          {task.title}
                        </td>

                        <td className="py-3 px-4 text-indigo-600 font-semibold">
                          {task.assigned_user || "Unassigned"}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {formatDate(task.due_date)}
                        </td>

                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(task.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Outlet />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
