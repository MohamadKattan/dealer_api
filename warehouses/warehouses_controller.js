import reusable from "../src/utiles/reusable_functoins.js";
import my_db from "../src/my_sql/my_db.js";



const showWhouses = async (req, res) => {
    const per = req?.user?.per;
    const level = reusable.LevelOfPer.middel;

    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    const sql = 'Select * from warehouses';
    try {
        const result = await my_db.selectQuery(sql);
        if (result?.error) {
            console.error(`Error get all warehouses => ${result?.error}`);
            return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.errGetWhouse, result?.error);
        }

        const data = result[0]
        const msg = result[0] <= 0 ? 'No warehouses yet' : null;
        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.getWhouse, msg, data);
    } catch (error) {
        console.error(`Un Handel error at get wareHouses => ${error}`);
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kserverError, error?.code);
    }
}

const createNewWarehouse = async (req, res) => {

    const body = await reusable.resultValidatData(req, res);
    if (!body?.data) return;

    const per = req?.user?.per;
    const level = reusable.LevelOfPer.middel;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    const table = 'warehouses';
    const columns = 'name, des';
    const values = [body?.data?.name, body?.data?.des];

    try {
        const resDB = await my_db.insertNewData(table, columns, values);

        if (resDB?.error) {
            console.error(resDB?.error);
            return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.errCreateWhouse, resDB?.error?.code ?? 'Error in sql create warehouse');
        }

        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.createWhouse);

    } catch (error) {
        console.error(` catch Error at create new warehouse  ${error}`);
        reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kserverError, `${error}`);
    }

}

const EditeWhouses = async (req, res) => {
    const body = await reusable.resultValidatData(req, res);
    if (!body.data) return;

    const level = 2;
    const per = req.user.per;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    const sql = `UPDATE warehouses SET name =?, des =? WHERE id = ${my_db.pool.escape(body?.data?.id)};`;
    const val = [body?.data?.name, body?.data?.des];

    try {
        const resDB = await my_db.selectQuery(sql, val);

        if (resDB?.error) {
            console.error(`Error in edite warehouse :: ${resDB?.error ?? 'err'}`);
            return reusable.sendRes(res, reusable?.tK.typeError, reusable.tK?.errEditeWhouse, resDB?.error);
        }

        const effectRow = resDB[0];

        if (effectRow?.affectedRows <= 0) {
            return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.editeWhouse, 'No found warehouse match with this data !!');
        }

        if (effectRow?.affectedRows == 1 && effectRow?.changedRows == 0) {
            return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.editeWhouse, `No effect. ${effectRow?.info}`);
        }

        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.editeWhouse, effectRow?.info);

    } catch (error) {
        console.error(`catch error in edite warehouses :: ${error}`);
        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kserverError, `${error}`);

    }

}

const deleteWhouses = async (req, res) => {
    const body = await reusable.resultValidatData(req, res);
    if (!body.data) return;

    const per = req.user.per;
    const level = 2;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    const sql = 'DELETE FROM warehouses WHERE id = ?;';
    const val = [body?.data?.id];

    try {
        const resDB = await my_db.selectQuery(sql, val);

        if (resDB?.error) {
            console.error(`Error in delete warehouse :: ${resDB?.error}`);
            return reusable.sendRes(res, reusable?.tK.typeError, reusable.tK?.errDeleteWhouse, resDB?.error);
        }



        const effectRow = resDB[0].affectedRows;
        if (effectRow == 0) {
            return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.delWhouse, 'No found warehouse match with this data !!');
        }

        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.delWhouse, null);

    } catch (error) {
        console.error(`catch error in delete warehouses :: ${error}`);
        reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kserverError, `${error}`);

    }
}



const whousesController = { showWhouses, createNewWarehouse, EditeWhouses, deleteWhouses };

export default whousesController;