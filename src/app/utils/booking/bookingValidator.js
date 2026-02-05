export function validateBooking({ carId, startDate, endDate }) {
  if (!carId) {
    throw new Error("carId must not be empty");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new Error("endDate must be after startDate");
  }

  return true;
}


