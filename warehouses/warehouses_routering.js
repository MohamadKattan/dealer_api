import { Router } from "express";
import { checkSchema } from 'express-validator';
import appSecure from "../src/utiles/app_secure.js";
import whousesController from "./warehouses_controller.js";
import validatorWarehouse from "./validator_whouses.js";

const whousesRouter = Router();

const keyRouter = {
    show: "/api/showWhouses",
    create: "/api/createWhouses",
    edite: "/api/EditeWhouses",
    delete: "/api/deleteWhouses"
}

whousesRouter.get(keyRouter.show, appSecure.verifyToken, whousesController.showWhouses);

whousesRouter.post(keyRouter.create, appSecure.verifyToken, checkSchema(validatorWarehouse.validCreate), whousesController.createNewWarehouse);

whousesRouter.put(keyRouter.edite, appSecure.verifyToken, checkSchema(validatorWarehouse.validEdite), whousesController.EditeWhouses);

whousesRouter.delete(keyRouter.delete, appSecure.verifyToken, checkSchema(validatorWarehouse.deleteWhouses),whousesController.deleteWhouses);


export default whousesRouter;