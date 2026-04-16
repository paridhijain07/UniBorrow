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
        <div className="bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border border-white/40 dark:border-[#27272a] rounded-2xl p-8 shadow-md">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[#0f172a] dark:text-[#f4f4f5]">
                Borrow & Exchange within your campus.
              </h1>
              <p className="text-[#64748b] dark:text-[#a1a1aa] mt-4 text-base md:text-lg">
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
                  className="bg-white dark:bg-[#1f1f22] hover:bg-gray-50 dark:hover:bg-[#27272a] text-[#0f172a] dark:text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 border border-gray-200 dark:border-[#3f3f46] shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  List an Item
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-white/60 border border-white/40 animate-pulse"
                  />
                ))
              ) : (
                <>
                  <div className="rounded-2xl bg-white/60 dark:bg-[#1f1f22]/60 border border-white/40 dark:border-[#3f3f46] p-6 flex flex-col justify-center">
                    <div className="text-sm font-semibold text-[#64748b] dark:text-[#a1a1aa]">
                      Active Campus Listings
                    </div>
                    <div className="text-4xl font-extrabold text-[#0f172a] dark:text-white mt-2">
                      <AnimatedCounter value={stats.itemsListed} />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/60 dark:bg-[#1f1f22]/60 border border-white/40 dark:border-[#3f3f46] p-6 flex flex-col justify-center">
                    <div className="text-sm font-semibold text-[#64748b] dark:text-[#a1a1aa]">
                      Active Borrows
                    </div>
                    <div className="text-4xl font-extrabold text-[#f97316] mt-2">
                      <AnimatedCounter value={stats.activeBorrows} />
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

      <section className="w-full overflow-hidden bg-white/50 dark:bg-[#18181b]/50 border-y border-white/60 dark:border-[#27272a] py-8 my-6 relative">
        <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-[#f8fafc] dark:from-[#121212] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-[#f8fafc] dark:from-[#121212] to-transparent z-10 pointer-events-none" />
        
        <div className="animate-marquee gap-10 items-center px-4">
          {[...categories, ...categories, ...categories, ...categories].map((c, idx) => (
            <button
              key={`${c}-${idx}`}
              onClick={() => navigate(`/browse?category=${encodeURIComponent(c)}`)}
              className="whitespace-nowrap flex items-center gap-2 text-2xl font-black text-[#0f172a]/30 dark:text-[#a1a1aa]/30 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors uppercase tracking-[0.2em] cursor-pointer"
            >
              <span className="text-[#f97316]/50 mx-4 text-3xl">•</span> {c}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="rounded-3xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] p-8 md:p-10 shadow-sm">
          <h2 className="text-2xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5] text-center mb-8">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 rounded-2xl bg-[#ea6c0a]/10 dark:bg-[#ea6c0a]/10 text-[#ea6c0a] flex justify-center items-center font-black text-2xl transition-transform group-hover:scale-110 group-hover:-rotate-6">
                1
              </div>
              <div>
                <div className="font-bold text-lg text-[#0f172a] dark:text-[#f4f4f5]">Find items</div>
                <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-2 leading-relaxed px-4">
                  Explore campus inventory. Locate textbooks or tech gear specific to your courses.
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 rounded-2xl bg-[#ea6c0a]/10 dark:bg-[#ea6c0a]/10 text-[#ea6c0a] flex justify-center items-center font-black text-2xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                2
              </div>
              <div>
                <div className="font-bold text-lg text-[#0f172a] dark:text-[#f4f4f5]">Chat & Meet</div>
                <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-2 leading-relaxed px-4">
                  Instantly ping the owner. Arrange safe, verified meetups right on campus ground.
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 rounded-2xl bg-[#ea6c0a]/10 dark:bg-[#ea6c0a]/10 text-[#ea6c0a] flex justify-center items-center font-black text-2xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                3
              </div>
              <div>
                <div className="font-bold text-lg text-[#0f172a] dark:text-[#f4f4f5]">Return & Rate</div>
                <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-2 leading-relaxed px-4">
                  Hand it back and leave a verified trust review for the community.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-2xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">{featuredTitle}</h2>

        {loading ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-full rounded-3xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] animate-pulse h-[340px]"
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-6 text-[#64748b]">
            No featured items available right now.
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((it) => (
              <button
                key={it._id}
                type="button"
                className="w-full flex flex-col text-left rounded-3xl bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border border-gray-200 dark:border-[#27272a] p-5 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:border-[#f97316]/50 dark:hover:border-[#f97316]/50 transition-all duration-300 relative group"
                onClick={() => navigate(`/item/${it._id}`)}
              >
                <div className="w-full rounded-2xl overflow-hidden bg-white/60 dark:bg-[#1f1f22]/60 border border-gray-200 dark:border-[#3f3f46] relative aspect-[4/3]">
                  {it.images?.[0] ? (
                    <img
                      src={it.images[0]}
                      alt={it.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] font-semibold">
                      No image
                    </div>
                  )}
                </div>
                <div className="mt-3 font-extrabold text-[#0f172a] dark:text-[#f4f4f5] leading-tight">
                  {it.title}
                </div>
                <div className="mt-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
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
        <div className="rounded-2xl bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border border-white/40 dark:border-[#27272a] p-6 shadow-md">
          <h2 className="text-xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">Trust & safety</h2>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/60 dark:bg-[#1f1f22]/60 border border-white/40 dark:border-[#3f3f46] p-4">
              <div className="text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                Verified Users
              </div>
              <div className="text-2xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5] mt-1">
                {loading ? "—" : stats.verifiedUsers.toLocaleString()}
              </div>
              <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">Rated for trust by students</div>
            </div>
            <div className="rounded-2xl bg-white/60 dark:bg-[#1f1f22]/60 border border-white/40 dark:border-[#3f3f46] p-4">
              <div className="text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                In-App Chat
              </div>
              <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">
                Negotiate and coordinate with item context.
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 dark:bg-[#1f1f22]/60 border border-white/40 dark:border-[#3f3f46] p-4">
              <div className="text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                Safe Meetups
              </div>
              <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">
                Pickup zones are predefined campus spots.
              </div>
            </div>
            <div className="rounded-2xl bg-white/60 dark:bg-[#1f1f22]/60 border border-white/40 dark:border-[#3f3f46] p-4">
              <div className="text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                Ratings
              </div>
              <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">
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

