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
    <div className="max-w-3xl mx-auto px-4 py-6 w-full">
      <div className="mb-5">
        <div className="h-2 bg-white/40 rounded-full overflow-hidden">
          <div className="h-full bg-[#f97316] transition-all duration-300" style={{ width: progressWidth }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm font-semibold text-[#64748b]">
          <span>Step 1</span>
          <span>Step 2</span>
          <span>Step 3</span>
          <span>Step 4</span>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a]">Title</label>
              <input
                className="mt-1 w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                value={values.title}
                onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
                placeholder="e.g., Mechanical Keyboard"
              />
              {errors.title && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.title}</div>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a]">Category</label>
                <select
                  className="mt-1 w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                  value={values.category}
                  onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
                >
                  {categories.map((c) => (
                    <option value={c} key={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.category}</div>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0f172a]">Condition</label>
                <select
                  className="mt-1 w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                  value={values.condition}
                  onChange={(e) => setValues((v) => ({ ...v, condition: e.target.value }))}
                >
                  {conditions.map((c) => (
                    <option value={c} key={c}>{c}</option>
                  ))}
                </select>
                {errors.condition && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.condition}</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f172a]">Listing type</label>
              <div className="mt-2 flex flex-wrap gap-2">
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
                        "px-4 py-2 rounded-xl border font-semibold text-sm transition-all duration-200 " +
                        (active
                          ? "bg-[#f97316] text-white border-[#f97316]"
                          : "bg-white/60 text-[#0f172a] border-white/40 hover:bg-white/80")
                      }
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {errors.listingType && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.listingType}</div>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a]">
                  Price / day {values.listingType === "Rent" ? "" : "(Exchange = 0)"}
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                  value={values.price}
                  onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
                  disabled={values.listingType !== "Rent"}
                />
                {errors.price && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.price}</div>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0f172a]">
                  Original price
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                  value={values.originalPrice}
                  onChange={(e) => setValues((v) => ({ ...v, originalPrice: e.target.value }))}
                />
                {errors.originalPrice && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.originalPrice}</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f172a]">Description</label>
              <textarea
                rows={5}
                className="mt-1 w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                value={values.description}
                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                placeholder="Describe condition, accessories, what’s included..."
              />
              {errors.description && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.description}</div>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a]">Image URLs (max 3)</label>
              <div className="mt-3 space-y-3">
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    className="w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                    value={values.images[idx] || ""}
                    onChange={(e) => {
                      const next = [...values.images];
                      next[idx] = e.target.value;
                      setValues((v) => ({ ...v, images: next }));
                    }}
                    placeholder={`Image URL ${idx + 1}`}
                  />
                ))}
              </div>
              {errors.images && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.images}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f172a]">Tags (comma-separated)</label>
              <input
                className="mt-1 w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                value={values.tagsText}
                onChange={(e) => setValues((v) => ({ ...v, tagsText: e.target.value }))}
                placeholder="keyboard, mechanical, electronics"
              />
              {errors.tagsText && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.tagsText}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f172a]">Pickup location</label>
              <select
                className="mt-1 w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                value={values.pickupLocation}
                onChange={(e) => setValues((v) => ({ ...v, pickupLocation: e.target.value }))}
              >
                {pickupZones.map((z) => (
                  <option value={z} key={z}>{z}</option>
                ))}
              </select>
              {errors.pickupLocation && <div className="text-sm text-[#ef4444] font-semibold mt-1">{errors.pickupLocation}</div>}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-[#0f172a]">Preview</h3>

            <div className="rounded-2xl border border-white/40 bg-white/60 p-4">
              <div className="font-extrabold text-[#0f172a] text-lg">{values.title || "Untitled"}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={values.listingType === "Rent"
                  ? "bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-semibold"
                  : "bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold"}>
                  {values.listingType}
                </span>
                <span className="bg-white/60 text-[#0f172a] border border-white/40 px-3 py-1 rounded-full text-xs font-semibold">
                  {values.condition}
                </span>
                <span className="bg-white/60 text-[#0f172a] border border-white/40 px-3 py-1 rounded-full text-xs font-semibold">
                  {values.category}
                </span>
              </div>

              <div className="mt-3 text-sm text-[#64748b] font-semibold">
                {values.listingType === "Exchange" || Number(values.price) === 0
                  ? "Free Exchange"
                  : `₹${Number(values.price)}/day`}
                {values.originalPrice && Number(values.originalPrice) > 0 ? (
                  <span className="ml-3 line-through text-[#64748b] font-bold">
                    ₹{Number(values.originalPrice)}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 text-sm text-[#0f172a]">
                {values.description || "No description"}
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-[#0f172a]">Pickup: {values.pickupLocation}</div>
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-[#0f172a]">Tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {clampTags(values.tagsText).length ? (
                    clampTags(values.tagsText).map((t) => (
                      <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/60 text-[#0f172a] border border-white/40">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#64748b] text-sm">No tags</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goPrev}
                className="px-5 py-3 rounded-xl bg-white/80 hover:bg-white border border-white/40 font-semibold text-[#0f172a] transition-all duration-200"
              >
                Back
              </button>

              <button
                type="button"
                disabled={pending}
                onClick={() => void handleSubmit()}
                className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? "Submitting..." : submitLabel}
              </button>
            </div>
          </div>
        )}

        {step !== 4 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 1}
              className="px-5 py-3 rounded-xl bg-white/80 hover:bg-white border border-white/40 font-semibold text-[#0f172a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemForm;

