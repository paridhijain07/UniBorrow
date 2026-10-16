import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Repeat,
  ArrowRight,
  MapPin,
  TrendingUp,
  Users,
  CheckCircle2,
  BookOpen,
  Laptop,
  Bike,
  Armchair,
  Shirt,
  PenTool,
  FlaskConical,
  Home as HomeIcon,
} from "lucide-react";
import { api } from "../api/axiosConfig";

const categories = [
  { name: "Electronics", icon: Laptop },
  { name: "Books", icon: BookOpen },
  { name: "Furniture", icon: Armchair },
  { name: "Clothing", icon: Shirt },
  { name: "Stationery", icon: PenTool },
  { name: "Lab Equipment", icon: FlaskConical },
  { name: "Hostel Essentials", icon: HomeIcon },
  { name: "Bikes", icon: Bike },
];

const AnimatedCounter = ({ value, durationMs = 900 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(value) || 0;

    const tick = (now) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    setDisplay(0);
    requestAnimationFrame(tick);
  }, [value, durationMs]);

  return <span>{display.toLocaleString()}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    itemsListed: 0,
    activeBorrows: 0,
    verifiedUsers: 0,
  });
  const [featured, setFeatured] = useState([]);
  const [_error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const featuredTitle = useMemo(() => "Featured Campus Gear", []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const itemsRes = await api.get("/items?limit=1");
        const itemsListed = itemsRes?.data?.total ?? 0;

        const usersRes = await api.get("/users/count");
        const totalUsers = usersRes?.data?.count ?? 0;

        const statsRes = await api.get("/stats/home");
        const nextStats = {
          itemsListed,
          activeBorrows: statsRes?.data?.activeBorrows ?? 0,
          verifiedUsers: statsRes?.data?.verifiedUsers ?? totalUsers,
        };
        setStats(nextStats);

        const featuredRes = await api.get(
          "/items?status=available&sort=newest&page=1&limit=6"
        );
        setFeatured(featuredRes?.data?.items ?? []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-16 pb-16">
      {/* 🚀 HERO SECTION */}
      <section className="relative pt-6 md:pt-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Commission • 100% Student Verified</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Borrow, Lend & Exchange{" "}
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                  Campus Gear.
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Connect directly with classmates to rent textbooks, electronics, lab supplies, and hostel essentials. Coordinate in-app and pick up safely on campus.
              </p>

              {/* Instant Search Bar */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 flex flex-col sm:flex-row gap-2 max-w-xl ring-1 ring-black/5"
              >
                <div className="flex-1 flex items-center px-3 gap-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cameras, textbooks, calculators..."
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                  />
                </div>
                <div className="sm:border-l border-slate-200 dark:border-slate-800 px-2 flex items-center">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none py-1.5 pr-2 font-medium cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-[#111827]">All Categories</option>
                    {categories.map((c) => (
                      <option value={c.name} key={c.name} className="bg-white dark:bg-[#111827]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 transition-all shrink-0 cursor-pointer"
                >
                  Find Gear
                </button>
              </form>

              {/* Popular category tags */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Trending:</span>
                {["Electronics", "Books", "Lab Equipment", "Bikes"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => navigate(`/browse?category=${encodeURIComponent(t)}`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md">
                {/* Decorative glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl -z-10" />

                {/* Primary Preview Card */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 space-y-4">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={
                        featured[0]?.images?.[0] ||
                        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
                      }
                      alt="Featured Item"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-sm">
                        Available Today
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span>Central Library Zone</span>
                      </span>
                      <span className="font-bold text-amber-300">
                        {featured[0]?.price ? `₹${featured[0].price}/day` : "₹40/day"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {featured[0]?.category || "Campus Essentials"}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">
                        Verified Student Listing
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-snug line-clamp-1">
                      {featured[0]?.title || "Graphing Calculator & Lab Kit"}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                        U
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Student Host
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        featured[0]?._id
                          ? navigate(`/item/${featured[0]._id}`)
                          : navigate("/browse")
                      }
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Floating Metric Pill 1 */}
                <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-3 animate-bounce [animation-duration:4s]">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Avg. Savings
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      ₹1,250 / semester
                    </div>
                  </div>
                </div>

                {/* Floating Metric Pill 2 */}
                <div className="absolute -top-4 -right-3 sm:-right-5 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Hostel-B Pickup Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 CAMPUS PULSE STATS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              <AnimatedCounter value={stats.itemsListed} />
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Active Campus Listings
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Repeat className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-500">
              <AnimatedCounter value={stats.activeBorrows} />
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Active Rentals & Exchanges
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              <AnimatedCounter value={stats.verifiedUsers} />
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Verified Student Peers
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              100%
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Safe Campus Pickups
            </div>
          </div>
        </div>
      </section>

      {/* 🏷️ CATEGORY GRID */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Explore by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Find exactly what you need for this semester
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/browse")}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => navigate(`/browse?category=${encodeURIComponent(c.name)}`)}
                className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 💎 FEATURED ITEMS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {featuredTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Freshly listed items ready for pickup
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/browse")}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>See more items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 animate-pulse h-80"
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-sm">
            No featured items available right now. Be the first to list!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((it) => (
              <div
                key={it._id}
                onClick={() => navigate(`/item/${it._id}`)}
                className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/40 dark:hover:border-orange-500/40 rounded-3xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
              >
                {/* Image */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  {it.images?.[0] ? (
                    <img
                      src={it.images[0]}
                      alt={it.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                      No image
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                    <span
                      className={
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm " +
                        (it.listingType === "Rent"
                          ? "bg-orange-500 text-white"
                          : "bg-emerald-600 text-white")
                      }
                    >
                      {it.listingType === "Rent" ? "Rent" : "Exchange"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md text-white">
                      {it.condition}
                    </span>
                  </div>

                  {/* Pickup badge */}
                  {it.pickupLocation && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px]">
                      <MapPin className="w-3 h-3 text-orange-400" />
                      <span>{it.pickupLocation}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mt-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                      {it.category}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 group-hover:text-orange-500 transition-colors">
                      {it.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      {it.listingType === "Exchange" || Number(it.price) === 0 ? (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          Free Exchange
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                            ₹{it.price}
                          </span>
                          <span className="text-[11px] text-slate-400">/ day</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform">
                      Rent Now →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🧭 HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              How UniBorrow Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Campus borrowing made seamless, verified, and secure in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-extrabold text-xl shadow-inner">
                <Search className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                Step 1
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Find Your Gear
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Filter by course textbooks, lab devices, or electronics listed by verified students right on your campus.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-extrabold text-xl shadow-inner">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                Step 2
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Chat & Meet Safely
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Send a booking request and message the owner in real time. Choose a campus pickup zone like the Library or Canteen.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-xl shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                Step 3
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Return & Build Trust
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Hand the item back on time. Rate the condition, communication, and punctuality to grow community trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🛡️ TRUST & SAFETY PILLARS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 rounded-3xl p-8 sm:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Community Standards
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Designed Exclusively for Campus Safety
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Join UniBorrow
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                ID
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Student Verification
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Only verified university members with institutional credentials can request or list items.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                💬
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Contextual Chat
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Discuss pickup times, item inspection, and usage rules directly within the item conversation.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                📍
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Predefined Zones
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All handoffs occur at well-lit, high-visibility campus locations (Library, Main Gate, Academic Block).
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                ⭐
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Multi-Factor Reviews
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Rate item accuracy, communication, and return timeliness to safeguard community reputation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

