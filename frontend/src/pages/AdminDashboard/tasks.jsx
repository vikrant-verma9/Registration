import { useEffect, useState } from "react";
import API from "../../api/axios";
import { Trash2, X } from "lucide-react";

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    email: ""
  });

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!formData.title || !formData.email)
      return alert("Title & Email required");

    setSaving(true);
    try {
      await API.post("/tasks", {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.dueDate,
        email: formData.email
      });

      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        email: ""
      });

      setShowModal(false);
      fetchTasks();

    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const toggleStatus = async (task) => {
    await API.put(`/tasks/${task.id}`, {
      status: task.status === "Pending" ? "Completed" : "Pending"
    });
    fetchTasks();
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Admin Tasks</h1>

      <button
        onClick={() => setShowModal(true)}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
      >
        Create Task
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-8 rounded-xl w-96">
            <X onClick={() => setShowModal(false)} className="cursor-pointer float-right" />
            <h2 className="text-xl font-bold mb-4">Create Task</h2>

            <input
              type="text"
              placeholder="Title"
              className="w-full border p-2 mb-3"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <input
              type="email"
              placeholder="Assign User Email"
              className="w-full border p-2 mb-3"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <textarea
              placeholder="Description"
              className="w-full border p-2 mb-3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <input
              type="date"
              className="w-full border p-2 mb-3"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <button
              onClick={handleAddTask}
              className="bg-indigo-600 text-white w-full py-2 rounded"
            >
              {saving ? "Adding..." : "Add Task"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow mt-8">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Email</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.assigned_email}</td>
                  <td>{task.priority}</td>
                  <td>{formatDate(task.due_date)}</td>
                  <td>
                    <button onClick={() => toggleStatus(task)}>
                      {task.status}
                    </button>
                  </td>
                  <td>
                    <Trash2
                      onClick={() => handleDelete(task.id)}
                      className="text-red-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminTasks;
