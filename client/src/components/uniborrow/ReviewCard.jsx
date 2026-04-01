const StarsRow = ({ value }) => {
  const v = Number(value) || 0;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => {
        const on = idx + 1 <= v;
        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            className={on ? "text-[#f97316] font-black" : "text-[#64748b] font-bold"}
          >
            ★
          </span>
        );
      })}
      <span className="text-[#64748b] text-xs font-semibold ml-2">
        {v || 0}/5
      </span>
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const reviewer = review?.reviewer;
  const createdAt = review?.createdAt ? new Date(review.createdAt) : null;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-5 hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={
              reviewer?.avatar ||
              "https://via.placeholder.com/64x64.png?text=U"
            }
            alt={reviewer?.name || "Reviewer"}
            className="w-12 h-12 rounded-full object-cover border border-white/40"
          />
          <div>
            <div className="font-extrabold text-[#0f172a] leading-tight">
              {reviewer?.name || "Anonymous"}
            </div>
            {reviewer?.verifiedBadge && (
              <div className="text-xs font-semibold text-[#0f172a] mt-1">
                Verified
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-[#64748b] font-semibold">
          {createdAt ? createdAt.toLocaleDateString() : ""}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="text-sm font-semibold text-[#0f172a]">Overall</div>
          <StarsRow value={review?.overallRating} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-semibold text-[#0f172a]">Price</div>
            <StarsRow value={review?.priceRating} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0f172a]">Quality</div>
            <StarsRow value={review?.qualityRating} />
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-[#0f172a]">Condition</div>
          <StarsRow value={review?.conditionRating} />
        </div>

        {review?.comment && (
          <div className="text-sm text-[#0f172a] leading-relaxed pt-1">
            {review.comment}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;

