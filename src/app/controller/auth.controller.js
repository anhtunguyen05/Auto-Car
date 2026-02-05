import authService from "../service/auth.service.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

class AuthController {
  renderLogin(req, res) {
    if (req.session && req.session.user) {
      if (req.session.user.role === 'ADMIN') {
        return res.redirect('/');
      } else {
        return res.redirect('/user');
      }
    }
    
    res.render('auth/login', {
      layout: false,
      error: req.query.error,
      success: req.query.success
    });
  }

  renderRegister(req, res) {
    res.render('auth/register', {
      layout: false,
      error: req.query.error
    });
  }

  async handleRegister(req, res) {
    try {
      const user = await authService.register(req.body);
      res.redirect('/auth/login?success=' + encodeURIComponent('Registration successful! Please login.'));
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof AppError ? error.message : 'Registration failed';
      res.redirect('/auth/register?error=' + encodeURIComponent(errorMessage));
    }
  }

  async register(req, res) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        message: "User registered successfully",
        user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: "Internal Server Error",
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        });
      }
    }
  }

  async handleLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.redirect('/auth/login?error=' + encodeURIComponent('Email and password are required'));
      }

      const user = await authService.login(email, password);
      
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      };

      console.log('✅ User logged in:', user.email, 'Role:', user.role);

      if (user.role === 'ADMIN') {
        res.redirect('/?success=' + encodeURIComponent('Welcome back, ' + user.name + '!'));
      } else if (user.role === 'CUSTOMER') {
        res.redirect('/user?success=' + encodeURIComponent('Welcome back, ' + user.name + '!'));
      } else if (user.role === 'OWNER') {
        res.redirect('/owner?success=' + encodeURIComponent('Welcome back, ' + user.name + '!'));
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof AppError ? error.message : 'Login failed';
      res.redirect('/auth/login?error=' + encodeURIComponent(errorMessage));
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(
          "Email and password are required",
          ErrorCodes.VALIDATION_ERROR,
          400
        );
      }

      const user = await authService.login(email, password);
      
      res.json({
        message: "Login successful",
        user,
        userId: user._id,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: "Internal Server Error",
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        });
      }
    }
  }

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/auth/login?success=' + encodeURIComponent('Logged out successfully'));
    });
  }
}

export default new AuthController();
