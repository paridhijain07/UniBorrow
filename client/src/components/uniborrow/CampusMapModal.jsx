import { useState } from "react";
import {
  MapPin,
  X,
  Building2,
  Navigation,
  Compass,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Coffee,
  BookOpen,
  Home,
  DoorOpen,
} from "lucide-react";

const CAMPUS_LOCATIONS = [
  {
    id: "Library",
    name: "Central Library",
    type: "Academic",
    icon: BookOpen,
    emoji: "📚",
    x: 44,
    y: 35,
    tag: "Textbooks, Tech & Notes",
    recommendedSpot: "Ground floor atrium near main turnstiles",
    hours: "8:00 AM – 11:00 PM",
    safetyScore: "High Security (CCTV)",
    description: "The primary study hub with quiet exchange desks and power outlets.",
  },
  {
    id: "Canteen",
    name: "Campus Canteen Plaza",
    type: "Social",
    icon: Coffee,
    emoji: "☕",
    x: 62,
    y: 54,
    tag: "Hostel Gear, Gadgets & Bikes",
    recommendedSpot: "Covered seating area near entrance 2",
    hours: "7:30 AM – 10:30 PM",
    safetyScore: "High Activity Zone",
    description: "The liveliest campus meeting point. Perfect for daytime handoffs.",
  },
  {
    id: "Academic Block",
    name: "Academic Block",
    type: "Laboratories",
    icon: Building2,
    emoji: "🏢",
    x: 26,
    y: 28,
    tag: "Lab Coats, Drafters & Calculators",
    recommendedSpot: "Main lobby notice board foyer",
    hours: "8:00 AM – 6:00 PM",
    safetyScore: "Monitored Atrium",
    description: "Home to engineering labs, lecture halls, and academic departments.",
  },
  {
    id: "Main Gate",
    name: "Main Campus Gate",
    type: "Transit",
    icon: DoorOpen,
    emoji: "🚪",
    x: 52,
    y: 14,
    tag: "Bicycles & Large Equipment",
    recommendedSpot: "Visitor waiting lounge next to security booth",
    hours: "24/7 Security Present",
    safetyScore: "Guarded 24/7",
    description: "Ideal for bicycle exchanges and bulky items with vehicle access.",
  },
  {
    id: "Hostel-A",
    name: "Hostel-A (North Quad)",
    type: "Residence",
    icon: Home,
    emoji: "🛏️",
    x: 22,
    y: 68,
    tag: "Room Essentials & Sports Gear",
    recommendedSpot: "Hostel common room or entrance foyer",
    hours: "6:00 AM – 10:00 PM",
    safetyScore: "Warden Monitored",
    description: "North student residence quad. Convenient for evening handovers.",
  },
  {
    id: "Hostel-B",
    name: "Hostel-B (South Quad)",
    type: "Residence",
    icon: Home,
    emoji: "🛏️",
    x: 48,
    y: 82,
    tag: "Appliances, Books & Stationery",
    recommendedSpot: "Hostel security desk reception",
    hours: "6:00 AM – 10:00 PM",
    safetyScore: "Warden Monitored",
    description: "South student residence block. Convenient for southern campus peers.",
  },
  {
    id: "Hostel-C",
    name: "Hostel-C (Grad Quad)",
    type: "Residence",
    icon: Home,
    emoji: "🛏️",
    x: 78,
    y: 72,
    tag: "Monitors, Cables & Electronics",
    recommendedSpot: "East garden courtyard benches",
    hours: "6:00 AM – 10:00 PM",
    safetyScore: "Resident Foyer",
    description: "East campus graduate and senior student accommodation block.",
  },
];

