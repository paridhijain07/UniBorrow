// import { useState } from "react";

// import {
//   approveBooking,
//   createBooking,
//   getMyRequests,
//   getReceivedRequests,
//   rejectBooking,
//   returnBooking,
// } from "../api/bookings.api.js";

// export const useCreateBooking = () => {
//   const [pending, setPending] = useState(false);
//   const [error, setError] = useState("");

//   const run = async ({ itemId, startDate, endDate }) => {
//     setPending(true);
//     setError("");
//     try {
//       const res = await createBooking({ itemId, startDate, endDate });
//       return res;
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message || err?.message || "Failed to create booking";
//       setError(msg);
//       throw err;
//     } finally {
//       setPending(false);
//     }
//   };

//   return { create: run, pending, error };
// };

// export const useMyRequests = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const refetch = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await getMyRequests();
//       setData(res?.bookings ?? []);
//     } catch (err) {
//       setError(err?.response?.data?.message || err?.message || "Failed to load");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { data, loading, error, refetch };
// };

// export const useReceivedRequests = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const refetch = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await getReceivedRequests();
//       setData(res?.bookings ?? []);
//     } catch (err) {
//       setError(err?.response?.data?.message || err?.message || "Failed to load");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { data, loading, error, refetch };
// };

// export const useBookingActions = () => {
//   const [pending, setPending] = useState(false);
//   const [error, setError] = useState("");

//   const run = async (fn, id) => {
//     setPending(true);
//     setError("");
//     try {
//       const res = await fn(id);
//       return res;
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message || err?.message || "Booking action failed";
//       setError(msg);
//       throw err;
//     } finally {
//       setPending(false);
//     }
//   };

//   return {
//     pending,
//     error,
//     approve: (id) => run(approveBooking, id),
//     reject: (id) => run(rejectBooking, id),
//     returnBooking: (id) => run(returnBooking, id),
//   };
// };

import { useState, useEffect } from "react";

import {
  approveBooking,
  createBooking,
  getMyRequests,
  getReceivedRequests,
  rejectBooking,
  returnBooking,
} from "../api/bookings.api.js";


// ================== CREATE BOOKING ==================
export const useCreateBooking = () => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const run = async ({ itemId, startDate, endDate }) => {
    setPending(true);
    setError("");
    try {
      const res = await createBooking({ itemId, startDate, endDate });
      return res;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to create booking";
      setError(msg);
      throw err;
    } finally {
      setPending(false);
    }
  };

  return { create: run, pending, error };
};


// ================== MY REQUESTS ==================
export const useMyRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyRequests();
      setData(res?.bookings ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 AUTO FETCH ON LOAD
  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
};


// ================== RECEIVED REQUESTS ==================
export const useReceivedRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getReceivedRequests();
      setData(res?.bookings ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 AUTO FETCH ON LOAD
  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
};


// ================== BOOKING ACTIONS ==================
export const useBookingActions = () => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const run = async (fn, id) => {
    setPending(true);
    setError("");
    try {
      const res = await fn(id);
      return res;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Booking action failed";
      setError(msg);
      throw err;
    } finally {
      setPending(false);
    }
  };

  return {
    pending,
    error,
    approve: (id) => run(approveBooking, id),
    reject: (id) => run(rejectBooking, id),
    returnBooking: (id) => run(returnBooking, id),
  };
};