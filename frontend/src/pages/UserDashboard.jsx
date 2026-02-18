import { useEffect, useState } from "react";
import { Home, FileText, User, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ================= FETCH TASKS =================
  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:4001/api/user-tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const data = await res.json();

      // ✅ Handle both response types (array OR {tasks: []})
      setTasks(data.tasks || data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // ✅ Auto refresh every 5 seconds
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ================= STATS =================
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (t) => t.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    (t) => t.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* ================= SIDEBAR ================= */}
      <div
        className={`bg-gradient-to-b from-indigo-700 to-indigo-600 text-white p-6 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <h2 className="text-2xl font-bold mb-10">
          {sidebarOpen ? "User Panel" : "UP"}
        </h2>

        <ul className="space-y-6">
          <li className="flex items-center gap-3 cursor-pointer hover:opacity-80">
            <Home size={20} />
            {sidebarOpen && "Dashboard"}
          </li>

          <li
            onClick={() => navigate("/dashboard/user-tasks")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80"
          >
            <FileText size={20} />
            {sidebarOpen && "My Tasks"}
          </li>

          <li className="flex items-center gap-3 cursor-pointer hover:opacity-80">
            <User size={20} />
            {sidebarOpen && "Profile"}
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

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 p-8">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-indigo-600 text-white rounded-lg"
          >
            <Menu size={20} />
          </button>

          <div className="text-right">
            <h2 className="text-xl font-semibold">
              Welcome, {user?.fullName}
            </h2>
            <p className="text-gray-500 text-sm">User Dashboard</p>
          </div>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-white shadow-xl rounded-2xl p-6 hover:scale-105 transition">
            <h3 className="text-gray-500">Total Tasks</h3>
            <p className="text-3xl font-bold mt-4">
              {loading ? "..." : totalTasks}
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 hover:scale-105 transition">
            <h3 className="text-gray-500">Completed</h3>
            <p className="text-3xl font-bold mt-4 text-green-600">
              {loading ? "..." : completedTasks}
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 hover:scale-105 transition">
            <h3 className="text-gray-500">Pending</h3>
            <p className="text-3xl font-bold mt-4 text-yellow-600">
              {loading ? "..." : pendingTasks}
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 hover:scale-105 transition">
            <h3 className="text-gray-500">In Progress</h3>
            <p className="text-3xl font-bold mt-4 text-blue-600">
              {loading ? "..." : inProgressTasks}
            </p>
          </div>

        </div>

        {/* ================= RECENT TASKS ================= */}
        <div className="bg-white shadow-xl rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>

          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500">No tasks assigned yet.</p>
          ) : (
            <ul className="space-y-4">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id} className="border-b pb-2">
                  {task.status === "Completed"
                    ? "✅"
                    : task.status === "In Progress"
                    ? "🚀"
                    : "🕒"}{" "}
                  {task.title} — {task.status} — Due:{" "}
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString("en-IN")
                    : "N/A"}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
