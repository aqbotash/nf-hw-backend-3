import { CreateUserDto } from './dtos/CreateUser.dto';
import { IUser } from './models/User';
import UserModel from './models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import RefreshTokenModel from './models/RefreshToken';

dotenv.config();

class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'my_secret_key';
  private readonly jwtRefreshSecret = process.env.JWT_SECRET_SECRET || 'my_refresh_secret_key';

  async registerUser(createUserDto: CreateUserDto): Promise<IUser> {
    const { email, password, username } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    return newUser;
  }

  async loginUser(email: string, password: string): Promise<{ user?: IUser, accessToken?: string, refreshToken?: string, error?: string } | null> {
    try {
        const user = await UserModel.findOne({ email });
        if (!user) return {error:'User with this email does not exist'}

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return {error:'PASSWORD'};

        const accessToken = this.generateJwt(user);
        const refreshToken = this.generateRefreshToken(user);

        const refreshTokenDoc = new RefreshTokenModel({ token: refreshToken, user: user._id });
        await refreshTokenDoc.save();

        return { user, accessToken, refreshToken };
    } catch (error) {
        console.error('Error in loginUser:', error);
        return null;
    }
}

  private generateJwt(user: IUser): string {
    return jwt.sign({ id: user._id, email: user.email, city:user.city }, this.jwtSecret, { expiresIn: '15m' });
  }

  private generateRefreshToken(user: IUser): string {
    return jwt.sign({ id: user._id, email: user.email, city:user.city }, this.jwtRefreshSecret, { expiresIn: '7d' });
  }

  verifyJwt(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (err) {
      return null;
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtRefreshSecret);
    } catch (err) {
      return null;
    }
  }

  async refreshToken(oldToken: string): Promise<{ accessToken: string, refreshToken: string } | null> {
    const payload = this.verifyRefreshToken(oldToken);
    if (!payload) return null;

    const user = await UserModel.findById(payload.id);
    if (!user) return null;

    const newAccessToken = this.generateJwt(user);
    const newRefreshToken = this.generateRefreshToken(user);

    const refreshTokenDoc = new RefreshTokenModel({ token: newRefreshToken, user: user._id });
    await refreshTokenDoc.save();

    await RefreshTokenModel.deleteOne({ token: oldToken });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

export default AuthService;