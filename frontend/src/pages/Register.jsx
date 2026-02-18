import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
    gender: "",
    role: "user",
    address: "",
    terms: false,
  });

  const [passwordError, setPasswordError] = useState("");

  const [qualificationInput, setQualificationInput] = useState({
    qualification: "",
    degreeName: "",
    passingYear: "",
    percentage: "",
  });

  const [qualifications, setQualifications] = useState([]);

  // ---------------- General Change ----------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ---------------- Password Regex Validation ----------------
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, password: value });

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(value)) {
      setPasswordError(
        "Password must be 8+ chars, include uppercase, lowercase, number & special character"
      );
    } else {
      setPasswordError("");
    }
  };

  // ---------------- Qualification ----------------
  const handleQualificationChange = (e) => {
    const { name, value } = e.target;
    setQualificationInput({
      ...qualificationInput,
      [name]: value,
    });
  };

  const handleAddQualification = () => {
    if (
      !qualificationInput.qualification ||
      !qualificationInput.degreeName ||
      !qualificationInput.passingYear ||
      !qualificationInput.percentage
    ) {
      return alert("Fill all qualification fields ❌");
    }

    setQualifications([...qualifications, qualificationInput]);

    setQualificationInput({
      qualification: "",
      degreeName: "",
      passingYear: "",
      percentage: "",
    });
  };

  const handleRemoveQualification = (index) => {
    const updated = qualifications.filter((_, i) => i !== index);
    setQualifications(updated);
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(form.password))
      return alert("Password is not strong enough ❌");

    if (form.password !== form.confirmPassword)
      return alert("Passwords do not match ❌");

    if (!form.terms)
      return alert("Please accept Terms & Conditions ❌");

    if (qualifications.length === 0)
      return alert("Add at least one qualification ❌");

    try {
      setLoading(true);

      const response = await API.post("/auth/register", {
        ...form,
        qualifications,
      });

      alert(response.data.message || "Registration Successful ✅");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Download PDF ----------------
  const handleDownloadPDF = async () => {
    try {
      const response = await API.post(
        "/auth/download-pdf",
        { ...form, qualifications },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "registration-details.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("PDF Download Failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white border border-gray-300 shadow-md">
        <div className="bg-blue-900 text-white text-center py-4 text-xl font-semibold">
          Government Registration Portal
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-3 py-2 rounded"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-3 py-2 rounded"
            />
          </div>

          {/* Phone */}
       {/* Phone */}
<div>
  <label className="block font-semibold mb-1">Phone *</label>
  <input
    type="text"
    name="phone"
    value={form.phone}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, ""); // Only numbers
      if (value.length <= 10) {
        setForm({ ...form, phone: value });
      }
    }}
    maxLength={10}
    required
    className="w-full border border-gray-400 px-3 py-2 rounded"
  />
  {form.phone.length > 0 && form.phone.length !== 10 && (
    <p className="text-red-600 text-sm mt-1">
      Phone number must be exactly 10 digits
    </p>
  )}
</div>


          {/* DOB */}
          <div>
            <label className="block font-semibold mb-1">Date of Birth *</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-3 py-2 rounded"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-semibold mb-1">Gender *</label>
            <div className="flex gap-6">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block font-semibold mb-1">Role *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-400 px-3 py-2 rounded"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold mb-1">Address *</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="3"
              required
              className="w-full border border-gray-400 px-3 py-2 rounded"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold mb-1">Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handlePasswordChange}
              required
              className="w-full border border-gray-400 px-3 py-2 rounded"
            />
            {passwordError && (
              <p className="text-red-600 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-semibold mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-3 py-2 rounded"
            />
          </div>

          {/* Qualification Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">
              Educational Qualification
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="qualification"
                placeholder="Qualification"
                value={qualificationInput.qualification}
                onChange={handleQualificationChange}
                className="border border-gray-400 px-3 py-2 rounded"
              />

              <input
                type="text"
                name="degreeName"
                placeholder="Degree Name"
                value={qualificationInput.degreeName}
                onChange={handleQualificationChange}
                className="border border-gray-400 px-3 py-2 rounded"
              />

              <input
                type="number"
                name="passingYear"
                placeholder="Passing Year"
                value={qualificationInput.passingYear}
                onChange={handleQualificationChange}
                className="border border-gray-400 px-3 py-2 rounded"
              />

              <input
                type="number"
                name="percentage"
                placeholder="Percentage"
                value={qualificationInput.percentage}
                onChange={handleQualificationChange}
                className="border border-gray-400 px-3 py-2 rounded"
              />
            </div>

            <button
              type="button"
              onClick={handleAddQualification}
              className="bg-blue-900 text-white px-4 py-2 rounded"
            >
              Add Qualification
            </button>

            {qualifications.map((q, index) => (
              <div
                key={index}
                className="mt-3 p-3 border bg-gray-50 flex justify-between"
              >
                <span>
                  {q.qualification} - {q.degreeName} ({q.passingYear}) -{" "}
                  {q.percentage}%
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveQualification(index)}
                  className="text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
            />
            <label>I agree to Terms & Conditions</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 font-semibold rounded"
          >
            {loading ? "Submitting..." : "Register"}
          </button>

          {/* PDF Download Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="w-full bg-green-700 text-white py-3 font-semibold rounded"
          >
            Download Registration PDF
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
