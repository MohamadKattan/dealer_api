import { query, body, param, check, checkSchema, validationResult, matchedData, cookie } from 'express-validator';
import my_db from '../my_sql/my_db.js';
import appSecure from '../utiles/app_secure.js';
import reusable from '../utiles/reusable_functoins.js';


const isAdmin = process.env.PER;

const signupUser = async (req, res) => {
    try {
        const per = req?.user?.per;

        if (!per) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kLoginRequired, null);
        }

        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kNoAccess, null);
        }

        const resultValidat = validationResult(req);
        if (resultValidat.isEmpty()) {
            const validdata = matchedData(req);
            const table = 'users';
            const columns = 'user_name, pass_word, address, per';
            const values = [validdata.userName, validdata.passWord, validdata?.address, validdata?.per];
            const result = await my_db.insertNewData(table, columns, values);

            if (result?.error) {
                console.error(result?.error);
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kErrorSignUp, result?.error ?? 'error sql **');

            }
            return reusable.sendRes(res, reusable.tK.ttsuccess, reusable.tK.kSignUp, null);
        } else {
            const msg = resultValidat.array()[0]['msg']
            console.error(msg);
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kvalidation, msg);
        }

    } catch (error) {
        console.error(`error in sinupUser ${error}`);
        reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kserverError, `${error}`);
    }
}

const logInUser = async (req, res) => {
    try {
        const resultValidat = validationResult(req);
        if (resultValidat.isEmpty()) {
            const validdata = matchedData(req);
            const sql = `SELECT user_name, per, user_id FROM users WHERE user_name = ? AND  pass_word = ?;`;
            const val = [validdata?.userName, validdata?.passWord];
            const result = await my_db?.getData(sql, val);
            if (result?.error) {
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kAuthFail, result?.error);
            }
            if (!result?.data) {
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kNotFound, null);
            }
            const user = result?.data[0];
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
            console.log(`data:  ${data},\n token ${newToken}`);
            reusable.sendRes(res, reusable.tK.ttsuccess, reusable.tK.kLogin, null, data);

        } else {
            const msg = resultValidat.array()[0]['msg']
            console.error(msg);
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kvalidation, msg);
        }
    } catch (error) {
        console.error('An unexpected error occurred' + error);
        reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kserverError, `${error}`);
    }
}

const usersController = { signupUser, logInUser }

export default usersController;