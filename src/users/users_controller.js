import { query, body, param, check, checkSchema, validationResult, matchedData } from 'express-validator';
import my_db from '../my_sql/my_db.js';

const signupUser = async (req, res) => {
    const resultValidat = validationResult(req);
    if (resultValidat.isEmpty()) {
        const validdata = matchedData(req);
        const table = 'users';
        const columns = 'user_name, pass_word, user_phone, per';
        const values = [validdata.userName, validdata.passWord, validdata?.userPhone ?? '+7', validdata?.per];
        await my_db.insertNewData(req, res, table, columns, values);
    } else {
        const msg = resultValidat.array()[0]['msg']
        console.error(msg);
        return res.status(400).send(`Error create new user ${msg}`).end();
    }
}

const logInUser = (req, res) => {
    const resultValidat = validationResult(req);
    if (resultValidat.isEmpty()) {
        const validdata = matchedData(req);
        // get data from db and save in session
        // req.session.user = validdata;
        // console.log(req.session.user.name);
        res.status(200).send(`logIn successfully ${validdata}`).end();
    } else {
        const msg = resultValidat.array()[0]['msg']
        res.status(400).send(`Error create new user ${msg}`).end();
    }
}
const usersController = { signupUser, logInUser }


export default usersController;