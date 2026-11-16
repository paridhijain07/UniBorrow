import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Campus Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID / Item</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Rental Period</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0
              ? orderList.map((orderItem) => {
                  const status = orderItem?.status || orderItem?.orderStatus || "pending";
                  const dateText = orderItem?.startDate && orderItem?.endDate
                    ? `${new Date(orderItem.startDate).toLocaleDateString()} - ${new Date(orderItem.endDate).toLocaleDateString()}`
                    : orderItem?.orderDate ? orderItem.orderDate.split("T")[0] : "N/A";
                  const itemTitle = orderItem?.item?.title || orderItem?._id?.slice(-6) || "Booking";
                  const borrowerName = orderItem?.borrower?.name || "Student";
                  const cost = orderItem?.totalCost ?? orderItem?.totalAmount ?? 0;

                  return (
                    <TableRow key={orderItem?._id}>
                      <TableCell className="font-semibold">{itemTitle}</TableCell>
                      <TableCell>{borrowerName}</TableCell>
                      <TableCell className="text-sm text-gray-500">{dateText}</TableCell>
                      <TableCell>₹{cost}</TableCell>
                      <TableCell>
                        <Badge
                          className={`py-1 px-3 ${
                            status === "approved" || status === "delivered"
                              ? "bg-green-600 text-white"
                              : status === "returned"
                              ? "bg-blue-600 text-white"
                              : status === "rejected" || status === "cancelled"
                              ? "bg-red-600 text-white"
                              : "bg-amber-600 text-white"
                          }`}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog
                          open={openDetailsDialog}
                          onOpenChange={() => {
                            setOpenDetailsDialog(false);
                            dispatch(resetOrderDetails());
                          }}
                        >
                          <Button
                            onClick={() =>
                              handleFetchOrderDetails(orderItem?._id)
                            }
                          >
                            View Details
                          </Button>
                          <AdminOrderDetailsView orderDetails={orderDetails} />
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;