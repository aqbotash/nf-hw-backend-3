import { Request, Response } from 'express';
import { CreateUserDto } from './dtos/CreateUser.dto';
import AuthService from './auth-service';
import UserModel from './models/User';
import bcrypt from 'bcryptjs';
import { LoginUserDto } from './dtos/LoginUser.dto';

class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, username, city } = req.body as CreateUserDto;

      // Check if user with the same email already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'User with this email already exists' });
        return;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new UserModel({
        email,
        username,
        password: hashedPassword,
        city
      });

      // Save the user to the database
      await newUser.save();

      // Send a success response
      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error: any) {
      console.error(error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body as LoginUserDto;
      const result = await this.authService.loginUser(email, password);
      if (!result) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }

      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: 'Error logging in' });
    }
  }

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      const result = await this.authService.refreshToken(token);
      if (!result) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
        return;
      }
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: 'Error refreshing token' });
    }
  }
}

export default AuthController;