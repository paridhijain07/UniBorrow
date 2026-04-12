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

  const { data: myRequests, loading: myRequestsLoading, error: myRequestsError, refetch: refetchMyRequests } =
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
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-white/60 border border-white/40 h-[420px] animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 bg-white/60 border border-white/40 rounded-2xl animate-pulse" />
            <div className="h-6 bg-white/60 border border-white/40 rounded-2xl animate-pulse" />
            <div className="h-6 bg-white/60 border border-white/40 rounded-2xl animate-pulse" />
            <div className="h-12 bg-white/60 border border-white/40 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (itemError || !item) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-6 text-[#ef4444] font-semibold">
          {itemError || "Item not found"}
        </div>
      </div>
    );
  }

  const currentItem = item.item || item; // support either shape.

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 shadow-md p-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white/60 border border-white/40">
              {images?.[activeImgIdx] ? (
                <img
                  src={images[activeImgIdx]}
                  alt={currentItem?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#64748b] font-semibold">
                  No image
                </div>
              )}
            </div>
            {images?.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-auto">
                {images.map((src, idx) => {
                  const active = idx === activeImgIdx;
                  return (
                    <button
                      type="button"
                      key={`${src}-${idx}`}
                      onClick={() => setActiveImgIdx(idx)}
                      className={
                        "w-16 h-16 rounded-xl overflow-hidden border transition-all duration-200 " +
                        (active ? "border-[#f97316]" : "border-white/40")
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

        <div className="space-y-5">
          <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-extrabold text-[#0f172a] leading-tight">
                {currentItem?.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span
                  className={
                    "px-3 py-1 rounded-full text-xs font-semibold border " +
                    (currentItem?.listingType === "Rent"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-green-100 text-green-700 border-green-200")
                  }
                >
                  {currentItem?.listingType === "Rent"
                    ? "Rent"
                    : "Exchange"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/60 text-[#0f172a] border border-white/40">
                  {currentItem?.condition}
                </span>
              </div>

              <div>
                <div className="text-sm text-[#64748b]">Price</div>
                <div className="text-2xl font-extrabold text-[#0f172a] mt-1">
                  {currentItem?.listingType === "Exchange" || currentItem?.price === 0 ? (
                    <span>Free Exchange</span>
                  ) : (
                    <span>
                      ₹{currentItem?.price}/day
                      {currentItem?.originalPrice &&
                        currentItem.originalPrice > 0 && (
                          <span className="ml-3 text-sm text-[#64748b] line-through font-semibold">
                            ₹{currentItem.originalPrice}
                          </span>
                        )}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-[#64748b] font-semibold">
                {listedAgeText}
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-[#0f172a]">
                  Pickup location
                </div>
                <div className="mt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/60 text-[#0f172a] border border-white/40">
                    {currentItem?.pickupLocation}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={openRequest}
                  className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25"
                >
                  Request to Borrow
                </button>
                <button
                  type="button"
                  onClick={openChat}
                  className="bg-white/80 hover:bg-white text-[#0f172a] font-semibold rounded-xl px-6 py-3 transition-all duration-200 border border-white/40"
                >
                  Message Owner
                </button>
              </div>

              {bookingModalOpen && (
                <BookingModal
                  open={bookingModalOpen}
                  item={currentItem}
                  onClose={() => setBookingModalOpen(false)}
                  pending={bookingPending}
                  error={bookingError}
                  onConfirm={handleConfirmBooking}
                />
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-extrabold text-[#0f172a]">Description</h2>
            <p className="mt-3 text-sm text-[#0f172a] leading-relaxed">
              {currentItem?.description}
            </p>
            {Array.isArray(currentItem?.tags) && currentItem.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentItem.tags.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/60 text-[#0f172a] border border-white/40"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-extrabold text-[#0f172a]">Owner</h2>
            <div className="mt-4 flex items-center gap-4">
              <img
                src={
                  item?.owner?.avatar ||
                  "https://via.placeholder.com/80x80.png?text=U"
                }
                alt={ownerName || "Owner"}
                className="w-16 h-16 rounded-full object-cover border border-white/40"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-extrabold text-[#0f172a] text-lg">
                    {ownerName || "Unknown"}
                  </div>
                  {item?.owner?.verifiedBadge && (
                    <span className="text-xs font-extrabold bg-orange-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm text-[#64748b] font-semibold">
                  Rating: {item?.owner?.rating ? item.owner.rating.toFixed(1) : "0.0"}{" "}
                  <span className="text-xs text-[#64748b]">(Trust score)</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#64748b] font-semibold">
                  <span>Fellows lent: {item?.owner?.totalLent || 0}</span>
                  <span>Response: {item?.owner?.responseRate || 100}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-extrabold text-[#0f172a]">Reviews</h2>
            {reviewsLoading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 rounded-2xl bg-white/60 border border-white/40 animate-pulse"
                  />
                ))}
              </div>
            ) : reviewsError ? (
              <div className="mt-4 text-sm text-[#ef4444] font-semibold">
                {reviewsError}
              </div>
            ) : reviews?.length === 0 ? (
              <div className="mt-4 text-sm text-[#64748b] font-semibold">
                No reviews yet. Be the first after a successful return.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <ReviewCard key={r._id} review={r} />
                ))}
              </div>
            )}

            {authed && reviewBooking && (
              <div className="mt-6">
                <ReviewForm
                  bookingId={reviewBooking._id || reviewBooking.id}
                  onSuccess={() => {
                    refetchReviews().catch(() => {});
                    refetchMyRequests().catch(() => {});
                  }}
                />
              </div>
            )}

            {authed && !myRequestsLoading && !reviewBooking && (
              <div className="mt-4 text-sm text-[#64748b] font-semibold">
                Leave a review after returning this item.
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-extrabold text-[#0f172a]">
              Similar items
            </h2>
            {similarLoading ? (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[220px] rounded-2xl bg-white/60 border border-white/40 animate-pulse"
                  />
                ))}
              </div>
            ) : similar.length === 0 ? (
              <div className="mt-4 text-sm text-[#64748b] font-semibold">
                No similar items found right now.
              </div>
            ) : (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {similar.map((it) => (
                  <button
                    key={it._id}
                    type="button"
                    className="text-left rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 p-4 shadow-md hover:scale-[1.02] hover:shadow-xl transition-all duration-200"
                    onClick={() => navigate(`/item/${it._id}`)}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden border border-white/40 bg-white/60">
                      {it.images?.[0] ? (
                        <img
                          src={it.images[0]}
                          alt={it.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#64748b] text-sm font-semibold">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="mt-3 font-extrabold text-[#0f172a]">
                      {it.title}
                    </div>
                    <div className="mt-2 text-sm text-[#64748b] font-semibold">
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

