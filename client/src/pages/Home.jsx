import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axiosConfig";

const categories = [
  "Electronics",
  "Books",
  "Furniture",
  "Clothing",
  "Stationery",
  "Lab Equipment",
  "Hostel Essentials",
  "Bikes",
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
    totalEarned: 0,
    totalSpent: 0,
    verifiedUsers: 0,
  });
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState("");

  const featuredTitle = useMemo(() => "Featured Items", []);

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
          totalEarned: statsRes?.data?.totalEarned ?? 0,
          totalSpent: statsRes?.data?.totalSpent ?? 0,
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

  return (
    <div className="w-full">
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-8 shadow-md">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[#0f172a]">
                Borrow & Exchange within your campus.
              </h1>
              <p className="text-[#64748b] mt-4 text-base md:text-lg">
                UniBorrow helps students rent items fast, negotiate in-app,
                and meet safely using verified pickup zones.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/browse")}
                  className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25"
                >
                  Browse Items
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/add-item")}
                  className="bg-white/80 hover:bg-white text-[#0f172a] font-semibold rounded-xl px-6 py-3 transition-all duration-200 border border-white/40"
                >
                  List an Item
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-white/60 border border-white/40 animate-pulse"
                  />
                ))
              ) : (
                <>
                  <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="text-xs font-semibold text-[#64748b]">
                      Items Listed
                    </div>
                    <div className="text-3xl font-extrabold text-[#0f172a] mt-1">
                      <AnimatedCounter value={stats.itemsListed} />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="text-xs font-semibold text-[#64748b]">
                      Active Borrows
                    </div>
                    <div className="text-3xl font-extrabold text-[#0f172a] mt-1">
                      <AnimatedCounter value={stats.activeBorrows} />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="text-xs font-semibold text-[#64748b]">
                      Total Earned
                    </div>
                    <div className="text-3xl font-extrabold text-[#0f172a] mt-1">
                      <AnimatedCounter value={stats.totalEarned} />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="text-xs font-semibold text-[#64748b]">
                      Total Spent
                    </div>
                    <div className="text-3xl font-extrabold text-[#0f172a] mt-1">
                      <AnimatedCounter value={stats.totalSpent} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-[#ef4444] font-semibold">
            {error}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 p-6 shadow-md">
            <h2 className="text-xl font-extrabold text-[#0f172a]">
              How it works
            </h2>
            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <div className="bg-[#f97316] text-white font-bold rounded-xl px-3 py-1">
                  1
                </div>
                <div>
                  <div className="font-semibold text-[#0f172a]">Find items</div>
                  <div className="text-sm text-[#64748b]">
                    Search, filter, and view item availability.
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-[#f97316] text-white font-bold rounded-xl px-3 py-1">
                  2
                </div>
                <div>
                  <div className="font-semibold text-[#0f172a]">
                    Request + chat
                  </div>
                  <div className="text-sm text-[#64748b]">
                    Negotiate in-app and confirm pickup with safe zones.
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-[#f97316] text-white font-bold rounded-xl px-3 py-1">
                  3
                </div>
                <div>
                  <div className="font-semibold text-[#0f172a]">Return & review</div>
                  <div className="text-sm text-[#64748b]">
                    Leave multi-criteria ratings to build trust.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 p-6 shadow-md">
            <h2 className="text-xl font-extrabold text-[#0f172a]">Categories</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="bg-white/60 hover:bg-white border border-white/40 rounded-xl px-3 py-2 text-sm font-semibold text-[#0f172a] transition-all"
                  onClick={() => navigate(`/browse?category=${encodeURIComponent(c)}`)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-2xl font-extrabold text-[#0f172a]">{featuredTitle}</h2>

        {loading ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/60 border border-white/40 h-[260px] animate-pulse"
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-6 text-[#64748b]">
            No featured items available right now.
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((it) => (
              <button
                key={it._id}
                type="button"
                className="text-left rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 p-4 shadow-md hover:scale-[1.02] hover:shadow-xl transition-all duration-200"
                onClick={() => navigate(`/item/${it._id}`)}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-white/60 border border-white/40">
                  {it.images?.[0] ? (
                    <img
                      src={it.images[0]}
                      alt={it.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#64748b] text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="mt-3 font-extrabold text-[#0f172a] leading-tight">
                  {it.title}
                </div>
                <div className="mt-2 text-sm text-[#64748b]">
                  {it.listingType === "Exchange"
                    ? "Free Exchange"
                    : `₹${it.price}/day`}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 p-6 shadow-md">
          <h2 className="text-xl font-extrabold text-[#0f172a]">Trust & safety</h2>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
              <div className="text-sm font-semibold text-[#0f172a]">
                Verified Users
              </div>
              <div className="text-2xl font-extrabold text-[#0f172a] mt-1">
                {loading ? "—" : stats.verifiedUsers.toLocaleString()}
              </div>
              <div className="text-sm text-[#64748b] mt-1">Rated for trust by students</div>
            </div>
            <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
              <div className="text-sm font-semibold text-[#0f172a]">
                In-App Chat
              </div>
              <div className="text-sm text-[#64748b] mt-1">
                Negotiate and coordinate with item context.
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
              <div className="text-sm font-semibold text-[#0f172a]">
                Safe Meetups
              </div>
              <div className="text-sm text-[#64748b] mt-1">
                Pickup zones are predefined campus spots.
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
              <div className="text-sm font-semibold text-[#0f172a]">
                Ratings
              </div>
              <div className="text-sm text-[#64748b] mt-1">
                Multi-criteria reviews to reduce surprises.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

