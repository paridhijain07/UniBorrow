import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ShieldCheck, Copy, CheckCircle2, X } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import { useBookingActions, useMyRequests, useReceivedRequests } from "../hooks/useBookings.js";
import ReviewForm from "../components/uniborrow/ReviewForm.jsx";

const StatusBadge = ({ status }) => {
  const cls =
    status === "pending"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      : status === "approved"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        : status === "rejected"
          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  return (
    <span className={"px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize " + cls}>
      {status}
    </span>
  );
};

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString();
};

const isOverdue = (booking) => {
  if (!booking) return false;
  const now = Date.now();
  const end = booking.endDate ? new Date(booking.endDate).getTime() : null;
  return booking.status === "approved" && end !== null && end < now;
};

const Bookings = () => {
  const navigate = useNavigate();
  useAuth(); // just to ensure protected pages redirect via PrivateRoute

  const [tab, setTab] = useState("received"); // received | mine
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyTargetBooking, setVerifyTargetBooking] = useState(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [verifiedBookings, setVerifiedBookings] = useState(new Set());
  const [inspectionChecks, setInspectionChecks] = useState({
    functional: true,
    cosmetic: true,
    accessories: true,
  });
  const { data: received, loading: loadingReceived, error: errReceived, refetch: refetchReceived } =
    useReceivedRequests();
  const { data: myRequests, loading: loadingMine, error: errMine, refetch: refetchMine } =
    useMyRequests();

  const { approve, reject, returnBooking, pending: actionPending } = useBookingActions();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);

  const openReview = (booking) => {
    if (!booking) return;
    if (booking.status !== "returned") return;
    if (booking.reviewLeft) return;
    setReviewBookingId(booking._id);
    setReviewModalOpen(true);
  };

  const handleOpenVerify = (booking) => {
    setVerifyTargetBooking(booking);
    setEnteredCode("");
    setInspectionChecks({ functional: true, cosmetic: true, accessories: true });
    setVerifyModalOpen(true);
  };

  const handleConfirmVerify = () => {
    if (!verifyTargetBooking) return;
    const expectedCode = verifyTargetBooking._id.slice(-4).toUpperCase();
    if (enteredCode.trim().toUpperCase() !== expectedCode) {
      toast.error("Incorrect code. Please verify with the borrower's pass.");
      return;
    }
    if (!inspectionChecks.functional || !inspectionChecks.cosmetic || !inspectionChecks.accessories) {
      toast.error("Please complete all 3 physical inspection checklist items.");
      return;
    }
    setVerifiedBookings((prev) => new Set(prev).add(verifyTargetBooking._id));
    toast.success("Handover confirmed! Physical checklist signed off.");
    setVerifyModalOpen(false);
  };

  const handleApprove = async (booking) => {
    try {
      await approve(booking._id);
      toast.success("Booking approved");
      await refetchReceived();
      await refetchMine();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed");
    }
  };

  const handleReject = async (booking) => {
    try {
      await reject(booking._id);
      toast.success("Booking rejected");
      await refetchReceived();
      await refetchMine();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed");
    }
  };

  const handleReturn = async (booking) => {
    try {
      await returnBooking(booking._id);
      toast.success("Marked as returned");
      await refetchReceived();
      await refetchMine();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed");
    }
  };

  const list = tab === "received" ? received : myRequests;
  const loading = tab === "received" ? loadingReceived : loadingMine;
  const error = tab === "received" ? errReceived : errMine;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full pb-16">
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setTab("received")}
            className={
              "px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer " +
              (tab === "received"
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700")
            }
          >
            Requests I Received
          </button>
          <button
            type="button"
            onClick={() => setTab("mine")}
            className={
              "px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer " +
              (tab === "mine"
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700")
            }
          >
            My Borrow Requests
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-2xl p-4 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5 animate-pulse h-[200px]"
                />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              {tab === "received"
                ? "No booking requests received yet."
                : "No borrow requests yet. Request an item from its detail page."}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {list.map((b) => {
                const item = b?.item;
                const borrower = b?.borrower;
                const owner = b?.owner;
                const overdue = isOverdue(b);

                return (
                  <div
                    key={b._id}
                    className={
                      "bg-slate-50/70 dark:bg-slate-800/40 border rounded-2xl p-5 transition-all duration-200 " +
                      (overdue
                        ? "border-rose-400 dark:border-rose-900 ring-2 ring-rose-500/20"
                        : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700")
                    }
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                        {item?.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item?.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                            Gear
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-base truncate">
                              {item?.title || "Item"}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              {tab === "received"
                                ? `Borrower: ${borrower?.name || "Student"}`
                                : `Owner: ${owner?.name || "Student"}`}
                            </div>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              Start Date
                            </div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                              {formatDate(b.startDate)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              End Date
                            </div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                              {formatDate(b.endDate)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Total Rental:
                          </div>
                          <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {item?.listingType === "Exchange" || item?.price === 0
                              ? "Free Exchange"
                              : (
                                <div className="flex items-center gap-1.5">
                                  <span>₹{b.totalCost ?? 0}</span>
                                  {b.penaltyAmount > 0 && (
                                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded-md">
                                      + ₹{b.penaltyAmount} late
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        {overdue && (
                          <div className="mt-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-xl p-2.5 text-xs font-semibold">
                            ⚠ Overdue: Return required urgently.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Handover Verification Pass (Borrower View) */}
                    {tab === "mine" && b.status === "approved" && (
                      <div className="mt-3 bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 rounded-xl p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                              Pickup Handover Pass
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300">
                              Show code to owner at meetup
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-lg border border-orange-500/30 shadow-xs">
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white tracking-widest">
                            {b._id.slice(-4).toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(b._id.slice(-4).toUpperCase());
                              toast.success("Pickup code copied to clipboard!");
                            }}
                            className="text-slate-400 hover:text-orange-500 transition-colors p-0.5"
                            title="Copy pickup code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Handover Verified Banner (Owner View) */}
                    {tab === "received" && verifiedBookings.has(b._id) && (
                      <div className="mt-3 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Handover physically verified. Item in active use.</span>
                      </div>
                    )}

                    {verifiedBookings.has(b._id) && (
                      <div className="mt-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Handover Handshake Completed • Checklist Passed</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600/80 dark:text-emerald-400/80">
                          Pass: #{b._id.slice(-4).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Direct Chat Shortcut */}
                        <button
                          type="button"
                          onClick={() => {
                            const peerId = tab === "received" ? borrower?._id : owner?._id;
                            if (peerId) {
                              navigate(`/chat/${peerId}?itemId=${item?._id || ""}`);
                            }
                          }}
                          className="bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-orange-950/30 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 font-bold text-xs rounded-xl px-3 py-2 flex items-center gap-1.5 transition-colors border border-slate-200/60 dark:border-slate-700 cursor-pointer"
                          title="Open chat with student"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                          <span>Chat</span>
                        </button>

                        {tab === "received" && (
                          <>
                            {b.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionPending}
                                  onClick={() => handleApprove(b)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
                                >
                                  Approve Request
                                </button>
                                <button
                                  type="button"
                                  disabled={actionPending}
                                  onClick={() => handleReject(b)}
                                  className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-bold text-xs rounded-xl px-4 py-2 border border-rose-200 dark:border-rose-900/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {b.status === "approved" && (
                              <>
                                {!verifiedBookings.has(b._id) && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenVerify(b)}
                                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl px-3.5 py-2 shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Verify Handover</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={actionPending}
                                  onClick={() => handleReturn(b)}
                                  className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl px-4 py-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  Confirm Item Returned
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {tab === "mine" && (
                          <>
                            {b.status === "returned" && !b.reviewLeft && (
                              <button
                                type="button"
                                disabled={actionPending}
                                onClick={() => openReview(b)}
                                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl px-4 py-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Leave a Review
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {reviewModalOpen && reviewBookingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-2xl">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Submit Review
                </h3>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="mt-4">
                <ReviewForm
                  bookingId={reviewBookingId}
                  onSuccess={async () => {
                    setReviewModalOpen(false);
                    await refetchMine();
                    await refetchReceived();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Handover Verification Modal (Owner View) */}
      {verifyModalOpen && verifyTargetBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Verify Pickup Handover
                  </h3>
                  <p className="text-[11px] text-slate-400">Campus Security Handshake</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Item Snapshot */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#161f30] border border-slate-200/80 dark:border-slate-800">
                <img
                  src={verifyTargetBooking?.item?.images?.[0] || "/default-item.svg"}
                  alt={verifyTargetBooking?.item?.title || "Item"}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {verifyTargetBooking?.item?.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Borrower: <span className="font-semibold text-slate-800 dark:text-slate-200">{verifyTargetBooking?.borrower?.name}</span>
                  </div>
                  {verifyTargetBooking?.item?.pickupLocation && (
                    <div className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1 mt-0.5">
                      <span>📍 {verifyTargetBooking.item.pickupLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Handover Inspection Checklist */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Physical Inspection Checklist</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={inspectionChecks.functional}
                      onChange={(e) => setInspectionChecks(prev => ({ ...prev, functional: e.target.checked }))}
                      className="rounded text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-500"
                    />
                    <span>Item powers on & functions as expected</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={inspectionChecks.cosmetic}
                      onChange={(e) => setInspectionChecks(prev => ({ ...prev, cosmetic: e.target.checked }))}
                      className="rounded text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-500"
                    />
                    <span>Screen & physical body inspected (no new cracks/dents)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={inspectionChecks.accessories}
                      onChange={(e) => setInspectionChecks(prev => ({ ...prev, accessories: e.target.checked }))}
                      className="rounded text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-500"
                    />
                    <span>Charger, cables & included accessories present</span>
                  </label>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Enter the 4-digit <strong>Pickup Pass</strong> shown on the borrower&apos;s screen:
              </p>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  4-Digit Handover Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 4829"
                  className="w-full text-center font-mono text-2xl font-black tracking-widest bg-slate-50 dark:bg-[#161f30] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl py-3 outline-none focus:ring-2 focus:ring-orange-500/40 uppercase transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVerify}
                  disabled={enteredCode.trim().length !== 4}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Confirm Handover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;

