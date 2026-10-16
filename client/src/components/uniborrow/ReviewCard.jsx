import { Star, ShieldCheck } from "lucide-react";

const StarsRow = ({ value }) => {
  const v = Number(value) || 0;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => {
        const on = idx + 1 <= v;
        return (
          <Star
            key={`star-${idx}`}
            size={14}
            className={on ? "text-amber-500 fill-amber-500" : "text-slate-300 dark:text-slate-700"}
          />
        );
      })}
      <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold ml-1.5">
        {v || 0}/5
      </span>
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const reviewer = review?.reviewer;
  const createdAt = review?.createdAt ? new Date(review.createdAt) : null;

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm p-5 hover:border-orange-500/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={reviewer?.avatar || "/default-avatar.svg"}
            alt={reviewer?.name || "Reviewer"}
            className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-800"
          />
          <div>
            <div className="font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
              <span>{reviewer?.name || "Anonymous Student"}</span>
              {reviewer?.verifiedBadge && (
                <ShieldCheck size={14} className="text-emerald-500 inline-block" title="Verified Campus Member" />
              )}
            </div>
            {reviewer?.verifiedBadge && (
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                Verified Student
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {createdAt ? createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
        </div>
      </div>

      <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Overall Experience</div>
          <StarsRow value={review?.overallRating} />
        </div>
        <div className="grid sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-[#1a2234] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Price Value</div>
            <StarsRow value={review?.priceRating} />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Quality</div>
            <StarsRow value={review?.qualityRating} />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">Condition</div>
            <StarsRow value={review?.conditionRating} />
          </div>
        </div>

        {review?.comment && (
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1 italic">
            &ldquo;{review.comment}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;

