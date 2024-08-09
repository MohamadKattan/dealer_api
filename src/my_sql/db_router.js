import { Router } from "express";
import my_db from "./my_db.js";

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
const isAdmin = 'admin';

// show 
dbRouter.get(keyDBRouter?.showTables, async (req, res) => {
    try {
        const per = req.session?.user?.per;
        if (!per) {
            return res.status(401).send({ status: "fail", msg: "Login is required" });
        }
        if (per !== isAdmin) {
            return res.status(403).send({ status: "fail", msg: "You do not have access" });
        }
        const result = await my_db?.showAllTable(req, res);
        if (result?.error) {
            return res.status(500).send({ status: "error", msg: result?.error }).end();
        }
        return res.status(200).send({ status: "success", msg: result?.msg, data: result?.data }).end();
    } catch (error) {
        console.error(`Error in showTables route: ${error.message}`);
        res.status(500).send({ status: "error", msg: "Internal Server Error" }).end();
    }
});

dbRouter.post(keyDBRouter?.showColumns, async (req, res) => {
    try {
        const per = req.session?.user?.per;
        const tableName = req.body?.tableName;
        console.log(per);
        if (!per) {
            return res.status(401).send({ status: "fail", msg: "Login is required" }).end();
        }
        if (per !== isAdmin) {
            return res.status(403).send({ status: "fail", msg: "You do not have access" }).end();
        }
        const result = await my_db?.showColumns(tableName);
        if (result?.error) {
            return res.status(500).send({ status: "error", msg: result?.error }).end();
        }

        return res.status(200).send({ status: "success", msg: result?.msg, data: result?.data }).end();

    } catch (error) {
        console.error(`Error in showColumns route: ${error.message}`);
        res.status(500).send({ status: "error", msg: "Internal Server Error" }).end();
    }
});

// create
dbRouter.post(keyDBRouter?.createTable, my_db?.createNewTable);


//del
dbRouter.delete(keyDBRouter?.dropTable, my_db?.dropAnTable);

dbRouter.delete(keyDBRouter?.truncateTable, my_db?.truncateTable);

dbRouter.delete(keyDBRouter?.dropColumn, my_db?.deleteAnColumn);

// put
dbRouter.put(keyDBRouter?.alterTable, my_db?.modefiyAnTable);

dbRouter.put(keyDBRouter?.alterColumn, my_db?.modefiyAnColumn);




export default dbRouter;