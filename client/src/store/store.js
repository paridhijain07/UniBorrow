// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "./auth-slice";
// import shopCartSlice from "./shop/cart-slice";
// import shopReviewSlice from "./shop/review-slice";
// import shopProductsSlice from "./shop/products-slice";
// import commonFeatureSlice from "./common-slice";
// import shopOrderSlice from "./shop/order-slice";
// import shopAddressSlice from "./shop/address-slice";
// import adminOrderSlice from "./admin/order-slice";
// import adminProductsSlice from './admin/products-slice';
// import shopSearchSlice from "./shop/search-slice";
// import adminProductsReducer from "./admin/products-slice";
// import adminOrderReducer from "./admin/order-slice";
// import commonFeatureReducer from "./common-slice";

// const store = configureStore({
//     reducer: {
//       auth: authReducer,
//       adminProducts: adminProductsSlice,
//       shopCart: shopCartSlice,
//       shopReview: shopReviewSlice,
//       shopProducts: shopProductsSlice,
//       commonFeature: commonFeatureSlice,
//       shopOrder: shopOrderSlice,
//       shopAddress: shopAddressSlice,
//       adminOrder: adminOrderSlice,
//       shopSearch: shopSearchSlice,
//       adminProducts: adminProductsReducer,
//     adminOrder: adminOrderReducer,
//     commonFeature: commonFeatureReducer,
//     },
//   });
  
//   export default store;

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth-slice";
import shopCartSlice from "./shop/cart-slice";
import shopReviewSlice from "./shop/review-slice";
import shopProductsSlice from "./shop/products-slice";
import commonFeatureReducer from "./common-slice";
import shopOrderSlice from "./shop/order-slice";
import shopAddressSlice from "./shop/address-slice";
import adminOrderReducer from "./admin/order-slice";
import adminProductsReducer from "./admin/products-slice";
import shopSearchSlice from "./shop/search-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shopCart: shopCartSlice,
    shopReview: shopReviewSlice,
    shopProducts: shopProductsSlice,
    commonFeature: commonFeatureReducer,
    shopOrder: shopOrderSlice,
    shopAddress: shopAddressSlice,
    adminOrder: adminOrderReducer,
    adminProducts: adminProductsReducer,
    shopSearch: shopSearchSlice,
  },
});