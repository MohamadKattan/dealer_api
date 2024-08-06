import Router from "express";
import userRouter from "../users/users_router.js";
import dbRouter from "../my_sql/db_router.js";

const mainRouter = Router();

mainRouter.use(userRouter);
mainRouter.use(dbRouter);

mainRouter.get('/', (req, res) => {
    // console.log('this is req.session ::' + req.session);
    // console.log('this is sessionID ::' + req.sessionID);
    res.status(200).send('Hello World  :: ' + req.sessionID).end();
});


export default mainRouter;