import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const FeaturedItemCard = ({ it, onOpen }) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 p-4 shadow-md hover:scale-[1.02] hover:shadow-xl transition-all duration-200"
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

      <div className="mt-3 flex gap-2 flex-wrap">
        <span
          className={
            "px-2 py-1 rounded-full text-xs font-semibold border " +
            (it.listingType === "Rent"
              ? "bg-orange-100 text-orange-700 border-orange-200"
              : "bg-green-100 text-green-700 border-green-200")
          }
        >
          {it.listingType === "Rent" ? "Rent" : "Exchange"}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/60 text-[#0f172a] border border-white/40">
          {it.condition}
        </span>
      </div>

      <div className="mt-3 font-extrabold text-[#0f172a] leading-tight">
        {it.title}
      </div>

      <div className="mt-2 text-sm text-[#64748b]">
        {it.listingType === "Exchange" || it.price === 0 ? (
          <span className="font-semibold text-[#0f172a]">Free Exchange</span>
        ) : (
          <span className="font-semibold text-[#0f172a]">
            ₹{it.price}/day
          </span>
        )}
      </div>
      {it.originalPrice && it.originalPrice > 0 && (
        <div className="text-xs text-[#64748b] mt-1">
          <span className="line-through">₹{it.originalPrice}</span>
        </div>
      )}
      <div className="text-xs text-[#64748b] mt-2">
        Listed {it.createdAt ? Math.max(1, Math.floor((Date.now() - new Date(it.createdAt)) / 86400000)) : 0} day(s) ago
      </div>
    </button>
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

  useEffect(() => {
    setQuery(initialParams);
    setDebouncedSearch(initialParams.search);
  }, [initialParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query.search), 300);
    return () => clearTimeout(t);
  }, [query.search]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="w-full">
      <section className="max-w-6xl mx-auto px-4 pt-6">
        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-4 sticky top-[72px] z-10">
          <div className="flex items-center gap-3">
            <input
              className="flex-1 border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
              placeholder="Search items, descriptions, tags..."
              value={query.search}
              onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))}
            />
            <button
              type="button"
              onClick={clearAll}
              className="bg-white/80 hover:bg-white text-[#0f172a] font-semibold rounded-xl px-4 py-2 border border-white/40"
            >
              Clear
            </button>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeChips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="bg-white/60 border border-white/40 rounded-full px-3 py-1 text-xs font-semibold text-[#0f172a] hover:bg-white/80 transition-colors"
                  onClick={() => removeChip(c.key)}
                >
                  {c.label} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-5">
          <aside className="md:block hidden">
            <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-4">
              <h3 className="font-extrabold text-[#0f172a]">Filters</h3>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-[#0f172a] mb-2">
                    Category
                  </div>
                  <select
                    className="w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                    value={query.category}
                    onChange={(e) =>
                      setQuery((q) => ({
                        ...q,
                        category: e.target.value,
                        page: 1,
                      }))
                    }
                  >
                    <option value="">All</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-sm font-semibold text-[#0f172a] mb-2">
                    Condition
                  </div>
                  <select
                    className="w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                    value={query.condition}
                    onChange={(e) =>
                      setQuery((q) => ({
                        ...q,
                        condition: e.target.value,
                        page: 1,
                      }))
                    }
                  >
                    <option value="">All</option>
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-sm font-semibold text-[#0f172a] mb-2">
                    Listing type
                  </div>
                  <select
                    className="w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                    value={query.listingType}
                    onChange={(e) =>
                      setQuery((q) => ({
                        ...q,
                        listingType: e.target.value,
                        page: 1,
                      }))
                    }
                  >
                    <option value="">All</option>
                    {listingTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-sm font-semibold text-[#0f172a] mb-2">
                    Pickup location
                  </div>
                  <select
                    className="w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                    value={query.pickupLocation}
                    onChange={(e) =>
                      setQuery((q) => ({
                        ...q,
                        pickupLocation: e.target.value,
                        page: 1,
                      }))
                    }
                  >
                    <option value="">Any</option>
                    {pickupZones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-sm font-semibold text-[#0f172a] mb-2">
                    Price range (per day)
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="w-1/2 border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                      placeholder="Min"
                      value={query.minPrice}
                      onChange={(e) =>
                        setQuery((q) => ({ ...q, minPrice: e.target.value, page: 1 }))
                      }
                    />
                    <input
                      className="w-1/2 border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                      placeholder="Max"
                      value={query.maxPrice}
                      onChange={(e) =>
                        setQuery((q) => ({ ...q, maxPrice: e.target.value, page: 1 }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-[#0f172a] mb-2">
                    Sort
                  </div>
                  <select
                    className="w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                    value={query.sort}
                    onChange={(e) =>
                      setQuery((q) => ({
                        ...q,
                        sort: e.target.value,
                        page: 1,
                      }))
                    }
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price (low → high)</option>
                    <option value="top_rated">Top rated</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="md:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 font-semibold">
                {error}
              </div>
            )}

            {pending ? (
              <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/60 border border-white/40 h-[320px] animate-pulse"
                  />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="mt-2 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-6 text-[#64748b]">
                No items match your filters. Try removing some filters or
                searching something else.
              </div>
            ) : (
              <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((it) => (
                  <FeaturedItemCard
                    key={it._id}
                    it={it}
                    onOpen={() => navigate(`/item/${it._id}`)}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-[#64748b]">
                {totalCount} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={(query.page || 1) <= 1}
                  onClick={() => setQuery((q) => ({ ...q, page: Math.max((q.page || 1) - 1, 1) }))}
                  className="px-4 py-2 rounded-xl bg-white/80 border border-white/40 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <div className="text-sm font-semibold text-[#0f172a]">
                  Page {query.page || 1} of {totalPages}
                </div>
                <button
                  type="button"
                  disabled={(query.page || 1) >= totalPages}
                  onClick={() => setQuery((q) => ({ ...q, page: Math.min((q.page || 1) + 1, totalPages) }))}
                  className="px-4 py-2 rounded-xl bg-white/80 border border-white/40 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Browse;

