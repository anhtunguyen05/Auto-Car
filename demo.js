const readline = require("readline");
const calculateRentalCost = require("./pricing");
const isOverlapping = require("./availability");
const validateBooking = require("./bookingValidator");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const existingBookings = [
  { startDate: "2026-01-01", endDate: "2026-01-05" },
  { startDate: "2026-01-10", endDate: "2026-01-12" }
];

const pricePerDay = 500000;

rl.question("Nhập ngày bắt đầu thuê (YYYY-MM-DD): ", (startDate) => {
  rl.question("Nhập ngày kết thúc thuê (YYYY-MM-DD): ", (endDate) => {

    const newBooking = {
      carId: "CAR001",
      startDate,
      endDate
    };

    try {
      validateBooking(newBooking);

      const hasConflict = isOverlapping(
        existingBookings,
        startDate,
        endDate
      );

      if (!hasConflict) {
        const result = calculateRentalCost(
          startDate,
          endDate,
          pricePerDay
        );

        console.log("Số ngày thuê:", result.rentalDays);
        console.log("Tổng tiền:", result.totalCost.toLocaleString(), "VND");
      } else {
        console.log("Xe đã được đặt trong khoảng thời gian này");
      }

    } catch (error) {
      console.error("Lỗi:", error.message);
    } finally {
      rl.close();
    }
  });
});