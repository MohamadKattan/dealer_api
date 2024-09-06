import { query, body, param, check, checkSchema, validationResult, matchedData, cookie } from 'express-validator';
import my_db from '../my_sql/my_db.js';
import appSecure from '../utiles/app_secure.js';
import reusable from '../utiles/reusable_functoins.js';


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
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kAuthFail, result?.error);
            }
            if (!result?.data) {
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kNotFound, null);
            }
            const user = result?.data[0];
            req.session.user = user;
            const newToken = await appSecure.createToken(user);
            if (newToken?.error) {
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kTokenFail, null);
            }
            const data = {
                user_id: user?.user_id,
                user_name: user?.user_name,
                per: user?.per,
                token: newToken
            }
            console.log(` sessionID : ${req.sessionID},\n data:  ${data},\n token ${newToken}`);
            reusable.sendRes(res, reusable.tK.ttsuccess, reusable.tK.kLogin, null, data);

        } else {
            const msg = resultValidat.array()[0]['msg']
            reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kvalidation, msg);
        }
    } catch (error) {
        console.error('An unexpected error occurred')
        reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kserverError, `${error}`);
    }
}

const usersController = { signupUser, logInUser }

export default usersController;