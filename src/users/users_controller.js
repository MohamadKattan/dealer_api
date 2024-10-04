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
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kErrorSignUp, result?.error?.error ?? 'error sql **');

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
            const sql = `SELECT * FROM users WHERE user_name = ? AND  pass_word = ?;`;
            const val = [validdata?.userName, validdata?.passWord];
            const result = await my_db?.queryMyDb(sql, val);
            if (result?.error) {
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kAuthFail, result?.error);
            }
            if (result?.msg == 'No found') {
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kNotFound, null);
            }
            console.log(result)
            const user = result['results'][0];
            const newToken = await appSecure.createToken(user);
            if (newToken?.error) {
                return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kTokenFail, null);
            }
            const data = {
                user_id: user?.user_id,
                user_name: user?.user_name,
                per: user?.per,
                address: user?.address,
                token: newToken
            }
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

const getAllUsers = async (req, res) => {
    try {
        const per = req?.user?.per;
        const sql = 'Select * from users';
        await reusable.checkPerType(per);
        const result = await my_db?.queryMyDb(sql);
        if (result?.error) {
            console.error(`Error in get all users :: ${result?.error}`);
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kGetUsers, result?.error);
        }

        reusable.sendRes(res, reusable.tK.ttsuccess, reusable.tK.kGetUsers, null, result);
    } catch (error) {
        console.error(`UnHandel error in get all users :: ${error}`);
        return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kserverError, error);
    }
}

const deleteOneUser = async (req, res) => {
    try {
        const per = req?.user?.per;
        const resultValidat = validationResult(req);
        if (!resultValidat.isEmpty) {
            const msg = resultValidat.array()[0]['msg']
            console.error(msg);
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kvalidation, msg);
        }
        await reusable.checkPerType(per);
        const validdata = matchedData(req);
        const sql = 'DELETE FROM users WHERE user_id = ?;';
        const val = [validdata?.id];
        console.log(val)
        const result = await my_db.queryMyDb(sql, val);
        if (result?.error) {
            console.error(`Error in delete one user :: ${result?.error}`);
            return reusable.sendRes(res, reusable?.tK.tterror, reusable.tK?.kDeleteOnUser, result?.error);
        }
        const effectRow = result?.results?.affectedRows;
        if (effectRow == 0) {
            return reusable.sendRes(res, reusable.tK.ttsuccess, reusable.tK.kDeleteOnUser, 'No found users match with this data !!');
        }
        reusable.sendRes(res, reusable.tK.ttsuccess, reusable.tK.kDeleteOnUser, null);
    } catch (error) {
        console.error(`catch error in deleteOneUser ${error}`);
        reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kserverError, `${error}`);
    }

}

const usersController = { signupUser, logInUser, getAllUsers, deleteOneUser }

export default usersController;