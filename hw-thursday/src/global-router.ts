import { Router } from 'express';
import authRouter from './auth/auth-router';

const globalRouter = Router();


globalRouter.use(authRouter);

// other routers can be added here

export default globalRouter;