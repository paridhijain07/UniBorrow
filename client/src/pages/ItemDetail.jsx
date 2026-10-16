import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import { useItem, useSimilarItems } from "../hooks/useItems.js";
import { useItemReviews } from "../hooks/useReviews.js";
import { useCreateBooking, useMyRequests } from "../hooks/useBookings.js";

import AvailabilityCalendar from "../components/uniborrow/AvailabilityCalendar.jsx";
import BookingModal from "../components/uniborrow/BookingModal.jsx";
import ReviewForm from "../components/uniborrow/ReviewForm.jsx";
import ReviewCard from "../components/uniborrow/ReviewCard.jsx";
import { getItemBookings } from "../api/bookings.api";
import { MapPin, Clock, MessageSquare, ShieldCheck, ArrowLeft, Star, Sparkles } from "lucide-react";

const ItemDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useAuth();
  const authed = Boolean(user?.id);

  const { item, loading: itemLoading, error: itemError } = useItem(id);
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useItemReviews(id);

  const { fetchSimilar } = useSimilarItems();
  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const { create: createBooking, pending: bookingPending, error: bookingError } =
    useCreateBooking();

  const { data: myRequests, loading: _myRequestsLoading, refetch: refetchMyRequests } =
    useMyRequests();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!authed) return;
    // Load my bookings to determine review eligibility.
    refetchMyRequests().catch(() => {});
  }, [authed, refetchMyRequests]);

  const reviewBooking = useMemo(() => {
    if (!authed) return null;
    const itId = item?.item?._id;
    if (!itId) return null;

    return myRequests.find((b) => {
      const bookedItemId = b?.item?._id || b?.item;
      return (
        String(bookedItemId) === String(itId) &&
        b?.status === "returned" &&
        b?.reviewLeft === false
      );
    });
  }, [authed, myRequests, item]);

  const ownerId = item?.owner?._id || item?.owner?.id || item?.owner;
  const ownerName = item?.owner?.name || "";

  useEffect(() => {
    const currentItem = item?.item;
    if (!currentItem?.category || !ownerId) return;

    setSimilarLoading(true);
    fetchSimilar({
      category: currentItem.category,
      excludeOwnerId: ownerId,
    })
      .then((list) => setSimilar(list.slice(0, 3)))
      .catch(() => setSimilar([]))
      .finally(() => setSimilarLoading(false));
  }, [item, ownerId, fetchSimilar]);

  const listedAgeText = useMemo(() => {
    if (!item?.item?.createdAt) return "";
    const days = Math.max(
      0,
      Math.floor((Date.now() - new Date(item.item.createdAt).getTime()) / 86400000)
    );
    return `Listed ${days} day(s) ago`;
  }, [item]);

  // const approvedBookings = item?.approvedBookings ?? [];
 

const [bookings, setBookings] = useState([]);

