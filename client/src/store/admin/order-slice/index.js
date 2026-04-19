// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import axios from "axios";
// import {BASE_URL} from "@/store/common.js"
// const initialState = {
//   orderList: [],
//   orderDetails: null,
// };

// export const getAllOrdersForAdmin = createAsyncThunk(
//   "/order/getAllOrdersForAdmin",
//   async () => {
//     const response = await axios.get(
//       `${BASE_URL}/admin/orders/get`
//     );

//     return response.data;
//   }
// );

// export const getOrderDetailsForAdmin = createAsyncThunk(
//   "/order/getOrderDetailsForAdmin",
//   async (id) => {
//     const response = await axios.get(
//       `${BASE_URL}/admin/orders/details/${id}`
//     );

//     return response.data;
//   }
// );

// export const updateOrderStatus = createAsyncThunk(
//   "/order/updateOrderStatus",
//   async ({ id, orderStatus }) => {
//     const response = await axios.put(
//       `${BASE_URL}/admin/orders/update/${id}`,
//       {
//         orderStatus,
//       }
//     );

//     return response.data;
//   }
// );

// const adminOrderSlice = createSlice({
//   name: "adminOrderSlice",
//   initialState,
//   reducers: {
//     resetOrderDetails: (state) => {
//       console.log("resetOrderDetails");

//       state.orderDetails = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(getAllOrdersForAdmin.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.orderList = action.payload.data;
//       })
//       .addCase(getAllOrdersForAdmin.rejected, (state) => {
//         state.isLoading = false;
//         state.orderList = [];
//       })
//       .addCase(getOrderDetailsForAdmin.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.orderDetails = action.payload.data;
//       })
//       .addCase(getOrderDetailsForAdmin.rejected, (state) => {
//         state.isLoading = false;
//         state.orderDetails = null;
//       });
//   },
// });

// export const { resetOrderDetails } = adminOrderSlice.actions;

// export default adminOrderSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "@/store/common.js";

const initialState = {
  orderList: [],
  orderDetails: null,
  isLoading: false,
};

// 🔥 FETCH BOOKINGS (instead of orders)
export const getAllOrdersForAdmin = createAsyncThunk(
  "/admin/getBookings",
  async () => {
    const response = await axios.get(`${BASE_URL}/admin/orders/get`);
    return response.data;
  }
);

// 🔥 GET SINGLE BOOKING
export const getOrderDetailsForAdmin = createAsyncThunk(
  "/admin/getBookingDetails",
  async (id) => {
    const response = await axios.get(
      `${BASE_URL}/admin/orders/details/${id}`
    );
    return response.data;
  }
);

// 🔥 UPDATE BOOKING STATUS
export const updateOrderStatus = createAsyncThunk(
  "/admin/updateBookingStatus",
  async ({ id, status }) => {
    const response = await axios.put(
      `${BASE_URL}/admin/orders/update/${id}`,
      { status } // ✅ IMPORTANT (NOT orderStatus)
    );
    return response.data;
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrder",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔥 FETCH BOOKINGS
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data || [];
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })

      // 🔥 DETAILS
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.orderDetails = action.payload.data;
      })

      // 🔥 UPDATE STATUS
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;