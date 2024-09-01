import { query, body, param, check, checkSchema, validationResult, matchedData, cookie } from 'express-validator';
import my_db from '../my_sql/my_db.js';
import appSecure from '../utiles/app_secure.js';


const isAdmin = process.env.PER;

const signupUser = async (req, res) => {
    try {
        const per = req.session?.user?.per;
        if (!per) {
            return res.status(401).send({ status: "fail", msg: "Login is required" }).end();
        }

        if (per !== isAdmin) {
            return res.status(403).send({ status: "fail", msg: "You do not have access" }).end();
        }

        const resultValidat = validationResult(req);
        if (resultValidat.isEmpty()) {
            const validdata = matchedData(req);
            const table = 'users';
            const columns = 'user_name, pass_word, user_phone, per';
            const values = [validdata.userName, validdata.passWord, validdata?.userPhone ?? '+7', validdata?.per];
            const result = await my_db.insertNewData(table, columns, values);
            if (result?.error) {
                res.status(500).send({ status: 'fail', msg: result?.error ?? 'error' });
            }
            res.status(200).send({ status: "Success", msg: result?.msg ?? 'ok' }).end();
        } else {
            const msg = resultValidat.array()[0]['msg']
            console.error(msg);
            return res.status(500).send(`Error create new user ${msg}`).end();
        }

    } catch (error) {
        console.error(`error in sinupUser ${error}`);
        res.status(500).send({ status: "fail", msg: "Un handel error in sginup User" }).end();
    }
}

const logInUser = async (req, res) => {
    try {
        const resultValidat = validationResult(req);
        if (resultValidat.isEmpty()) {
            const validdata = matchedData(req);
            const sql = `SELECT user_name, user_phone, per, user_id FROM users WHERE user_name = ? AND  pass_word = ?;`;
            const val = [validdata?.userName, validdata?.passWord];
            const result = await my_db?.getData(sql, val);
            if (result?.error) {
                return res.status(401).send({ status: "fail", msg: result?.error }).end();
            }
            if (!result?.data) {
                return res.status(404).send({ status: "fail", msg: 'User no found  or check your info and try agin' }).end();
            }
            const user = result?.data[0];
            req.session.user = user;
            const newToken = await appSecure.createToken(user);
            if (newToken?.error) {
                return res.status(401).send({ status: "fail", msg: 'Error to create new token' }).end();
            }
            console.log('login as :' + req.session.user?.user_name);
            console.log('sessionID :' + req.sessionID);
            console.log('token :' + newToken);
            res.status(200).send(JSON.stringify({ data: user, token: newToken })).end();
        } else {
            const msg = resultValidat.array()[0]['msg']
            res.status(400).send({ status: "fail", msg: `${msg}` }).end();

        }

    } catch (error) {
        console.error('Un handel error in login method')
        res.status(400).send({ status: "fail", msg: `${error}` }).end();
    }
}

const usersController = { signupUser, logInUser }

export default usersController;