useEffect(() => {
  const fetchBookings = async () => {
    try {
      const res = await getItemBookings(id);
      console.log("BOOKINGS API:", res); // 👈 ADD THIS
      setBookings(res.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchBookings();
}, [id]);

const bookedRanges = useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return bookings
    .filter((b) => new Date(b.endDate) >= today)
    .map((b) => ({
      startDate: new Date(b.startDate),
      endDate: new Date(b.endDate),
    }));
}, [bookings]);

  const images = item?.item?.images ?? [];
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => {
    setActiveImgIdx(0);
  }, [id]);

  const openRequest = () => {
    if (!authed) {
      toast.error("Please login to request borrowing.");
      navigate("/login");
      return;
    }
    setBookingModalOpen(true);
  };

  const openChat = () => {
    if (!authed) {
      toast.error("Please login to message the owner.");
      navigate("/login");
      return;
    }
    if (!ownerId) {
      toast.error("Owner not found.");
      return;
    }
    navigate(`/chat/${ownerId}`);
  };

  const handleConfirmBooking = async ({ startDate, endDate }) => {
    try {
      await createBooking({ itemId: id, startDate, endDate });
      toast.success("Booking request sent!");
      setBookingModalOpen(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit booking request"
      );
    }
  };

  if (itemLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-slate-200/70 dark:bg-slate-800/60 h-[460px] animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
            <div className="h-6 bg-slate-200/70 dark:bg-slate-800/60 rounded-xl animate-pulse" />
            <div className="h-28 bg-slate-200/70 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
            <div className="h-14 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (itemError || !item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-10 shadow-sm">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Listing Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {itemError || "The item you're looking for may have been removed or returned to its owner."}
          </p>
          <button
            onClick={() => navigate("/browse")}
            className="mt-6 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 transition-all text-sm"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const currentItem = item.item || item;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* BACK NAVIGATION */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors"
      >
        <ArrowLeft size={16} /> Back to results
      </button>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: IMAGES & AVAILABILITY */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#1a2234] border border-slate-200/60 dark:border-slate-800/60 relative">
              {images?.[activeImgIdx] ? (
                <img
                  src={images[activeImgIdx]}
                  alt={currentItem?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium">
                  No image available
                </div>
              )}
              <span
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider ${
                  currentItem?.listingType === "Rent"
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/25"
                    : "bg-emerald-500 text-white shadow-emerald-500/25"
                }`}
              >
                {currentItem?.listingType === "Rent" ? "For Rent" : "Free Exchange"}
              </span>
            </div>

            {images?.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-auto pb-1">
                {images.map((src, idx) => {
                  const active = idx === activeImgIdx;
                  return (
                    <button
                      type="button"
                      key={`${src}-${idx}`}
                      onClick={() => setActiveImgIdx(idx)}
                      className={
                        "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 " +
                        (active
                          ? "border-orange-500 ring-2 ring-orange-500/20 scale-105"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700")
                      }
                    >
                      <img
                        src={src}
                        alt={`${currentItem?.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <AvailabilityCalendar bookedRanges={bookedRanges} />
        </div>

        {/* RIGHT COLUMN: DETAILS, PRICING, OWNER, REVIEWS */}
        <div className="space-y-6">
          {/* MAIN INFO CARD */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                  {currentItem?.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700">
                  Condition: {currentItem?.condition}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {currentItem?.title}
              </h1>

              {/* PRICING BLOCK */}
              <div className="bg-slate-50 dark:bg-[#1a2234] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Rental Price
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                    {currentItem?.listingType === "Exchange" || currentItem?.price === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Free Exchange</span>
                    ) : (
                      <span>
                        ₹{currentItem?.price}
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/day</span>
                      </span>
                    )}
                  </div>
                </div>

                {currentItem?.originalPrice > 0 && currentItem?.price > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Original Retail</div>
                    <div className="text-sm font-bold text-slate-400 line-through">
                      ₹{currentItem.originalPrice}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-orange-500" />
                  Pickup: <strong className="text-slate-800 dark:text-slate-200">{currentItem?.pickupLocation}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} />
                  {listedAgeText}
                </span>
              </div>

              {/* CTA BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={openRequest}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl px-6 py-3.5 transition-all duration-200 shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 text-center"
                >
                  Request to Borrow
                </button>
                <button
                  type="button"
                  onClick={openChat}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold rounded-xl px-6 py-3.5 transition-all duration-200 border border-slate-200 dark:border-slate-700"
                >
                  <MessageSquare size={16} />
                  Message Owner
                </button>
              </div>

              {bookingModalOpen && (
                <BookingModal
                  open={bookingModalOpen}
                  item={currentItem}
                  bookedRanges={bookedRanges}
                  onClose={() => setBookingModalOpen(false)}
                  pending={bookingPending}
                  error={bookingError}
                  onConfirm={handleConfirmBooking}
                />
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Item Description</h2>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {currentItem?.description}
            </p>
            {Array.isArray(currentItem?.tags) && currentItem.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                {currentItem.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* OWNER CARD */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Owner Information</h2>
              <button
                onClick={() => ownerId && navigate(`/profile/${ownerId}`)}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
              >
                View Profile →
              </button>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={item?.owner?.avatar || "/default-avatar.svg"}
                alt={ownerName || "Owner"}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 dark:border-slate-800 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-bold text-slate-900 dark:text-white text-base truncate">
                    {ownerName || "Campus Peer"}
                  </div>
                  {item?.owner?.verifiedBadge && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                  <span className="flex items-center gap-1">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    {item?.owner?.rating ? item.owner.rating.toFixed(1) : "5.0"} Trust Score
                  </span>
                  <span>•</span>
                  <span>{item?.owner?.totalLent || 0} items lent</span>
                  <span>•</span>
                  <span>{item?.owner?.responseRate || 100}% response</span>
                </div>
              </div>
            </div>
          </div>

          {/* REVIEWS SECTION */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Student Reviews ({reviews?.length || 0})
              </h2>
            </div>

            {reviewsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse"
                  />
                ))}
              </div>
            ) : reviewsError ? (
              <div className="text-sm text-rose-500 font-medium">
                {reviewsError}
              </div>
            ) : reviews?.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No reviews yet for this listing. Be the first to share feedback after returning.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <ReviewCard key={r._id} review={r} />
                ))}
              </div>
            )}

            {authed && reviewBooking && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <ReviewForm
                  bookingId={reviewBooking._id || reviewBooking.id}
                  onSuccess={() => {
                    refetchReviews().catch(() => {});
                    refetchMyRequests().catch(() => {});
                  }}
                />
              </div>
            )}
          </div>

          {/* SIMILAR ITEMS */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-orange-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Similar in {currentItem?.category}
              </h2>
            </div>

            {similarLoading ? (
              <div className="grid sm:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse"
                  />
                ))}
              </div>
            ) : similar.length === 0 ? (
              <div className="text-xs text-slate-500 dark:text-slate-400 py-3">
                No other items in this category currently.
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                {similar.map((it) => (
                  <button
                    key={it._id}
                    type="button"
                    className="text-left rounded-2xl bg-slate-50 dark:bg-[#1a2234] border border-slate-200/70 dark:border-slate-800/70 p-3 hover:border-orange-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
                    onClick={() => navigate(`/item/${it._id}`)}
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                      {it.images?.[0] ? (
                        <img
                          src={it.images[0]}
                          alt={it.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-orange-500 transition-colors">
                      {it.title}
                    </div>
                    <div className="mt-1 text-xs font-black text-slate-700 dark:text-slate-300">
                      {it.listingType === "Exchange" || it.price === 0
                        ? "Free Exchange"
                        : `₹${it.price}/day`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;

