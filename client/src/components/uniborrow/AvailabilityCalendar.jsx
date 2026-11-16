import { useMemo } from "react";

const isDayWithinRange = (day, start, end) => {
  const d = new Date(day);
  const s = new Date(start);
  const e = new Date(end);

  // Normalize to midnight for stable day comparisons.
  const dn = new Date(d.toDateString()).getTime();
  const sn = new Date(s.toDateString()).getTime();
  const en = new Date(e.toDateString()).getTime();

  return dn >= sn && dn <= en;
};

const AvailabilityCalendar = ({ bookedRanges = [], days = 30 }) => {
  const cells = useMemo(() => {
    const today = new Date();
    const todayMidnight = new Date(today.toDateString()).getTime();
    const list = [];

    for (let i = 0; i < days; i += 1) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);

      const booked = bookedRanges.some((r) =>
        isDayWithinRange(day, r.startDate, r.endDate)
      );

      const isToday =
        new Date(day.toDateString()).getTime() === todayMidnight;

      list.push({
        key: day.toISOString().slice(0, 10),
        day,
        booked,
        isToday,
      });
    }
    return list;
  }, [bookedRanges, days]);

  return (
    <div className="bg-white dark:bg-[#111827] backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">30-Day Availability</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time booking schedule</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            Available
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
            Booked
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/20" />
            Today
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {cells.map((c) => {
          const isToday = c.isToday;
          const booked = c.booked;
          const cls = isToday
            ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white font-extrabold ring-2 ring-orange-500/30 shadow-sm"
            : booked
              ? "bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 line-through opacity-70"
              : "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors";

          return (
            <div
              key={c.key}
              className={
                "h-9 rounded-xl flex items-center justify-center text-xs font-semibold select-none " +
                cls
              }
              title={c.booked ? "Booked" : isToday ? "Today (Available)" : "Available to borrow"}
            >
              {c.day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;

