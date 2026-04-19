import AdminOrdersView from "@/components/admin-view/orders";

function AdminOrders() {
  return (
    <div>
      <AdminOrdersView />
      <div className="flex gap-2 mt-2">

  <button
    className="bg-green-500 text-white px-3 py-1 rounded"
    onClick={() =>
      dispatch(updateOrderStatus({
        id: order._id,
        status: "approved"
      }))
    }
  >
    Approve
  </button>

  <button
    className="bg-red-500 text-white px-3 py-1 rounded"
    onClick={() =>
      dispatch(updateOrderStatus({
        id: order._id,
        status: "rejected"
      }))
    }
  >
    Reject
  </button>

  <button
    className="bg-blue-500 text-white px-3 py-1 rounded"
    onClick={() =>
      dispatch(updateOrderStatus({
        id: order._id,
        status: "returned"
      }))
    }
  >
    Return
  </button>

</div>
    </div>
  );
}

export default AdminOrders;