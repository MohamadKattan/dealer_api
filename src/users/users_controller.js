import { query, body, param, check, checkSchema, validationResult, matchedData } from 'express-validator';
import my_db from '../my_sql/my_db.js';
import { json } from 'express';

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

const logInUser = async (req, res) => {
    const resultValidat = validationResult(req);
    if (resultValidat.isEmpty()) {
        const validdata = matchedData(req);
        const sql = `SELECT user_name, user_phone, per, user_id FROM users WHERE user_name = ? AND  pass_word = ?;`;
        const val = [validdata?.userName, validdata?.passWord];
        const result = await my_db?.getData(res, sql, val);
        if (result.error) {
            return res.status(404).send(`error is : ${result.error}`).end();
        }
        const user = result[0];
        req.session.user = user;
        console.log('this is req.session ::' + req.session.user?.user_name);
        console.log('this is sessionID ::' + req.sessionID);
        res.status(200).send(` ${JSON.stringify(user)}`).end();
    } else {
        const msg = resultValidat.array()[0]['msg']
        res.status(400).send(`Error create new user ${msg}`).end();
    }
}

const usersController = { signupUser, logInUser }

export default usersController;