export function calculateRentalCost(startDate, endDate, pricePerDay) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const rentalDays = Math.ceil((end - start) / millisecondsPerDay);

  if (rentalDays <= 0) {
    throw new Error("End date must be after start date");
  }

  const totalCost = rentalDays * pricePerDay;

  return {
    rentalDays,
    totalCost
  };
}

