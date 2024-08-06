import { Router } from "express";
import { checkSchema } from 'express-validator';
import userValidator from "../utiles/app_validator.js";
import usersController from "./users_controller.js";


const userRouter = Router();

const keyUserRouter = {
    signUp: "/api/createUser",
    logIn: "/api/logIn"
};

userRouter.post(keyUserRouter.signUp, checkSchema(userValidator.createUserValidatorSchema), usersController.signupUser);

userRouter.post(keyUserRouter.logIn, checkSchema(userValidator.loginValidatorSchema), usersController.logInUser);

export default userRouter;