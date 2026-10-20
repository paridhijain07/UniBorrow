import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Search, ArrowRight, X, Compass } from "lucide-react";
import { api } from "../api/axiosConfig";
import CampusMapModal from "../components/uniborrow/CampusMapModal.jsx";

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

const conditions = ["New", "Like New", "Used", "Heavily Used"];
const listingTypes = ["Rent", "Exchange"];
const pickupZones = [
  "Library",
  "Canteen",
  "Hostel-A",
  "Hostel-B",
  "Hostel-C",
  "Main Gate",
  "Academic Block",
];

const CAMPUS_HUBS = [
  { id: "", label: "All Campus", icon: "🏛️" },
  { id: "Library", label: "Central Library", icon: "📚" },
  { id: "Canteen", label: "Campus Canteen", icon: "☕" },
  { id: "Academic Block", label: "Academic Block", icon: "🏢" },
  { id: "Main Gate", label: "Main Gate", icon: "🚪" },
  { id: "Hostel-A", label: "Hostel-A", icon: "🛏️" },
  { id: "Hostel-B", label: "Hostel-B", icon: "🛏️" },
  { id: "Hostel-C", label: "Hostel-C", icon: "🛏️" },
];

const FeaturedItemCard = ({ it, onOpen }) => {
  return (
    <div
      onClick={onOpen}
      className="text-left rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/40 dark:hover:border-orange-500/40 p-3.5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
    >
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
        {it.images?.[0] ? (
          <img
            src={it.images[0]}
            alt={it.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            No image
          </div>
        )}

        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <span
            className={
              "px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm " +
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

        {it.pickupLocation && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px]">
            <span className="text-orange-400">📍</span>
            <span>{it.pickupLocation}</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            {it.category}
          </div>
          <div className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1 group-hover:text-orange-500 transition-colors">
            {it.title}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            {it.listingType === "Exchange" || Number(it.price) === 0 ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Free Exchange
              </span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  ₹{it.price}
                </span>
                <span className="text-[10px] text-slate-400">/day</span>
                {it.originalPrice && it.originalPrice > 0 ? (
                  <span className="text-[10px] text-slate-400 line-through ml-1">
                    ₹{it.originalPrice}
                  </span>
                ) : null}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {it.createdAt ? Math.max(1, Math.floor((Date.now() - new Date(it.createdAt)) / 86400000)) : 0}d ago
          </span>
        </div>
      </div>
    </div>
  );
};

const Browse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialParams = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return {
      search: sp.get("search") || "",
      category: sp.get("category") || "",
      condition: sp.get("condition") || "",
      listingType: sp.get("listingType") || "",
      minPrice: sp.get("minPrice") || "",
      maxPrice: sp.get("maxPrice") || "",
      pickupLocation: sp.get("pickupLocation") || "",
      sort: sp.get("sort") || "newest",
      page: sp.get("page") ? Number(sp.get("page")) : 1,
      status: sp.get("status") || "available",
    };
  }, [location.search]);

  const [query, setQuery] = useState(initialParams);
  const [debouncedSearch, setDebouncedSearch] = useState(initialParams.search);

  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // Live autocomplete state
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    setQuery(initialParams);
    setDebouncedSearch(initialParams.search);
  }, [initialParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query.search), 300);
    return () => clearTimeout(t);
  }, [query.search]);

  // Autocomplete fetch as user types
  useEffect(() => {
    if (!query.search || query.search.trim().length < 2) {
      setAutocompleteResults([]);
      setAutocompleteOpen(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/items?search=${encodeURIComponent(query.search.trim())}&limit=5`);
        const items = res?.data?.items || [];
        setAutocompleteResults(items);
        setAutocompleteOpen(items.length > 0);
      } catch {
        // Ignore autocomplete error
      }
    }, 200);

    return () => clearTimeout(t);
  }, [query.search]);

  // Click outside to dismiss autocomplete
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setAutocompleteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const run = async () => {
      setPending(true);
      setError("");
      try {
        const params = new URLSearchParams();
        const sp = query.status ? { status: query.status } : {};
        void sp;

        if (debouncedSearch) params.set("search", debouncedSearch);
        if (query.category) params.set("category", query.category);
        if (query.condition) params.set("condition", query.condition);
        if (query.listingType) params.set("listingType", query.listingType);
        if (query.pickupLocation) params.set("pickupLocation", query.pickupLocation);
        if (query.minPrice) params.set("minPrice", query.minPrice);
        if (query.maxPrice) params.set("maxPrice", query.maxPrice);
        if (query.sort) params.set("sort", query.sort);
        if (query.status) params.set("status", query.status);

        params.set("page", String(query.page || 1));
        params.set("limit", "12");

        const res = await api.get(`/items?${params.toString()}`);
        setResults(res?.data?.items ?? []);
        setTotalCount(res?.data?.total ?? 0);
        setTotalPages(res?.data?.pages ?? 1);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to fetch items");
      } finally {
        setPending(false);
      }
    };

    run();
  }, [
    debouncedSearch,
    query.category,
    query.condition,
    query.listingType,
    query.minPrice,
    query.maxPrice,
    query.pickupLocation,
    query.sort,
    query.page,
    query.status,
  ]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (query.category) chips.push({ key: "category", label: `Category: ${query.category}` });
    if (query.condition) chips.push({ key: "condition", label: `Condition: ${query.condition}` });
    if (query.listingType) chips.push({ key: "listingType", label: `Type: ${query.listingType}` });
    if (query.pickupLocation) chips.push({ key: "pickupLocation", label: `Pickup: ${query.pickupLocation}` });
    if (query.minPrice || query.maxPrice)
      chips.push({
        key: "price",
        label: `Price: ${query.minPrice || 0} - ${query.maxPrice || "∞"}`,
      });
    if (query.sort) chips.push({ key: "sort", label: `Sort: ${query.sort}` });
    return chips;
  }, [query.category, query.condition, query.listingType, query.pickupLocation, query.minPrice, query.maxPrice, query.sort]);

  const clearAll = () => {
    setQuery((q) => ({
      ...q,
      search: "",
      category: "",
      condition: "",
      listingType: "",
      minPrice: "",
      maxPrice: "",
      pickupLocation: "",
      sort: "newest",
      status: "available",
      page: 1,
    }));
  };

  const removeChip = (key) => {
    setQuery((q) => {
      const next = { ...q };
      if (key === "category") next.category = "";
      if (key === "condition") next.condition = "";
      if (key === "listingType") next.listingType = "";
      if (key === "pickupLocation") next.pickupLocation = "";
      if (key === "price") {
        next.minPrice = "";
        next.maxPrice = "";
      }
      if (key === "sort") next.sort = "newest";
      next.page = 1;
      return next;
    });
  };

  return (
    <div className="w-full pb-16">
      <section className="max-w-6xl mx-auto px-4 pt-4 sm:pt-6">
        {/* 🏛️ CAMPUS PICKUP HUBS QUICK BAR */}
        <div className="mb-4 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#f97316]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Campus Pickup Hubs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMapModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Interactive Map</span>
              </button>
              <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                Filter by pickup location
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CAMPUS_HUBS.map((hub) => {
              const isSelected = query.pickupLocation === hub.id;
              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() =>
                    setQuery((q) => ({
                      ...q,
                      pickupLocation: isSelected && hub.id !== "" ? "" : hub.id,
                      page: 1,
                    }))
                  }
                  className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white border-transparent shadow-md shadow-orange-500/25"
                      : "bg-slate-50 dark:bg-[#161f30] border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-orange-500/40 hover:bg-white dark:hover:bg-[#1a2438]"
                  }`}
                >
                  <span className="text-sm">{hub.icon}</span>
                  <span>{hub.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky search and active filter bar */}
        <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-3.5 sticky top-[64px] z-20">
          <div ref={searchContainerRef} className="relative">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-sm focus-within:border-orange-500/50 transition-colors">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm font-medium"
                  placeholder="Search items, textbooks, electronics, cycle..."
                  value={query.search}
                  onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))}
                  onFocus={() => {
                    if (autocompleteResults.length > 0) setAutocompleteOpen(true);
                  }}
                />
                {query.search && (
                  <button
                    type="button"
                    onClick={() => setQuery((q) => ({ ...q, search: "", page: 1 }))}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={clearAll}
                className="bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 font-semibold text-xs rounded-xl px-3.5 py-2.5 transition-colors shrink-0 cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Instant Search Autocomplete Dropdown */}
            {autocompleteOpen && autocompleteResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl p-2 z-50 divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 flex items-center justify-between">
                  <span>Quick Results</span>
                  <span>Direct Jump</span>
                </div>
                <div className="space-y-1 pt-1">
                  {autocompleteResults.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        setAutocompleteOpen(false);
                        navigate(`/item/${item._id}`);
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-500/10 dark:hover:bg-orange-500/15 cursor-pointer transition-colors group"
                    >
                      <img
                        src={item.images?.[0] || "/default-item.svg"}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                          {item.title}
                        </h5>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-orange-600 dark:text-orange-400">
                            {item.listingType === "Rent" ? `₹${item.price}/day` : "Free Exchange"}
                          </span>
                          {item.pickupLocation && (
                            <span>• 📍 {item.pickupLocation}</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {activeChips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => removeChip(c.key)}
                  className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>{c.label}</span>
                  <span className="font-bold opacity-60 hover:opacity-100">×</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content area: Sidebar + Item Grid */}
        <div className="mt-6 grid md:grid-cols-12 gap-6 items-start">
          {/* Filters Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Filters</h3>
                <span className="text-[11px] font-semibold text-slate-400">Refine Results</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Category
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/40"
                  value={query.category}
                  onChange={(e) => setQuery((q) => ({ ...q, category: e.target.value, page: 1 }))}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Condition
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/40"
                  value={query.condition}
                  onChange={(e) => setQuery((q) => ({ ...q, condition: e.target.value, page: 1 }))}
                >
                  <option value="">Any Condition</option>
                  {conditions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Listing Type
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/40"
                  value={query.listingType}
                  onChange={(e) => setQuery((q) => ({ ...q, listingType: e.target.value, page: 1 }))}
                >
                  <option value="">All Types</option>
                  {listingTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Campus Pickup Zone
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/40"
                  value={query.pickupLocation}
                  onChange={(e) => setQuery((q) => ({ ...q, pickupLocation: e.target.value, page: 1 }))}
                >
                  <option value="">Any Pickup Zone</option>
                  {pickupZones.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Daily Rate (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={query.minPrice}
                    onChange={(e) => setQuery((q) => ({ ...q, minPrice: e.target.value, page: 1 }))}
                    className="w-1/2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={query.maxPrice}
                    onChange={(e) => setQuery((q) => ({ ...q, maxPrice: e.target.value, page: 1 }))}
                    className="w-1/2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Sort Order
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/40"
                  value={query.sort}
                  onChange={(e) => setQuery((q) => ({ ...q, sort: e.target.value, page: 1 }))}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="top_rated">Top Rated</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="md:col-span-8 lg:col-span-9">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-2xl p-4 text-xs font-semibold mb-4">
                {error}
              </div>
            )}

            {pending ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 h-72 animate-pulse"
                  />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <div className="text-3xl">🎒</div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  No listings found
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try clearing some filters, widening the price range, or searching for broader terms.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((it) => (
                  <FeaturedItemCard
                    key={it._id}
                    it={it}
                    onOpen={() => navigate(`/item/${it._id}`)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-900 dark:text-white">{results.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> items
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={(query.page || 1) <= 1}
                    onClick={() => setQuery((q) => ({ ...q, page: Math.max((q.page || 1) - 1, 1) }))}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                    {query.page || 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={(query.page || 1) >= totalPages}
                    onClick={() => setQuery((q) => ({ ...q, page: Math.min((q.page || 1) + 1, totalPages) }))}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🗺️ Interactive Campus Map Modal */}
      <CampusMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        selectedHub={query.pickupLocation}
        onSelectHub={(hubId) => {
          setQuery((q) => ({
            ...q,
            pickupLocation: hubId,
            page: 1,
          }));
        }}
      />
    </div>
  );
};

export default Browse;

