import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Tasks from "./pages/AdminDashboard/tasks"; // lowercase t
import UserTasks from "./pages/Dashboard/user-tasks"; // ✅ use .jsx or omit extension




function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
 <Route
  path="/dashboard/user-tasks"
  element={
    <ProtectedRoute role="user">
      <UserTasks />
    </ProtectedRoute>
  }
/>



      {/* Admin Nested Routes */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="tasks" element={<Tasks />} /> {/* use Tasks, same as import */}

        
      </Route>
    </Routes>
  );
}

export default App;
