
import my_db from '../my_sql/my_db.js';
import appSecure from '../utiles/app_secure.js';
import reusable from '../utiles/reusable_functoins.js';



const signupUser = async (req, res) => {

    const body = await reusable.resultValidatData(req, res);
    if (!body?.data) return;

    const per = req?.user?.per;
    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;


    const table = 'users';
    const columns = 'user_name, pass_word, address, per';
    const values = [body?.data?.userName, body?.data?.passWord, body?.data?.address, body?.data?.per];

    try {

        const result = await my_db.insertNewData(table, columns, values);

        if (result?.error) {
            console.error(result?.error);
            return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorSignUp, `${result?.error?.code} Error sign up` ?? 'Error sign up!!');
        }



        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kSignUp, null);

    } catch (error) {
        console.error(`Error in sinup User ${error}`);
        reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kserverError, `${error}`);
    }
}

const logInUser = async (req, res) => {

    const body = await reusable.resultValidatData(req, res);
    if (!body?.data) return;

    const sql = `SELECT * FROM users WHERE user_name = ? AND  pass_word = ?;`;
    const val = [body?.data?.userName, body?.data?.passWord];

    try {
        const result = await my_db?.selectQuery(sql, val);

        if (result?.error) {
            return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kAuthFail, result?.error);
        }

        const newResult = result[0][0];

        if (newResult == null) {
            return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNotFound, null);
        }

        const user = newResult;
        const createToken = await appSecure.createToken(user);
        if (createToken?.error) {
            return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kTokenFail, null);
        }

        const data = {
            user_id: user?.id,
            user_name: user?.user_name,
            per: user?.per,
            address: user?.address,
            token: createToken
        }
        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kLogin, null, data);

    } catch (error) {
        console.error('An unexpected error occurred in login ' + error);
        reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kserverError, `${error}`);
    }
}

const getAllUsers = async (req, res) => {

    const per = req?.user?.per;
    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;
    const sql = 'Select * from users';
    try {
        const resDB = await my_db.selectQuery(sql);
        if (resDB?.error) {
            console.error(`Error in get all users :: ${resDB?.error}`);
            return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kGetUsers, resDB?.error);
        }
        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kGetUsers, null, resDB[0]);
    } catch (error) {
        console.error(`Un Handel error in get all users :: ${error}`);
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kserverError, error?.code);
    }
}

const deleteOneUser = async (req, res) => {

    const body = await reusable.resultValidatData(req, res);
    if (!body?.data) return;

    const per = req?.user?.per;
    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;


    const sql = 'DELETE FROM users WHERE id = ?;';
    const val = [body?.data?.id];

    try {

        const resDB = await my_db.selectQuery(sql, val);

        if (resDB?.error) {
            console.error(`Error in delete one user :: ${resDB?.error}`);
            return reusable.sendRes(res, reusable?.tK.typeError, reusable.tK?.kDeleteOnUser, resDB?.error);
        }

        const effectRow = resDB[0].affectedRows;
        if (effectRow == 0) {
            return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kDeleteOnUser, 'No found users match with this data !!');
        }

        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kDeleteOnUser, null);

    } catch (error) {
        console.error(`catch error in deleteOneUser ${error}`);
        reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kserverError, `${error}`);
    }
}

const editeUserInfo = async (req, res) => {

    const body = await reusable.resultValidatData(req, res);
    if (!body?.data) return;

    const per = req?.user?.per;
    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    const sql = `UPDATE users SET user_name =?, pass_word =?, per=?, address =? WHERE id = ${my_db.pool.escape(body?.data?.userId)};`;
    const val = [body?.data?.userName, body?.data?.passWord, body?.data?.per, body?.data.address];

    try {
        const resDB = await my_db.selectQuery(sql, val);

        if (resDB?.error) {
            console.error(`Error in edite one user :: ${resDB?.error}`);
            return reusable.sendRes(res, reusable?.tK.typeError, reusable.tK?.kEditeUserInfo, resDB?.error);
        }

        const effectRow = resDB[0];

        if (effectRow?.affectedRows <= 0) {
            return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kEditeUserInfo, 'No found users match with this data !!');
        }

        if (effectRow?.affectedRows == 1 && effectRow?.changedRows == 0) {
            return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kEditeUserInfo, `No effect. ${effectRow?.info}`);
        }

        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kEditeUserInfo, effectRow?.info);
    } catch (error) {
        console.error(`catch error in editeUserInfo :: ${error}`);
        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kserverError, `${error}`);
    }

}

const usersController = { signupUser, logInUser, getAllUsers, deleteOneUser, editeUserInfo }

export default usersController;