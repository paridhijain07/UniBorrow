// import ProductImageUpload from "@/components/admin-view/image-upload";
// import { Button } from "@/components/ui/button";
// import { addFeatureImage, getFeatureImages } from "@/store/common-slice";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchAllProducts } from "@/store/admin/products-slice";
// import { getAllOrdersForAdmin } from "@/store/admin/order-slice";

// function AdminDashboard() {
//   const [imageFile, setImageFile] = useState(null);
//   const [uploadedImageUrl, setUploadedImageUrl] = useState("");
//   const [imageLoadingState, setImageLoadingState] = useState(false);

//   const { productList } = useSelector((state) => state.adminProducts);
// const { orderList } = useSelector((state) => state.adminOrder);
//   const dispatch = useDispatch();
//   const { featureImageList } = useSelector((state) => state.commonFeature);

//   console.log(uploadedImageUrl, "uploadedImageUrl");

//   function handleUploadFeatureImage() {
//     dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
//       if (data?.payload?.success) {
//         dispatch(getFeatureImages());
//         setImageFile(null);
//         setUploadedImageUrl("");
//       }
//     });
//   }

//   useEffect(() => {
//     dispatch(getFeatureImages());
//   }, [dispatch]);

//   console.log(featureImageList, "featureImageList");

//   return (
//     <div>
//       <ProductImageUpload
//         imageFile={imageFile}
//         setImageFile={setImageFile}
//         uploadedImageUrl={uploadedImageUrl}
//         setUploadedImageUrl={setUploadedImageUrl}
//         setImageLoadingState={setImageLoadingState}
//         imageLoadingState={imageLoadingState}
//         isCustomStyling={true}
//         // isEditMode={currentEditedId !== null}
//       />
//       <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
//         Upload
//       </Button>
//       <div className="flex flex-col gap-4 mt-5">
//         {featureImageList && featureImageList.length > 0
//           ? featureImageList.map((featureImgItem) => (
//               <div className="relative">
//                 <img
//                   src={featureImgItem.image}
//                   className="w-full h-[300px] object-cover rounded-t-lg"
//                 />
//               </div>
//             ))
//           : null}
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";

// import ProductImageUpload from "@/components/admin-view/image-upload";
// import { Button } from "@/components/ui/button";

// import { addFeatureImage, getFeatureImages } from "@/store/common-slice";
// import { fetchAllProducts } from "@/store/admin/products-slice";
// import { getAllOrdersForAdmin } from "@/store/admin/order-slice";

// function AdminDashboard() {
//   const dispatch = useDispatch();

//   // 🔥 LOCAL STATES
//   const [imageFile, setImageFile] = useState(null);
//   const [uploadedImageUrl, setUploadedImageUrl] = useState("");
//   const [imageLoadingState, setImageLoadingState] = useState(false);

//   // 🔥 REDUX STATES
//   const { featureImageList } = useSelector((state) => state.commonFeature);
//   const { productList } = useSelector((state) => state.adminProducts);
//   const { orderList } = useSelector((state) => state.adminOrder);

//   // 🔥 FETCH DATA
//   useEffect(() => {
//     dispatch(getFeatureImages());
//     dispatch(fetchAllProducts());
//     dispatch(getAllOrdersForAdmin());
//   }, [dispatch]);

//   // 🔥 HANDLE IMAGE UPLOAD
//   function handleUploadFeatureImage() {
//     if (!uploadedImageUrl) return;

//     dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
//       if (data?.payload?.success) {
//         dispatch(getFeatureImages());
//         setImageFile(null);
//         setUploadedImageUrl("");
//       }
//     });
//   }

//   // 🔥 CALCULATE REVENUE
//   const totalRevenue = orderList?.reduce(
//     (acc, order) => acc + (order.totalAmount || 0),
//     0
//   );

//   return (
//     <div className="space-y-6">

//       {/* 🔥 DASHBOARD STATS */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="bg-white p-4 rounded-xl shadow">
//           <p className="text-gray-500">Total Products</p>
//           <h2 className="text-2xl font-bold">
//             {productList?.length || 0}
//           </h2>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <p className="text-gray-500">Total Orders</p>
//           <h2 className="text-2xl font-bold">
//             {orderList?.length || 0}
//           </h2>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <p className="text-gray-500">Revenue</p>
//           <h2 className="text-2xl font-bold">
//             ₹ {totalRevenue}
//           </h2>
//         </div>
//       </div>

