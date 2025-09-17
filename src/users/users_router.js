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
    deleteOneUser: "/api/deleteOneUser",
    editeUserInfo: "/api/editeOneUser"
};

userRouter.post(keyUserRouter.signUp, appSecure.authLimter, appSecure.verifyToken, checkSchema(userValidator.createUserValidatorSchema), usersController.signupUser);

userRouter.post(keyUserRouter.logIn, appSecure.authLimter, checkSchema(userValidator.loginValidatorSchema), usersController.logInUser);

userRouter.get(keyUserRouter.getAllUsers, appSecure.verifyToken, usersController.getAllUsers);

userRouter.delete(keyUserRouter.deleteOneUser, appSecure.verifyToken, checkSchema(userValidator.deleteOneUser), usersController.deleteOneUser);

userRouter.put(keyUserRouter.editeUserInfo, appSecure.authLimter, appSecure.verifyToken, checkSchema(userValidator.editeUser), usersController.editeUserInfo);

export default userRouter;