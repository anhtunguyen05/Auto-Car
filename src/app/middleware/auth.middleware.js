import User from "../model/User.js";
import { UserRole } from "../../enum/user.enum.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login?error=' + encodeURIComponent('Please login to continue'));
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login?error=' + encodeURIComponent('Please login to continue'));
  }
  
  if (req.session.user.role !== 'ADMIN') {
    return res.redirect('/user?error=' + encodeURIComponent('Access denied. Admin only.'));
  }
  
  next();
};

export const requireCustomer = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login?error=' + encodeURIComponent('Please login to continue'));
  }
  
  if (req.session.user.role !== 'CUSTOMER') {
    return res.redirect('/?error=' + encodeURIComponent('Access denied. Customer only.'));
  }
  
  next();
};


export const requireOwner = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login?error=' + encodeURIComponent('Please login to continue'));
  }
  
  if (req.session.user.role !== 'OWNER') {
    return res.redirect('/?error=' + encodeURIComponent('Access denied. Owner only.'));
  }
  
  next();
};


export const attachUser = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.currentUser = req.session.user;
  }
  next();
};


export const authenticate = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId;

    if (!userId) {
      throw new AppError(
        "Authentication required. Please provide x-user-id header",
        ErrorCodes.UNAUTHORIZED,
        401
      );
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new AppError("User not found", ErrorCodes.USER_NOT_FOUND, 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.code,
        },
      });
    } else {
      res.status(401).json({
        error: {
          message: "Authentication failed",
          code: ErrorCodes.UNAUTHORIZED,
        },
      });
    }
  }
};


export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError(
          "User not authenticated",
          ErrorCodes.UNAUTHORIZED,
          401
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          `Access denied. Required roles: ${allowedRoles.join(", ")}`,
          ErrorCodes.FORBIDDEN,
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(403).json({
          error: {
            message: "Access denied",
            code: ErrorCodes.FORBIDDEN,
          },
        });
      }
    }
  };
};


export const authorizeBookingOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      throw new AppError("Booking not found", ErrorCodes.BOOKING_NOT_FOUND, 404);
    }

    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      throw new AppError(
        "You can only access your own bookings",
        ErrorCodes.FORBIDDEN,
        403
      );
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.code,
        },
      });
    } else {
      res.status(403).json({
        error: {
          message: "Access denied",
          code: ErrorCodes.FORBIDDEN,
        },
      });
    }
  }
};
