import { useEffect, useMemo, useState } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const calcTotalDaysInclusive = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const s = new Date(startDate.toDateString());
  const e = new Date(endDate.toDateString());
  const dayMs = 24 * 60 * 60 * 1000;
  const diff = Math.floor((e.getTime() - s.getTime()) / dayMs);
  return Math.max(diff + 1, 1);
};

const BookingModal = ({
  open,
  onClose,
  onConfirm,
  pending,
  error,
  item,
  bookedRanges = [],
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setStartDate("");
      setEndDate("");
      setLocalError("");
    }
  }, [open]);

  const start = useMemo(() => toDate(startDate), [startDate]);
  const end = useMemo(() => toDate(endDate), [endDate]);

  const totalDays = calcTotalDaysInclusive(start, end);
  const totalCost = useMemo(() => {
    if (!item) return 0;
    if (item.listingType === "Rent") return (item.price || 0) * totalDays;
    return 0;
  }, [item, totalDays]);

  const canSubmit = Boolean(startDate && endDate && !pending);

  if (!open) return null;

  const validate = () => {
    const s = toDate(startDate);
    const e = toDate(endDate);
    if (!s || !e) return "Please select valid dates";
    if (e.getTime() < s.getTime()) return "End date must be on or after start date";

    for (const range of bookedRanges) {
      if (s.getTime() <= range.endDate.getTime() && e.getTime() >= range.startDate.getTime()) {
        return "Selected dates overlap with an existing booking.";
      }
    }

    return "";
  };

  const submit = async () => {
    const msg = validate();
    if (msg) {
      setLocalError(msg);
      return;
    }
    setLocalError("");
    await onConfirm({ startDate, endDate });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Request to Borrow
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {item?.title || "Item reservation"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#1a2234] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estimated Total
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {totalDays ? `${totalDays} day(s) duration` : "Select dates to calculate"}
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {item?.listingType === "Rent" ? (
                  <span className="text-orange-600 dark:text-orange-400">₹{totalCost}</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg">Free Exchange</span>
                )}
              </div>
            </div>
          </div>

          {(localError || error) && (
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <AlertCircle size={15} className="shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void submit()}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl px-6 py-2.5 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {pending ? "Submitting..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

