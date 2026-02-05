import User from "../model/User.js";

class UserService {
  async getAllUsers(filters = {}) {
    try {
      const query = {};

      if (filters.role) {
        query.role = filters.role.toUpperCase();
      }

      if (filters.email) {
        query.email = filters.email.toLowerCase();
      }

      const users = await User.find(query).select("-password").lean();
      return users;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findById(id).select("-password").lean();
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }
}

export default new UserService();