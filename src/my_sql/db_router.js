import { Router } from "express";
import my_db from "./my_db.js";
import appSecure from "../utiles/app_secure.js";
import reusable from "../utiles/reusable_functoins.js";

const dbRouter = Router();

const keyDBRouter = {
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
dbRouter.put(keyDBRouter?.alterColumn, async (req, res) => {

    try {
        const per = req.session?.user?.per;
        const tableName = req.body?.tableName;
        const oneColumn = req.body?.oneColumn;
        if (!per) {
            return res.status(401).send({ status: "fail", msg: "Login is required" }).end();
        }
        if (per !== isAdmin) {
            return res.status(403).send({ status: "fail", msg: "You do not have access" }).end();
        }
        const result = await my_db?.modefiyAnColumn(tableName, oneColumn);
        if (result?.error) {
            return res.status(500).send({ status: "fail", msg: result?.error }).end();
        }
        res.status(200).send({ status: "success", msg: result?.msg ?? 'ok' });
    } catch (error) {
        console.error(`Error in delete modefiyAnColumn route: ${error?.message ?? error}`);
        res.status(500).send({ status: "error", msg: "Internal Server Error" }).end();
    }

});

dbRouter.put(keyDBRouter?.alterTable, async (req, res) => {
    try {
        const per = req.session?.user?.per;
        const tableName = req.body?.tableName;
        const oneColumn = req.body?.oneColumn;
        if (!per) {
            return res.status(401).send({ status: "fail", msg: "Login is required" }).end();
        }
        if (per !== isAdmin) {
            return res.status(403).send({ status: "fail", msg: "You do not have access" }).end();
        }
        const result = await my_db?.modefiyAnTable(tableName, oneColumn);
        if (result?.error) {
            return res.status(500).send({ status: "fail", msg: result?.error }).end();
        }
        res.status(200).send({ status: "success", msg: result?.msg ?? 'ok' });
    } catch (error) {
        console.error(`Error in delete modefiyAnTable route: ${error?.message ?? error}`);
        res.status(500).send({ status: "error", msg: "Internal Server Error" }).end();
    }
});

export default dbRouter;