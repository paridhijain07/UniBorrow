import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [pending, setPending] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    if (!password) nextErrors.password = "Password is required";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validate()) return;

  //   setPending(true);
  //   try {
  //     await login({ email, password });
  //     toast.success("Logged in successfully");
  //     navigate("/dashboard");
  //   } catch (err) {
  //     const msg =
  //       err?.response?.data?.message || err?.message || "Login failed";
  //     toast.error(msg);
  //   } finally {
  //     setPending(false);
  //   }
  // };
  const onSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setPending(true);
  try {
    const user = await login({ email, password }); // 🔥 GET USER

    toast.success("Logged in successfully");

    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  } catch (err) {
    const msg =
      err?.response?.data?.message || err?.message || "Login failed";
    toast.error(msg);
  } finally {
    setPending(false);
  }
};

  return (
    <div className="max-w-xl mx-auto px-4 py-10 w-full">
      <div className="bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md rounded-2xl shadow-md border border-white/40 dark:border-[#27272a] p-6">
        <h1 className="text-2xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">
          Login to UniBorrow
        </h1>
        <p className="text-sm text-[#64748b] mt-2">
          Borrow and exchange within safe campus pickup zones.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
              Email
            </label>
            <input
              className="mt-1 w-full border border-white/40 dark:border-[#27272a] bg-white/60 dark:bg-[#1f1f22]/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <div className="text-sm text-[#ef4444] mt-1">
                {fieldErrors.email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
              Password
            </label>
            <input
              className="mt-1 w-full border border-white/40 dark:border-[#27272a] bg-white/60 dark:bg-[#1f1f22]/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              type="password"
            />
            {fieldErrors.password && (
              <div className="text-sm text-[#ef4444] mt-1">
                {fieldErrors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "Signing in..." : "Login"}
          </button>

          <div className="text-sm text-[#64748b] text-center pt-2">
            New here?{" "}
            <span
              className="text-[#f97316] font-semibold cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Create an account
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

