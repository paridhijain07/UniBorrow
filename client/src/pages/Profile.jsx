import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Star,
  MessageSquare,
  Package,
  Edit3,
  CheckCircle,
  X,
  ExternalLink,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import { getUserProfile, updateProfile } from "../api/users.api.js";
import ReviewCard from "../components/uniborrow/ReviewCard.jsx";

const pickupZones = [
  "Library",
  "Canteen",
  "Hostel-A",
  "Hostel-B",
  "Hostel-C",
  "Main Gate",
  "Academic Block",
];

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("listings"); // listings | reviews

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPickupZone, setEditPickupZone] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const isMe = Boolean(authUser?.id && String(authUser.id) === String(id));

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    setError("");

    getUserProfile(id)
      .then((data) => {
        if (!alive) return;
        setProfileData(data);
        if (data?.user) {
          setEditName(data.user.name || "");
          setEditBio(data.user.bio || "");
          setEditPickupZone(data.user.pickupZone || "Library");
        }
      })
      .catch((err) => {
        if (!alive) return;
        setError(
          err?.response?.data?.message || err?.message || "Failed to load user profile"
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setEditSaving(true);
      const res = await updateProfile({
        name: editName.trim(),
        bio: editBio.trim(),
        pickupZone: editPickupZone,
      });
      toast.success("Profile updated successfully!");
      if (res?.user) {
        setProfileData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            ...res.user,
          },
        }));
      }
      setEditOpen(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update profile"
      );
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-48 bg-white/70 dark:bg-[#18181b]/70 rounded-3xl p-6 border border-gray-200 dark:border-[#27272a]">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 bg-gray-300 dark:bg-[#27272a] rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-gray-300 dark:bg-[#27272a] rounded" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-[#222225] rounded" />
            </div>
          </div>
        </div>
        <div className="h-64 bg-white/70 dark:bg-[#18181b]/70 rounded-3xl border border-gray-200 dark:border-[#27272a]" />
      </div>
    );
  }

  if (error || !profileData?.user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border border-gray-200 dark:border-[#27272a] p-8 rounded-3xl shadow-sm">
          <div className="text-4xl mb-3">🎓</div>
          <h2 className="text-xl font-bold text-[#0f172a] dark:text-[#f4f4f5]">
            User Not Found
          </h2>
          <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-2">
            {error || "The requested student profile could not be located."}
          </p>
          <button
            onClick={() => navigate("/browse")}
            className="mt-6 px-5 py-2.5 bg-[#f97316] text-white font-semibold rounded-xl hover:bg-[#ea6c0a] transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const { user, items = [], reviews = [] } = profileData;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      })
    : "Recently";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER HERO CARD */}
      <div className="bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border border-white/40 dark:border-[#27272a] rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user.avatar || "/default-avatar.svg"}
                alt={user.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white dark:border-[#27272a] shadow-md"
              />
              {user.verifiedBadge && (
                <div
                  className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full shadow"
                  title="Verified Student"
                >
                  <ShieldCheck size={16} />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">
                  {user.name}
                </h1>
                {user.verifiedBadge ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    <CheckCircle size={12} /> Verified Student
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    Campus Member
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs md:text-sm text-[#64748b] dark:text-[#a1a1aa] mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={15} className="text-[#f97316]" />
                  {user.pickupZone || "Campus"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={15} />
                  Joined {joinDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isMe ? (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-[#27272a] border border-gray-200 dark:border-[#3f3f46] text-[#0f172a] dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-[#323238] transition-all shadow-sm"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/chat/${user.id}`)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-orange-500/25"
              >
                <MessageSquare size={16} /> Send Message
              </button>
            )}
          </div>
        </div>

        {/* BIO */}
        {user.bio ? (
          <p className="mt-6 text-sm md:text-base text-[#334155] dark:text-[#d4d4d8] leading-relaxed max-w-3xl">
            {user.bio}
          </p>
        ) : isMe ? (
          <p className="mt-4 text-sm text-[#94a3b8] italic">
            Add a bio to let fellow campus students know what you study or like sharing.
          </p>
        ) : null}

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-[#27272a]">
          <div className="bg-gray-50/70 dark:bg-[#202024]/70 p-3.5 rounded-2xl border border-gray-100 dark:border-[#2c2c32]">
            <div className="text-xs text-[#64748b] dark:text-[#a1a1aa] font-medium flex items-center gap-1">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              Rating
            </div>
            <div className="text-xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5] mt-1">
              {Number(user.rating || 0).toFixed(1)}{" "}
              <span className="text-xs font-normal text-gray-500">
                ({user.totalRatings || 0})
              </span>
            </div>
          </div>

          <div className="bg-gray-50/70 dark:bg-[#202024]/70 p-3.5 rounded-2xl border border-gray-100 dark:border-[#2c2c32]">
            <div className="text-xs text-[#64748b] dark:text-[#a1a1aa] font-medium">
              Response Rate
            </div>
            <div className="text-xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5] mt-1">
              {user.responseRate ?? 100}%
            </div>
          </div>

          <div className="bg-gray-50/70 dark:bg-[#202024]/70 p-3.5 rounded-2xl border border-gray-100 dark:border-[#2c2c32]">
            <div className="text-xs text-[#64748b] dark:text-[#a1a1aa] font-medium">
              Items Lent
            </div>
            <div className="text-xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5] mt-1">
              {user.totalLent || 0}
            </div>
          </div>

          <div className="bg-gray-50/70 dark:bg-[#202024]/70 p-3.5 rounded-2xl border border-gray-100 dark:border-[#2c2c32]">
            <div className="text-xs text-[#64748b] dark:text-[#a1a1aa] font-medium">
              Borrowed
            </div>
            <div className="text-xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5] mt-1">
              {user.totalBorrowed || 0}
            </div>
          </div>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="flex border-b border-gray-200 dark:border-[#27272a] gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          className={`pb-3 font-bold text-base transition-colors relative flex items-center gap-2 ${
            activeTab === "listings"
              ? "text-[#f97316] border-b-2 border-[#f97316]"
              : "text-[#64748b] dark:text-[#a1a1aa] hover:text-[#0f172a] dark:hover:text-white"
          }`}
        >
          <Package size={18} />
          Active Listings ({items.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 font-bold text-base transition-colors relative flex items-center gap-2 ${
            activeTab === "reviews"
              ? "text-[#f97316] border-b-2 border-[#f97316]"
              : "text-[#64748b] dark:text-[#a1a1aa] hover:text-[#0f172a] dark:hover:text-white"
          }`}
        >
          <Star size={18} />
          Reviews Received ({reviews.length})
        </button>
      </div>

      {/* TAB CONTENT: LISTINGS */}
      {activeTab === "listings" && (
        <div>
          {items.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#18181b]/80 border border-gray-200 dark:border-[#27272a] p-12 rounded-3xl text-center">
              <Package size={40} className="mx-auto text-gray-400 mb-3" />
              <div className="font-bold text-[#0f172a] dark:text-[#f4f4f5] text-lg">
                No items listed yet
              </div>
              <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">
                {isMe
                  ? "Share your books, calculators, and essentials with classmates!"
                  : "This student has no active listings at the moment."}
              </p>
              {isMe && (
                <button
                  type="button"
                  onClick={() => navigate("/add-item")}
                  className="mt-5 px-5 py-2.5 bg-[#f97316] text-white rounded-xl font-bold hover:bg-[#ea6c0a] transition-all shadow-sm"
                >
                  List an Item Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((it) => (
                <div
                  key={it._id}
                  onClick={() => navigate(`/item/${it._id}`)}
                  className="group bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border border-gray-200 dark:border-[#27272a] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col"
                >
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-[#202024] relative overflow-hidden">
                    {it.images?.[0] ? (
                      <img
                        src={it.images[0]}
                        alt={it.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow-sm ${
                        it.listingType === "Rent"
                          ? "bg-orange-500 text-white"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {it.listingType}
                    </span>
                    <span
                      className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-sm ${
                        it.status === "available"
                          ? "bg-green-100 text-green-800"
                          : it.status === "rented"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {it.status}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">
                        {it.category} • {it.condition}
                      </div>
                      <h3 className="font-bold text-[#0f172a] dark:text-[#f4f4f5] text-base mt-1 line-clamp-1 group-hover:text-[#f97316] transition-colors">
                        {it.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#27272a] flex items-center justify-between text-sm">
                      <div className="font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">
                        {it.listingType === "Exchange" || it.price === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Free Exchange
                          </span>
                        ) : (
                          <span>₹{it.price}/day</span>
                        )}
                      </div>
                      <span className="text-xs text-[#f97316] font-semibold flex items-center gap-0.5">
                        View <ExternalLink size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REVIEWS */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#18181b]/80 border border-gray-200 dark:border-[#27272a] p-12 rounded-3xl text-center">
              <Star size={40} className="mx-auto text-gray-400 mb-3" />
              <div className="font-bold text-[#0f172a] dark:text-[#f4f4f5] text-lg">
                No reviews yet
              </div>
              <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">
                Reviews will appear here once items are successfully borrowed and returned.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <ReviewCard key={rev._id} review={rev} />
            ))
          )}
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#3f3f46] rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">
                Edit Profile
              </h2>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0f172a] dark:text-[#f4f4f5] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3f3f46] bg-gray-50 dark:bg-[#202024] text-[#0f172a] dark:text-[#f4f4f5] outline-none focus:ring-2 focus:ring-[#f97316]/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f172a] dark:text-[#f4f4f5] uppercase mb-1">
                  Primary Campus Pickup Zone
                </label>
                <select
                  value={editPickupZone}
                  onChange={(e) => setEditPickupZone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3f3f46] bg-gray-50 dark:bg-[#202024] text-[#0f172a] dark:text-[#f4f4f5] outline-none focus:ring-2 focus:ring-[#f97316]/50"
                >
                  {pickupZones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f172a] dark:text-[#f4f4f5] uppercase mb-1">
                  Bio / About Me
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="e.g. 3rd year CS student. Happy to share engineering textbooks and lab gear!"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3f3f46] bg-gray-50 dark:bg-[#202024] text-[#0f172a] dark:text-[#f4f4f5] outline-none focus:ring-2 focus:ring-[#f97316]/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#3f3f46] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
