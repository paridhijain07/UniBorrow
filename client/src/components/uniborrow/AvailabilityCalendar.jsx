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
  const today = new Date();

  const cells = useMemo(() => {
    const list = [];
    for (let i = 0; i < days; i += 1) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);

      const booked = bookedRanges.some((r) =>
        isDayWithinRange(day, r.startDate, r.endDate)
      );

      const isToday =
        new Date(day.toDateString()).getTime() ===
        new Date(today.toDateString()).getTime();

      list.push({
        key: day.toISOString().slice(0, 10),
        day,
        booked,
        isToday,
      });
    }
    return list;
  }, [bookedRanges, days, today]);

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-[#0f172a]">Availability</h3>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#22c55e]" />
            Available
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#ef4444]" />
            Booked
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#f97316]" />
            Today
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {cells.map((c) => {
          const isToday = c.isToday;
          const booked = c.booked;
          const cls = isToday
            ? "bg-[#f97316] text-white"
            : booked
              ? "bg-[#ef4444] text-white"
              : "bg-[#22c55e] text-white";

          return (
            <div
              key={c.key}
              className={
                "h-10 rounded-lg border border-white/40 flex items-center justify-center text-xs font-bold " +
                cls
              }
              title={c.booked ? "Booked" : "Available"}
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

