import { useEffect, useState } from "react";
import API from "../../api/axios";

const UserTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch user tasks
  const fetchTasks = async () => {
    try {
      const res = await API.get("/user-tasks");
      setTasks(res.data.tasks);   // ✅ IMPORTANT
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 🔥 Toggle status
  const toggleStatus = async (task) => {
    try {
      await API.put(`/user-tasks/${task.id}/status`, {
        status: task.status === "Pending" ? "Completed" : "Pending"
      });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">My Tasks</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow">
          <table className="w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.priority}</td>
                  <td>{formatDate(task.due_date)}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(task)}
                      className={`px-3 py-1 rounded ${
                        task.status === "Completed"
                          ? "bg-green-200"
                          : "bg-yellow-200"
                      }`}
                    >
                      {task.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserTasks;
