import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("All fields are required ❌");
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", form);

      // Save token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert("Login Successful ✅");

      // Redirect based on role
      if (response.data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 p-6">
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl w-full max-w-md p-10 text-white">

        <h2 className="text-4xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center text-gray-200 mb-8">
          Login to continue 🚀
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-300" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/30 focus:ring-2 focus:ring-white outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-300" size={18} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/30 focus:ring-2 focus:ring-white outline-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-indigo-600 py-3 rounded-xl font-semibold hover:scale-105 transition duration-300 shadow-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-200 mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="underline cursor-pointer font-semibold"
            >
              Register
            </span>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Login;
