import User from "../model/User.js";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

class AuthService {
  async register(userData) {
    try {
      const { name, email, password, phone, role = "CUSTOMER" } = userData;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError(
          "Email already exists",
          ErrorCodes.EMAIL_ALREADY_EXISTS,
          400
        );
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        role,
      });

      await user.save();

      const userObject = user.toObject();
      delete userObject.password;

      return userObject;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError(
          "Invalid email or password",
          ErrorCodes.INVALID_CREDENTIALS,
          401
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError(
          "Invalid email or password",
          ErrorCodes.INVALID_CREDENTIALS,
          401
        );
      }

      const userObject = user.toObject();
      delete userObject.password;

      return userObject;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