const CampusMapModal = ({ isOpen, onClose, onSelectHub, selectedHub = "", hubCounts = {} }) => {
  const [activeHubId, setActiveHubId] = useState(selectedHub || "Library");

  if (!isOpen) return null;

  const activeHub =
    CAMPUS_LOCATIONS.find((h) => h.id === activeHubId) || CAMPUS_LOCATIONS[0];

  const handleSelect = (hubId) => {
    if (onSelectHub) {
      onSelectHub(hubId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#111827]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Campus Pickup Hubs Map
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified safe meeting spots across campus for item inspection & handover
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid md:grid-cols-12 overflow-y-auto min-h-0">
          {/* Map Vector Visualizer (7 cols) */}
          <div className="md:col-span-7 p-4 sm:p-6 bg-slate-950 flex flex-col justify-between relative overflow-hidden select-none">
            {/* Map Background Grid & Roads Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Stylized Campus Roads & Zones (SVG) */}
            <svg
              className="w-full h-[320px] sm:h-[380px] my-auto"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Campus Boundary */}
              <rect
                x="8"
                y="8"
                width="84"
                height="84"
                rx="8"
                fill="#0b0f19"
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Green Quads / Parks */}
              <rect
                x="32"
                y="45"
                width="20"
                height="18"
                rx="4"
                fill="#064e3b"
                fillOpacity="0.35"
                stroke="#059669"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              <text x="36" y="55" fill="#34d399" fontSize="2.8" fontWeight="bold">
                CENTRAL LAWN
              </text>

              <rect
                x="68"
                y="20"
                width="18"
                height="22"
                rx="4"
                fill="#1e1b4b"
                fillOpacity="0.4"
                stroke="#6366f1"
                strokeWidth="0.5"
              />
              <text x="70" y="32" fill="#818cf8" fontSize="2.5" fontWeight="bold">
                SPORTS COMPLEX
              </text>

              {/* Main Arterial Roadways */}
              <path
                d="M 52 8 L 52 92"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 8 50 L 92 50"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 26 28 L 52 50 L 78 72"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeDasharray="1.5 1.5"
              />

              {/* Interactive Hub Node Pins */}
              {CAMPUS_LOCATIONS.map((hub) => {
                const isActive = hub.id === activeHubId;
                const count = hubCounts[hub.id] ?? null;

                return (
                  <g
                    key={hub.id}
                    className="cursor-pointer transition-transform"
                    onClick={() => setActiveHubId(hub.id)}
                  >
                    {/* Pulsing ring on active */}
                    {isActive && (
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r="6"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="1"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer Node Circle */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={isActive ? "4.5" : "3.5"}
                      fill={isActive ? "#f97316" : "#1e293b"}
                      stroke={isActive ? "#fed7aa" : "#475569"}
                      strokeWidth={isActive ? "1" : "0.6"}
                      className="transition-all duration-200"
                    />

                    {/* Hub Identifier Emoji / Dot */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={isActive ? "2" : "1.5"}
                      fill={isActive ? "#ffffff" : "#f97316"}
                    />

                    {/* Hub Label */}
                    <text
                      cx={hub.x}
                      x={hub.x}
                      y={hub.y - (isActive ? 6 : 5)}
                      textAnchor="middle"
                      fill={isActive ? "#ffffff" : "#94a3b8"}
                      fontSize={isActive ? "3.2" : "2.6"}
                      fontWeight={isActive ? "900" : "600"}
                      className="select-none transition-all"
                    >
                      {hub.emoji} {hub.name}
                    </text>

                    {/* Item count badge if available */}
                    {count !== null && (
                      <text
                        x={hub.x + 4.5}
                        y={hub.y + 4.5}
                        fill="#f97316"
                        fontSize="2.2"
                        fontWeight="bold"
                      >
                        {count}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Bottom Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <span>Selected Hub</span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 ml-2" />
                <span>Other Hubs</span>
              </div>
              <div className="text-slate-400 font-mono text-[10px]">
                Click any campus landmark to preview
              </div>
            </div>
          </div>

          {/* Details Sidebar (5 cols) */}
          <div className="md:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-white dark:bg-[#111827] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
            <div className="space-y-4">
              {/* Hub Title Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-2xl border border-orange-500/20">
                    {activeHub.emoji}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      {activeHub.type} Hub
                    </span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {activeHub.name}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeHub.description}
              </p>

              {/* Hub Quick Info Cards */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1a2234] border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Navigation className="w-3 h-3 text-orange-500" />
                    <span>Recommended Handover Spot</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeHub.recommendedSpot}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1a2234] border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Operating Hours
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {activeHub.hours}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1a2234] border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>Safety Rating</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {activeHub.safetyScore}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40">
                  <div className="text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Popular Items Here</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {activeHub.tag}
                  </div>
                </div>
              </div>

              {/* Hub Quick Selector Strip */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Jump to Campus Hub
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CAMPUS_LOCATIONS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setActiveHubId(h.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        h.id === activeHubId
                          ? "bg-orange-500 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {h.emoji} {h.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleSelect(activeHub.id)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-2xl text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>Filter Browse by {activeHub.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect("")}
                className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Clear Location Filter & View All Campus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusMapModal;
