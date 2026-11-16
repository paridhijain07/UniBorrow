import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { toast } from "react-toastify";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;
    if (!status) return;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast.success(data?.payload?.message ?? "Booking status updated");
      } else {
        toast.error(data?.payload?.message ?? "Failed to update booking status");
      }
    });
  }

  const dateText = orderDetails?.startDate && orderDetails?.endDate
    ? `${new Date(orderDetails.startDate).toLocaleDateString()} - ${new Date(orderDetails.endDate).toLocaleDateString()}`
    : orderDetails?.createdAt
    ? new Date(orderDetails.createdAt).toLocaleDateString()
    : "N/A";

  const currentStatus = orderDetails?.status || orderDetails?.orderStatus || "pending";
  const cost = orderDetails?.totalCost ?? orderDetails?.totalAmount ?? 0;

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Booking ID</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Rental Period</p>
            <Label>{dateText}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Total Cost</p>
            <Label>₹{cost}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  currentStatus === "approved"
                    ? "bg-green-600 text-white"
                    : currentStatus === "returned"
                    ? "bg-blue-600 text-white"
                    : currentStatus === "rejected"
                    ? "bg-red-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                {currentStatus}
              </Badge>
            </Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Item Information</div>
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <div><span className="font-semibold">Title:</span> {orderDetails?.item?.title || "Item Listing"}</div>
              <div><span className="font-semibold">Pickup:</span> {orderDetails?.item?.pickupLocation || "Campus Zone"}</div>
              {orderDetails?.item?.category && (
                <div><span className="font-semibold">Category:</span> {orderDetails?.item?.category}</div>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Participants</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-semibold text-xs text-muted-foreground uppercase">Borrower</div>
                <div>{orderDetails?.borrower?.name || "Student"}</div>
                <div className="text-xs text-muted-foreground">{orderDetails?.borrower?.email}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-semibold text-xs text-muted-foreground uppercase">Owner</div>
                <div>{orderDetails?.owner?.name || "Lender"}</div>
                <div className="text-xs text-muted-foreground">{orderDetails?.owner?.email}</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                label: "Update Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "approved", label: "Approved" },
                  { id: "rejected", label: "Rejected" },
                  { id: "returned", label: "Returned" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Booking Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;