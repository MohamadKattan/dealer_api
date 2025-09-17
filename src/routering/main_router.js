import Router from "express";
import userRouter from "../users/users_router.js";
import dbRouter from "../my_sql/db_router.js";
import whousesRouter from "../../warehouses/warehouses_routering.js";

const mainRouter = Router();

mainRouter.use(userRouter);
mainRouter.use(dbRouter);
mainRouter.use(whousesRouter);

mainRouter.get('/', (req, res) => {
    res.status(200).send('Hello' + req.sessionID).end();
});


export default mainRouter;