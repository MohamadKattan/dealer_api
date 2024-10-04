import { Router } from "express";
import my_db from "./my_db.js";
import appSecure from "../utiles/app_secure.js";
import reusable from "../utiles/reusable_functoins.js";

const dbRouter = Router();

const keyDBRouter = {
    genarlSql: "/api/genarl",
    showTables: "/api/showTables",
    showColumns: "/api/showColumns",
    createTable: "/api/createTable",
    dropTable: "/api/droptable",
    truncateTable: "/api/truncate",
    alterTable: "/api/alterTable",
    dropColumn: "/api/dropColumn",
    alterColumn: "/api/alterColumn"
}
const isAdmin = process.env.PER;

// general
dbRouter.post(keyDBRouter.genarlSql, appSecure.verifyToken, async (req, res) => {
    try {
        const per = req?.user?.per;
        const pass = req.body.pass;
        const bodySql = req.body.text;
        console.log(bodySql);

        if (!per) {
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK?.kLoginRequired, null);

        }
        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK?.kNoAccess, null);
        }

        if (pass !== process.env.KEY_SQL) {
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK?.kNoAccess, 'NO Access onle devloper');
        }

        const result = await my_db?.queryByDev(bodySql);
        if (result?.error) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kErrorMysQL, result?.error?.error ?? 'error sql dev**');
        }
        reusable.sendRes(res, reusable.tK?.ttsuccess, reusable.tK?.ksuccess, null);

    } catch (error) {
        console.error(`Error in dev route: ${error}`);
        return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);

    }

});

// show  
dbRouter.get(keyDBRouter?.showTables, appSecure.verifyToken, async (req, res) => {
    try {
        const per = req?.user?.per;
        if (!per) {
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK?.kLoginRequired, null);

        }
        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK?.kNoAccess, null);
        }
        const result = await my_db?.showAllTable(req, res);
        if (result?.error) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kErrorMysQL,
                result?.error?.error ?? 'error sql**');

        }
        return reusable.sendRes(res, reusable.tK?.ttsuccess, reusable.tK?.ksuccess, result?.msg, result?.data);
    } catch (error) {
        console.error(`Error in showTables route: ${error.message}`);
        return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);
    }
});

dbRouter.post(keyDBRouter?.showColumns, appSecure.verifyToken, async (req, res) => {
    try {
        const per = req?.user?.per;
        const tableName = req.body?.tableName;
        if (!per) {
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK?.kLoginRequired, null);

        }
        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK.tterror, reusable.tK?.kNoAccess, null);
        }
        const result = await my_db?.showColumns(tableName);
        if (result?.error) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kErrorMysQL,
                result?.error?.error ?? 'error sql**');
        }
        return reusable.sendRes(res, reusable.tK?.ttsuccess, reusable.tK?.ksuccess, result?.msg, result?.data);

    } catch (error) {
        console.error(`Error in showColumns route: ${error.message}`);
        return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);
    }
});

// create
dbRouter.post(keyDBRouter?.createTable, appSecure.verifyToken, async (req, res) => {
    try {
        const per = req?.user?.per;
        const tableName = req.body?.tableName;
        const columns = req.body?.columns
        if (!per) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kLoginRequired, null);
        }

        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kNoAccess, null);
        }
        const result = await my_db?.createNewTable(tableName, columns);
        if (result?.error) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kErrorMysQL, result?.error?.error ?? 'error sql**');
        }
        reusable.sendRes(res, reusable.tK?.ttsuccess, reusable.tK?.kcreateTable, null);

    } catch (error) {
        console.error(`Error in create table router: ${error}`);
        reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);
    }
});

//del
dbRouter.delete(keyDBRouter?.dropTable, appSecure.verifyToken, async (req, res) => {
    try {
        const per = req?.user?.per;
        const tableName = req.body?.tableName;
        if (!per) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kLoginRequired, null);
        }

        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kNoAccess, null);
        }

        const result = await my_db?.dropAnTable(tableName);

        if (result?.error) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kErrorMysQL, result?.error?.error ?? 'error sql**');
        }

        reusable.sendRes(res, reusable.tK?.ttsuccess, reusable.tK?.ksuccess, null);

    } catch (error) {
        console.error(`Error in delete table route: ${error?.message ?? error}`);
        reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);
    }
});

dbRouter.delete(keyDBRouter?.truncateTable, appSecure.verifyToken, async (req, res) => {
    try {
        const per = req?.user?.per;
        const tableName = req.body?.tableName;
        if (!per) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kLoginRequired, null);
        }

        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kNoAccess, null);
        }
        const result = await my_db?.truncateTable(tableName);
        if (result?.error) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kErrorMysQL, result?.error?.error ?? 'error sql**');
        }
        reusable.sendRes(res, reusable.tK?.ttsuccess, reusable.tK?.ksuccess, null);

    } catch (error) {
        console.error(`Error in delete table route: ${error?.message ?? error}`);
        reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);
    }
});

dbRouter.delete(keyDBRouter?.dropColumn, appSecure.verifyToken, async (req, res) => {
    try {
        const per = req?.user?.per;
        const tableName = req.body?.tableName;
        const oneColumn = req.body?.oneColumn;
        if (!per) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kLoginRequired, null);
        }

        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kNoAccess, null);
        }
        const result = await my_db?.deleteAnColumn(tableName, oneColumn);

        if (result?.error) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kErrorMysQL, result?.error?.error ?? 'error sql**');
        }
        reusable.sendRes(res, reusable.tK?.ttsuccess, reusable.tK?.ksuccess, null);
    } catch (error) {
        console.error(`Error in delete Column route: ${error?.message ?? error}`);
        reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);
    }
});

// put
dbRouter.put(keyDBRouter?.alterColumn, appSecure.verifyToken, async (req, res) => {

    try {
        const per = req?.user?.per;
        const tableName = req.body?.tableName;
        const oneColumn = req.body?.oneColumn;
        if (!per) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kLoginRequired, null);
        }

        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kNoAccess, null);
        }
        const result = await my_db?.modefiyAnColumn(tableName, oneColumn);
        if (result?.error) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kErrorMysQL, result?.error?.error ?? 'error sql**');
        }
        reusable.sendRes(res, reusable.tK?.ttsuccess, reusable.tK?.ksuccess, null);
    } catch (error) {
        console.error(`Error in delete modefiyAnColumn route: ${error?.message ?? error}`);
        reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);
    }

});

dbRouter.put(keyDBRouter?.alterTable, appSecure.verifyToken, async (req, res) => {
    try {
        const per = req?.user?.per;
        const tableName = req.body?.tableName;
        const oneColumn = req.body?.oneColumn;
        if (!per) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kLoginRequired, null);
        }

        if (per !== isAdmin) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kNoAccess, null);
        }
        const result = await my_db?.modefiyAnTable(tableName, oneColumn);
        if (result?.error) {
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kErrorMysQL, result?.error?.error ?? 'error sql**');
        }
        reusable.sendRes(res, reusable.tK?.ttsuccess, reusable.tK?.ksuccess, null);
    } catch (error) {
        console.error(`Error in delete modefiyAnTable route: ${error?.message ?? error}`);
        reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);
    }
});

export default dbRouter;