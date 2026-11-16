import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

import { createReview } from "../../api/reviews.api.js";

const StarSelect = ({ label, value, onChange }) => {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div className="flex items-center gap-1.5 mt-1.5">
        {Array.from({ length: 5 }).map((_, idx) => {
          const v = idx + 1;
          const on = v <= value;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className="p-1 -m-1 focus:outline-none transition-transform hover:scale-110"
              aria-label={`${label} ${v} stars`}
            >
              <Star
                size={20}
                className={
                  on
                    ? "text-amber-500 fill-amber-500 transition-colors"
                    : "text-slate-300 dark:text-slate-700 hover:text-amber-400 transition-colors"
                }
              />
            </button>
          );
        })}
        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-bold">
          {value || 0}/5
        </span>
      </div>
    </div>
  );
};

const ReviewForm = ({ bookingId, onSuccess }) => {
  const [overallRating, setOverallRating] = useState(0);
  const [priceRating, setPriceRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [conditionRating, setConditionRating] = useState(0);
  const [comment, setComment] = useState("");

  const [pending, setPending] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      bookingId &&
      overallRating >= 1 &&
      priceRating >= 1 &&
      qualityRating >= 1 &&
      conditionRating >= 1
    );
  }, [bookingId, overallRating, priceRating, qualityRating, conditionRating]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Please rate all criteria (1-5 stars each).");
      return;
    }

    setPending(true);
    try {
      const payload = {
        bookingId,
        overallRating,
        priceRating,
        qualityRating,
        conditionRating,
        comment,
      };
      await createReview(payload);
      toast.success("Review submitted!");
      setOverallRating(0);
      setPriceRating(0);
      setQualityRating(0);
      setConditionRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit review"
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        Leave a Review
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Multi-criteria student ratings help build trust across the campus community.
      </p>

      <div className="mt-5 space-y-4">
        <StarSelect
          label="Overall Experience"
          value={overallRating}
          onChange={setOverallRating}
        />
        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <StarSelect
            label="Pricing Value"
            value={priceRating}
            onChange={setPriceRating}
          />
          <StarSelect
            label="Item Quality"
            value={qualityRating}
            onChange={setQualityRating}
          />
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <StarSelect
            label="Condition Accuracy"
            value={conditionRating}
            onChange={setConditionRating}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Review Comments (Optional)
        </label>
        <textarea
          className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all text-sm leading-relaxed"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about the item's condition or handover experience..."
        />
      </div>

      <button
        type="button"
        disabled={!canSubmit || pending}
        onClick={() => void handleSubmit()}
        className="mt-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl px-6 py-2.5 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {pending ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
};

export default ReviewForm;

