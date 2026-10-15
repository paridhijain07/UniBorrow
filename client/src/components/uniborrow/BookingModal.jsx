import { useEffect, useMemo, useState } from "react";

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

  // Workaround: keep date strings as sent payload (backend expects ISO8601).
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-2xl bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-[#3f3f46] shadow-2xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">
            Request to Borrow
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold"
          >
            Close
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                Start date
              </label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-300 dark:border-[#3f3f46] bg-white dark:bg-[#202024] text-[#0f172a] dark:text-[#f4f4f5] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                End date
              </label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-300 dark:border-[#3f3f46] bg-white dark:bg-[#202024] text-[#0f172a] dark:text-[#f4f4f5] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-[#2f2f35] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                Total cost
              </div>
              <div className="text-lg font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">
                {item?.listingType === "Rent" ? `₹${totalCost}` : "Free Exchange"}
              </div>
            </div>
            <div className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-2">
              {totalDays ? `${totalDays} day(s) selected` : "Select dates to preview total"}
            </div>
          </div>

          {(localError || error) && (
            <div className="text-sm text-[#ef4444] font-semibold">
              {localError || error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#27272a] dark:hover:bg-[#323238] border border-gray-200 dark:border-[#3f3f46] font-semibold text-[#0f172a] dark:text-[#f4f4f5] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void submit()}
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-6 py-2.5 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "Submitting..." : "Confirm Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

