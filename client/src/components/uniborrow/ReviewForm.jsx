import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { createReview } from "../../api/reviews.api.js";

const StarSelect = ({ label, value, onChange }) => {
  return (
    <div>
      <div className="text-sm font-semibold text-[#0f172a]">{label}</div>
      <div className="flex items-center gap-1 mt-2">
        {Array.from({ length: 5 }).map((_, idx) => {
          const v = idx + 1;
          const on = v <= value;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={
                on
                  ? "text-[#f97316] font-black text-xl leading-none"
                  : "text-[#64748b] font-bold text-xl leading-none hover:text-[#f97316]"
              }
              aria-label={`${label} ${v} stars`}
            >
              ★
            </button>
          );
        })}
        <span className="ml-3 text-xs text-[#64748b] font-semibold">
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
    <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-5">
      <h3 className="text-xl font-extrabold text-[#0f172a]">
        Leave a review
      </h3>
      <p className="text-sm text-[#64748b] mt-2">
        Multi-criteria ratings help students borrow with confidence.
      </p>

      <div className="mt-4 space-y-4">
        <StarSelect
          label="Overall"
          value={overallRating}
          onChange={setOverallRating}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <StarSelect
            label="Price"
            value={priceRating}
            onChange={setPriceRating}
          />
          <StarSelect
            label="Quality"
            value={qualityRating}
            onChange={setQualityRating}
          />
        </div>
        <StarSelect
          label="Condition"
          value={conditionRating}
          onChange={setConditionRating}
        />
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold text-[#0f172a]">Comment</div>
        <textarea
          className="mt-2 w-full border border-white/40 bg-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share what went well (optional)."
        />
      </div>

      <button
        type="button"
        disabled={!canSubmit || pending}
        onClick={() => void handleSubmit()}
        className="mt-5 bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
};

export default ReviewForm;

