// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import axios from "axios";
// import { BASE_URL } from '@/store/common.js';
// const initialState = {
//   isLoading: false,
//   productList: [],
// };

// export const addNewProduct = createAsyncThunk(
//   "/products/addnewproduct",
//   async (formData) => {
//     const result = await axios.post(
//       `${BASE_URL}/admin/products/add`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return result?.data;
//   }
// );

// export const fetchAllProducts = createAsyncThunk(
//   "/products/fetchAllProducts",
//   async () => {
//     const result = await axios.get(
//       `${BASE_URL}/admin/products/get`
//     );

//     return result?.data;
//   }
// );

// export const editProduct = createAsyncThunk(
//   "/products/editProduct",
//   async ({ id, formData }) => {
//     const result = await axios.put(
//       `${BASE_URL}/admin/products/edit/${id}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return result?.data;
//   }
// );

// export const deleteProduct = createAsyncThunk(
//   "/products/deleteProduct",
//   async (id) => {
//     const result = await axios.delete(
//       `${BASE_URL}/admin/products/delete/${id}`
//     );

//     return result?.data;
//   }
// );

// const adminProductsSlice = createSlice({
//   name: "adminProducts",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAllProducts.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchAllProducts.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.productList = action.payload.data;
//       })
//       .addCase(fetchAllProducts.rejected, (state, action) => {
//         state.isLoading = false;
//         state.productList = [];
//       });
//   },
// });

// export default adminProductsSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "@/store/common.js";

const initialState = {
  isLoading: false,
  productList: [],
};

// ✅ FETCH ITEMS (instead of products)
export const fetchAllProducts = createAsyncThunk(
  "/admin/fetchItems",
  async () => {
    const result = await axios.get(`${BASE_URL}/items`);
    return result.data;
  }
);

// ✅ ADD ITEM
export const addNewProduct = createAsyncThunk(
  "/admin/addItem",
  async (formData) => {
    const result = await axios.post(`${BASE_URL}/items`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return result.data;
  }
);

// ✅ EDIT ITEM
export const editProduct = createAsyncThunk(
  "/admin/editItem",
  async ({ id, formData }) => {
    const result = await axios.put(`${BASE_URL}/items/${id}`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return result.data;
  }
);

// ✅ DELETE ITEM
export const deleteProduct = createAsyncThunk(
  "/admin/deleteItem",
  async (id) => {
    const result = await axios.delete(`${BASE_URL}/items/${id}`);
    return result.data;
  }
);

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔥 FETCH
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.items || [];
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
      })

      // 🔥 ADD
      .addCase(addNewProduct.fulfilled, (state) => {
        state.isLoading = false;
      })

      // 🔥 EDIT
      .addCase(editProduct.fulfilled, (state) => {
        state.isLoading = false;
      })

      // 🔥 DELETE
      .addCase(deleteProduct.fulfilled, (state) => {
        state.isLoading = false;
      });
  },
});

export default adminProductsSlice.reducer;