//       {/* 🔥 FEATURE IMAGE UPLOAD */}
//       <div className="bg-white p-4 rounded-xl shadow">
//         <h2 className="text-lg font-bold mb-4">Upload Banner</h2>

//         <ProductImageUpload
//           imageFile={imageFile}
//           setImageFile={setImageFile}
//           uploadedImageUrl={uploadedImageUrl}
//           setUploadedImageUrl={setUploadedImageUrl}
//           setImageLoadingState={setImageLoadingState}
//           imageLoadingState={imageLoadingState}
//           isCustomStyling={true}
//         />

//         <Button
//           onClick={handleUploadFeatureImage}
//           className="mt-4 w-full"
//         >
//           Upload Banner
//         </Button>
//       </div>

//       {/* 🔥 FEATURE IMAGES LIST */}
//       <div className="bg-white p-4 rounded-xl shadow">
//         <h2 className="text-lg font-bold mb-4">Uploaded Banners</h2>

//         {featureImageList && featureImageList.length > 0 ? (
//           <div className="grid grid-cols-2 gap-4">
//             {featureImageList.map((item) => (
//               <img
//                 key={item._id}
//                 src={item.image}
//                 alt="banner"
//                 className="w-full h-[200px] object-cover rounded-xl"
//               />
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-500">No banners uploaded</p>
//         )}
//       </div>

//     </div>
//   );
// }

// export default AdminDashboard;

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchAllProducts } from "@/store/admin/products-slice";
import { getAllOrdersForAdmin, updateOrderStatus } from "@/store/admin/order-slice";

function AdminDashboard() {
  const dispatch = useDispatch();

  const { productList } = useSelector((state) => state.adminProducts);
  const { orderList } = useSelector((state) => state.adminOrder);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  // 🔥 CALCULATIONS
  const totalRevenue = orderList.reduce(
    (acc, o) => acc + (o.totalCost || 0),
    0
  );

  const activeRentals = orderList.filter(o => o.status === "approved");
  const pendingRequests = orderList.filter(o => o.status === "pending");
  const overdue = orderList.filter(
    o => o.status === "approved" && new Date(o.endDate) < new Date()
  );

  return (
    <div className="space-y-6">

      {/* 🔥 HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
        <p className="text-gray-500">Real-time platform insights</p>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white p-4 rounded-xl shadow">
          <p>Total Items</p>
          <h2 className="text-2xl font-bold">{productList.length}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p>Total Bookings</p>
          <h2 className="text-2xl font-bold">{orderList.length}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p>Revenue</p>
          <h2 className="text-2xl font-bold text-green-600">
            ₹ {totalRevenue}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p>Active Rentals</p>
          <h2 className="text-2xl font-bold">{activeRentals.length}</h2>
        </div>

      </div>

      {/* 🔥 PENDING REQUESTS (ACTIONABLE) */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-3">Pending Requests</h2>

        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests</p>
        ) : (
          pendingRequests.map((o) => (
            <div key={o._id} className="flex justify-between py-2 border-b">
              <span>{o.item?.title}</span>

              <div className="flex gap-2">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() =>
                    dispatch(updateOrderStatus({
                      id: o._id,
                      status: "approved"
                    }))
                  }
                >
                  Approve
                </button>

                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() =>
                    dispatch(updateOrderStatus({
                      id: o._id,
                      status: "rejected"
                    }))
                  }
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 ACTIVE RENTALS */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-3">Active Rentals</h2>

        {activeRentals.length === 0 ? (
          <p>No active rentals</p>
        ) : (
          activeRentals.map((o) => (
            <div key={o._id} className="flex justify-between py-2 border-b">
              <span>{o.item?.title}</span>
              <span className="text-sm text-gray-500">
                till {new Date(o.endDate).toDateString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* 🔥 OVERDUE ALERT */}
      <div className="bg-red-100 p-4 rounded-xl shadow">
        <h2 className="font-bold mb-3 text-red-700">Overdue Items</h2>

        {overdue.length === 0 ? (
          <p>No overdue items</p>
        ) : (
          overdue.map((o) => (
            <div key={o._id} className="flex justify-between py-2">
              <span>{o.item?.title}</span>
              <span className="text-red-600 font-bold">Overdue</span>
            </div>
          ))
        )}
      </div>

      {/* 🔥 RECENT ACTIVITY */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-3">Recent Activity</h2>

        {orderList.slice(0, 5).map((o) => (
          <div key={o._id} className="flex justify-between py-2 border-b">
            <span>{o.item?.title}</span>
            <span className="text-sm">{o.status}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default AdminDashboard;