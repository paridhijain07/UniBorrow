// const Order = require("../../models/Order");

// const getAllOrdersOfAllUsers = async (req, res) => {
//   try {
//     const orders = await Order.find({});

//     if (!orders.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No orders found!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: orders,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured!",
//     });
//   }
// };

// const getOrderDetailsForAdmin = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured!",
//     });
//   }
// };

// const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { orderStatus } = req.body;

//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found!",
//       });
//     }

//     const allowedStatuses = [
//       "pending",
//       "inProcess",
//       "inShipping",
//       "delivered",
//       "confirmed",
//       "rejected",
//       "cancelled",
//     ];

//     if (!allowedStatuses.includes(orderStatus)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid order status",
//       });
//     }

//     await Order.findByIdAndUpdate(id, {
//       orderStatus,
//       orderUpdateDate: new Date(),
//     });

//     res.status(200).json({
//       success: true,
//       message: "Order status is updated successfully!",
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured!",
//     });
//   }
// };

// module.exports = {
//   getAllOrdersOfAllUsers,
//   getOrderDetailsForAdmin,
//   updateOrderStatus,
// };

const Booking = require("../../models/Booking");

// 🔥 GET ALL BOOKINGS (instead of orders)
const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("item")
      .populate("borrower")
      .populate("owner");

    if (!bookings.length) {
      return res.status(404).json({
        success: false,
        message: "No bookings found!",
      });
    }

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// 🔥 GET SINGLE BOOKING
const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("item")
      .populate("borrower")
      .populate("owner");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// 🔥 UPDATE BOOKING STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found!",
      });
    }

    const allowedStatuses = ["pending", "approved", "rejected", "returned"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};