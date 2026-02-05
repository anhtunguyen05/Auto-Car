import Car from '../model/Car.js';
import User from '../model/User.js';
import Booking from '../model/Booking.js';

class DashboardController {
  async renderDashboard(req, res) {
    try {
      const totalCars = await Car.countDocuments();
      const totalUsers = await User.countDocuments();
      const activeBookings = await Booking.countDocuments({ 
        status: { $in: ['CONFIRMED', 'ACTIVE'] } 
      });
      
      const completedBookings = await Booking.find({ status: 'COMPLETED' });
      const totalRevenue = completedBookings.reduce((sum, booking) => 
        sum + (booking.totalCost || 0), 0
      );
      
      const recentBookings = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .populate('carId', 'brand model')
        .lean();

      const transformedBookings = recentBookings.map(booking => ({
        _id: booking._id,
        customerName: booking.userId?.name || 'Unknown',
        carName: booking.carId ? `${booking.carId.brand} ${booking.carId.model}` : 'Unknown',
        startDate: booking.startDate,
        status: booking.status
      }));

      const stats = {
        totalCars,
        totalUsers,
        activeBookings,
        totalRevenue: totalRevenue.toFixed(2)
      };

      res.render('dashboard', {
        title: 'Dashboard',
        isDashboard: true,
        stats,
        recentBookings: transformedBookings
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).render('error', { 
        title: 'Error',
        error: 'Failed to load dashboard: ' + error.message
      });
    }
  }
}

export default new DashboardController();
