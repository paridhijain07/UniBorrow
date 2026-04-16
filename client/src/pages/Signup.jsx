import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext.jsx";

const pickupZones = [
  "Library",
  "Canteen",
  "Hostel-A",
  "Hostel-B",
  "Hostel-C",
  "Main Gate",
  "Academic Block",
];

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pickupZone, setPickupZone] = useState("Library");
  const [fieldErrors, setFieldErrors] = useState({});
  const [pending, setPending] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Name is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    if (!password) nextErrors.password = "Password is required";
    if (password && password.length < 6)
      nextErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword)
      nextErrors.confirmPassword = "Please confirm your password";
    if (confirmPassword && confirmPassword !== password)
      nextErrors.confirmPassword = "Passwords do not match";
    if (!pickupZone) nextErrors.pickupZone = "Pickup zone is required";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setPending(true);
    try {
      await register({ name, email, password, pickupZone });
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Signup failed";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 w-full">
      <div className="bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md rounded-2xl shadow-md border border-white/40 dark:border-[#27272a] p-6">
        <h1 className="text-2xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">
          Create your UniBorrow account
        </h1>
        <p className="text-sm text-[#64748b] mt-2">
          Safe pickups + in-app chat for verified campus borrowing.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
              Name
            </label>
            <input
              className="mt-1 w-full border border-white/40 dark:border-[#27272a] bg-white/60 dark:bg-[#1f1f22]/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
            {fieldErrors.name && (
              <div className="text-sm text-[#ef4444] mt-1">
                {fieldErrors.name}
              </div>
            )}
          </div>

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
              placeholder="Create a password"
              type="password"
            />
            {fieldErrors.password && (
              <div className="text-sm text-[#ef4444] mt-1">
                {fieldErrors.password}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
              Confirm Password
            </label>
            <input
              className="mt-1 w-full border border-white/40 dark:border-[#27272a] bg-white/60 dark:bg-[#1f1f22]/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              type="password"
            />
            {fieldErrors.confirmPassword && (
              <div className="text-sm text-[#ef4444] mt-1">
                {fieldErrors.confirmPassword}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
              Safe pickup zone
            </label>
            <select
              className="mt-1 w-full border border-white/40 dark:border-[#27272a] bg-white/60 dark:bg-[#1f1f22]/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
              value={pickupZone}
              onChange={(e) => setPickupZone(e.target.value)}
            >
              {pickupZones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            {fieldErrors.pickupZone && (
              <div className="text-sm text-[#ef4444] mt-1">
                {fieldErrors.pickupZone}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "Creating..." : "Create account"}
          </button>

          <div className="text-sm text-[#64748b] text-center pt-2">
            Already have an account?{" "}
            <span
              className="text-[#f97316] font-semibold cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;

