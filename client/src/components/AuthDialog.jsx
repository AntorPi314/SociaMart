// src/components/AuthDialog.jsx
import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import Toast from "./Toast";

export default function AuthDialog({ open, onClose }) {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    URL: "",
    isShop: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value) => {
    setForm((prev) => ({ ...prev, isShop: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? "/signup" : "/login";

    try {
      const { data } = await axios.post(
        `http://localhost:3000${endpoint}`,
        form
      );

      if (data.success) {
        showToast(data.message, "success");

        if (isSignup) {
          // After signup, reset form and switch to login
          setIsSignup(false);
          setForm({
            name: "",
            email: "",
            password: "",
            URL: "",
            isShop: false,
          });
        } else {
          // Save user token & info in localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              _id: data.user._id,
              email: data.user.email,
              isShop: data.user.isShop,
              URL: data.user.URL,
            })
          );

          // Close modal and reload current page
          const currentURL = window.location.href;
          if (data.user.isShop) {
            const reloadURL = `${window.location.origin}/${data.user.URL}`;
            window.location.href = reloadURL;
          } else {
            window.location.href = currentURL; 
          }
        }
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Server error";
      console.error("Submit error:", msg);
      showToast(msg, "error");
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-xl w-80 text-black"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4">
            {isSignup ? "Sign Up" : "Login"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignup && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder={form.isShop ? "Your Store Name" : "Your Name"}
                  className="border p-2 rounded text-black placeholder-gray-500"
                  value={form.name}
                  onChange={handleChange}
                />

                {form.isShop && (
                  <div className="flex items-center border p-2 rounded">
                    <span className="text-blue-600">sociamart.com/</span>
                    <input
                      type="text"
                      name="URL"
                      placeholder="your-store-url"
                      className="flex-1 outline-none text-black ml-1"
                      value={form.URL}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="isShop"
                      checked={!form.isShop}
                      onChange={() => handleRadioChange(false)}
                    />
                    Customer
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="isShop"
                      checked={form.isShop}
                      onChange={() => handleRadioChange(true)}
                    />
                    Store
                  </label>
                </div>
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border p-2 rounded text-black placeholder-gray-500"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="border p-2 rounded w-full text-black placeholder-gray-500 pr-10"
                value={form.password}
                onChange={handleChange}
                required
              />
              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </form>

          <p
            className="text-sm mt-4 text-blue-600 cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign up"}
          </p>
        </div>
      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
