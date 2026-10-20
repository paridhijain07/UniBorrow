import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const pickupZones = [
  "Library",
  "Canteen",
  "Hostel-A",
  "Hostel-B",
  "Hostel-C",
  "Main Gate",
  "Academic Block",
];

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

const clampTags = (value) => {
  if (!value) return [];
  const tags = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return tags.slice(0, 15);
};

const normalizeImages = (arr) => {
  return (arr || []).map((s) => String(s || "").trim()).filter(Boolean).slice(0, 3);
};

const ItemForm = ({
  initialValues,
  onSubmit,
  pending,
  submitLabel = "Submit",
}) => {
  const [step, setStep] = useState(1);

  const [values, setValues] = useState(() => ({
    title: initialValues?.title || "",
    category: initialValues?.category || "Books",
    condition: initialValues?.condition || "Used",
    listingType: initialValues?.listingType || "Rent",
    price: initialValues?.price ?? 0,
    originalPrice: initialValues?.originalPrice ?? 0,
    description: initialValues?.description || "",
    images: initialValues?.images?.length ? [...initialValues.images] : ["", "", ""],
    tagsText: Array.isArray(initialValues?.tags)
      ? initialValues.tags.join(", ")
      : "",
    pickupLocation: initialValues?.pickupLocation || "Library",
    status: initialValues?.status || "available",
  }));

  const [errors, setErrors] = useState({});

  const progressWidth = useMemo(() => {
    return `${(step / 4) * 100}%`;
  }, [step]);

  const validateStep = (s) => {
    const nextErrors = {};

    if (s === 1) {
      if (!values.title.trim()) nextErrors.title = "Title is required";
      if (!values.category) nextErrors.category = "Category is required";
      if (!values.condition) nextErrors.condition = "Condition is required";
      if (!values.listingType) nextErrors.listingType = "Listing type is required";
    }

    if (s === 2) {
      if (values.listingType === "Rent") {
        const priceNum = Number(values.price);
        if (!Number.isFinite(priceNum) || priceNum < 0) {
          nextErrors.price = "Price/day must be 0 or a positive number";
        }
      } else {
        // Exchange must be free for the MVP schema; keep it at 0.
        if (Number(values.price) !== 0) nextErrors.price = "Exchange items must have price = 0";
      }
      const op = Number(values.originalPrice);
      if (!Number.isFinite(op) || op < 0) nextErrors.originalPrice = "Original price must be 0 or a positive number";
      if (!values.description.trim()) nextErrors.description = "Description is required";
    }

    if (s === 3) {
      const imgs = normalizeImages(values.images);
      if (imgs.length === 0) nextErrors.images = "Add at least one image URL";
      if (imgs.length > 3) nextErrors.images = "Max 3 images allowed";
      if (!values.pickupLocation) nextErrors.pickupLocation = "Pickup location is required";
      if (!values.tagsText.trim()) nextErrors.tagsText = "Add at least one tag";
    }

    if (s === 4) {
      // Validate everything on submit.
      const all1 = validateStep(1);
      const all2 = validateStep(2);
      const all3 = validateStep(3);
      return { ...all1, ...all2, ...all3 };
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const goNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) return;
    setStep((x) => Math.min(4, x + 1));
  };

  const goPrev = () => setStep((x) => Math.max(1, x - 1));

  const handleSubmit = async () => {
    const e = validateStep(4);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload = {
      title: values.title.trim(),
      category: values.category,
      condition: values.condition,
      listingType: values.listingType,
      price: values.listingType === "Rent" ? Number(values.price) : 0,
      originalPrice: Number(values.originalPrice),
      description: values.description.trim(),
      images: normalizeImages(values.images),
      tags: clampTags(values.tagsText),
      pickupLocation: values.pickupLocation,
      status: "available",
    };

    await onSubmit(payload);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      {/* STEP PROGRESS BAR */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
          <span className={step >= 1 ? "text-orange-500 font-extrabold" : ""}>1. Item Basics</span>
          <span className={step >= 2 ? "text-orange-500 font-extrabold" : ""}>2. Pricing & Info</span>
          <span className={step >= 3 ? "text-orange-500 font-extrabold" : ""}>3. Images & Location</span>
          <span className={step >= 4 ? "text-orange-500 font-extrabold" : ""}>4. Review</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-600 transition-all duration-300"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Listing Title
              </label>
              <input
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                value={values.title}
                onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
                placeholder="e.g., TI-84 Plus Calculator / Wireless Noise-Cancelling Headphones"
              />
              {errors.title && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.title}</div>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm"
                  value={values.category}
                  onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
                >
                  {categories.map((c) => (
                    <option value={c} key={c} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.category}</div>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Condition
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm"
                  value={values.condition}
                  onChange={(e) => setValues((v) => ({ ...v, condition: e.target.value }))}
                >
                  {conditions.map((c) => (
                    <option value={c} key={c} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
                {errors.condition && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.condition}</div>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Listing Type
              </label>
              <div className="flex gap-3">
                {listingTypes.map((t) => {
                  const active = values.listingType === t;
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => {
                        setValues((v) => ({
                          ...v,
                          listingType: t,
                          price: t === "Rent" ? (Number(v.price) || 0) : 0,
                        }));
                        setErrors({});
                      }}
                      className={
                        "flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200 " +
                        (active
                          ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white border-transparent shadow-md shadow-orange-500/20"
                          : "bg-slate-50 dark:bg-[#1a2234] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700")
                      }
                    >
                      {t === "Rent" ? "Borrow / Rent (₹/day)" : "Free Exchange"}
                    </button>
                  );
                })}
              </div>
              {errors.listingType && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.listingType}</div>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Rental Price (₹ / day) {values.listingType !== "Rent" && "(Free for Exchange)"}
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm disabled:opacity-50"
                  value={values.price}
                  onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
                  disabled={values.listingType !== "Rent"}
                />
                {errors.price && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.price}</div>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Estimated Retail Value (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm"
                  value={values.originalPrice}
                  onChange={(e) => setValues((v) => ({ ...v, originalPrice: e.target.value }))}
                  placeholder="Optional retail price"
                />
                {errors.originalPrice && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.originalPrice}</div>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Item Description
              </label>
              <textarea
                rows={5}
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm leading-relaxed"
                value={values.description}
                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                placeholder="Mention condition, accessories included, charging cables, user manuals..."
              />
              {errors.description && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.description}</div>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Image URLs (Add up to 3 links)
              </label>
              <div className="space-y-2.5">
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                    value={values.images[idx] || ""}
                    onChange={(e) => {
                      const next = [...values.images];
                      next[idx] = e.target.value;
                      setValues((v) => ({ ...v, images: next }));
                    }}
                    placeholder={`https://images.unsplash.com/... (Image URL #${idx + 1})`}
                  />
                ))}
              </div>
              {errors.images && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.images}</div>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tags (Comma-separated)
              </label>
              <input
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                value={values.tagsText}
                onChange={(e) => setValues((v) => ({ ...v, tagsText: e.target.value }))}
                placeholder="engineering, electronics, semester-3, calculator"
              />
              {errors.tagsText && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.tagsText}</div>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Campus Pickup Location
              </label>
              <select
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm"
                value={values.pickupLocation}
                onChange={(e) => setValues((v) => ({ ...v, pickupLocation: e.target.value }))}
              >
                {pickupZones.map((z) => (
                  <option value={z} key={z} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">
                    {z} Safe Pickup Zone
                  </option>
                ))}
              </select>
              {errors.pickupLocation && <div className="text-xs text-rose-500 font-semibold mt-1">{errors.pickupLocation}</div>}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Your Listing</h3>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#1a2234] p-5 space-y-3">
              <div className="font-extrabold text-slate-900 dark:text-white text-lg">
                {values.title || "Untitled Listing"}
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={
                    values.listingType === "Rent"
                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-3 py-0.5 rounded-full text-xs font-bold"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-0.5 rounded-full text-xs font-bold"
                  }
                >
                  {values.listingType}
                </span>
                <span className="bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700 px-3 py-0.5 rounded-full text-xs font-semibold">
                  {values.condition}
                </span>
                <span className="bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700 px-3 py-0.5 rounded-full text-xs font-semibold">
                  {values.category}
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                {values.listingType === "Exchange" || Number(values.price) === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Free Exchange</span>
                ) : (
                  <span>
                    ₹{Number(values.price)}/day
                    {values.originalPrice && Number(values.originalPrice) > 0 && (
                      <span className="ml-2 text-xs line-through text-slate-400 font-medium">
                        (Retail ₹{Number(values.originalPrice)})
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {values.description || "No description provided"}
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Pickup: <strong className="text-slate-800 dark:text-slate-200">{values.pickupLocation}</strong></span>
                <span>{normalizeImages(values.images).length} image(s) attached</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={goPrev}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-sm transition-all"
              >
                Back
              </button>

              <button
                type="button"
                disabled={pending}
                onClick={() => void handleSubmit()}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl px-7 py-2.5 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {pending ? "Publishing..." : submitLabel}
              </button>
            </div>
          </div>
        )}

        {step !== 4 && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 1}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl px-6 py-2.5 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 text-sm"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemForm;

