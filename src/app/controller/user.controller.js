import userService from "../service/user.service.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

class UserController {
  // API Methods (JSON Response)
  async getUsers(req, res) {
    try {
      const { role, email } = req.query;
      const filters = { role, email };

      const users = await userService.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: {
          message: error.message || "Internal Server Error",
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
        },
      });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({
        error: {
          message: error.message,
          code: ErrorCodes.USER_NOT_FOUND,
        },
      });
    }
  }

  // View Methods (HTML Render)
  async renderUsersList(req, res) {
    try {
      console.log('👥 renderUsersList called');
      const { search, role, page = 1 } = req.query;
      const limit = 10;
      const skip = (page - 1) * limit;

      // Use service to get users
      const filters = { role };
      const allUsers = await userService.getAllUsers(filters);
      
      // Apply search filter if provided
      let filteredUsers = allUsers;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = allUsers.filter(user => 
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }

      console.log('👥 Total users from service:', filteredUsers.length);
      
      // Apply pagination
      const users = filteredUsers.slice(skip, skip + limit);
      const totalUsers = filteredUsers.length;
      const totalPages = Math.ceil(totalUsers / limit);

      console.log('👥 Users for this page:', users.length);
      console.log('👥 First user:', users[0]);

      const pagination = totalPages > 1 ? {
        page: parseInt(page),
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: parseInt(page) - 1,
        nextPage: parseInt(page) + 1,
        pages: Array.from({ length: totalPages }, (_, i) => ({
          number: i + 1,
          active: i + 1 === parseInt(page)
        }))
      } : null;

      res.render('users/list', {
        title: 'User Management',
        isUsers: true,
        users,
        search,
        role,
        pagination
      });
    } catch (error) {
      console.error('Users list error:', error);
      res.status(500).render('error', { 
        title: 'Error',
        error: 'Failed to load users: ' + error.message
      });
    }
  }

  async renderUserForm(req, res) {
    try {
      const userId = req.params.id;
      let user = null;

      if (userId) {
        user = await userService.getUserById(userId);
      }

      res.render('users/form', {
        title: userId ? 'Edit User' : 'Add New User',
        isUsers: true,
        user
      });
    } catch (error) {
      console.error('User form error:', error);
      res.status(500).render('error', {
        title: 'Error',
        error: 'Failed to load user form: ' + error.message
      });
    }
  }

  async handleUserAdd(req, res) {
    try {
      const User = (await import('../model/User.js')).default;
      
      const userData = req.body;
      const user = new User(userData);
      await user.save();

      res.redirect('/users?success=User added successfully');
    } catch (error) {
      console.error('User add error:', error);
      res.redirect('/users/add?error=' + encodeURIComponent(error.message));
    }
  }

  async handleUserEdit(req, res) {
    try {
      const User = (await import('../model/User.js')).default;
      
      const userData = req.body;
      delete userData.password; // Don't update password here
      await User.findByIdAndUpdate(req.params.id, userData);
      res.redirect('/users?success=User updated successfully');
    } catch (error) {
      console.error('User edit error:', error);
      res.redirect(`/users/edit/${req.params.id}?error=` + encodeURIComponent(error.message));
    }
  }
}

export default new UserController();
