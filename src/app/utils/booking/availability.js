export function isOverlapping(existingBookings, newStartDate, newEndDate) {
  const newStart = new Date(newStartDate);
  const newEnd = new Date(newEndDate);

  for (const booking of existingBookings) {
    const existingStart = new Date(booking.startDate);
    const existingEnd = new Date(booking.endDate);

    if (newStart < existingEnd && newEnd > existingStart) {
      return true;
    }
  }

  return false;
}


