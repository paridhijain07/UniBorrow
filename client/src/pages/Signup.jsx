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
    <div className="max-w-lg mx-auto px-4 py-12 w-full">
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 p-8 sm:p-9 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-orange-500/25 mb-4">
            U
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Join your verified campus peer network on UniBorrow.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alex Johnson"
              />
              {fieldErrors.name && (
                <div className="text-xs text-rose-500 font-semibold mt-1">
                  {fieldErrors.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Campus Email
              </label>
              <input
                type="email"
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
              />
              {fieldErrors.email && (
                <div className="text-xs text-rose-500 font-semibold mt-1">
                  {fieldErrors.email}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  type="password"
                />
                {fieldErrors.password && (
                  <div className="text-xs text-rose-500 font-semibold mt-1">
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  type="password"
                />
                {fieldErrors.confirmPassword && (
                  <div className="text-xs text-rose-500 font-semibold mt-1">
                    {fieldErrors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Default Campus Pickup Zone
              </label>
              <select
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm"
                value={pickupZone}
                onChange={(e) => setPickupZone(e.target.value)}
              >
                {pickupZones.map((z) => (
                  <option key={z} value={z} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">
                    {z} Safe Pickup Zone
                  </option>
                ))}
              </select>
              {fieldErrors.pickupZone && (
                <div className="text-xs text-rose-500 font-semibold mt-1">
                  {fieldErrors.pickupZone}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl px-6 py-3.5 transition-all duration-200 shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
            >
              {pending ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-3 border-t border-slate-100 dark:border-slate-800/60">
              Already have an account?{" "}
              <button
                type="button"
                className="text-orange-500 hover:text-orange-600 font-bold ml-1 transition-colors"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

