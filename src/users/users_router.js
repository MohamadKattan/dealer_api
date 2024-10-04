import { Router } from "express";
import { checkSchema } from 'express-validator';
import userValidator from "../utiles/app_validator.js";
import usersController from "./users_controller.js";
import appSecure from "../utiles/app_secure.js";


const userRouter = Router();

const keyUserRouter = {
    signUp: "/api/createUser",
    logIn: "/api/logIn",
    getAllUsers: "/api/getAllUsers",
    deleteOneUser: "/api/deleteOneUser"
};

userRouter.post(keyUserRouter.signUp, appSecure.verifyToken, checkSchema(userValidator.createUserValidatorSchema), usersController.signupUser);

userRouter.post(keyUserRouter.logIn, checkSchema(userValidator.loginValidatorSchema), usersController.logInUser);

userRouter.get(keyUserRouter.getAllUsers, appSecure.verifyToken, usersController.getAllUsers);

userRouter.delete(keyUserRouter.deleteOneUser, checkSchema(userValidator.deleteOneUser), appSecure.verifyToken, usersController.deleteOneUser);

export default userRouter;