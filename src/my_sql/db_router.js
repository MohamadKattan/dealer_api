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

//get
dbRouter.get(keyDBRouter?.showTables, async (req, res) => {
    try {
        const per = req.session?.user?.per;
        if (!per) {
            return res.status(200).send({ status: "ok", msg: "logIn is required" });
        }
        if (per !== 'admin') {
            return res.status(200).send({ status: "ok", msg: 'You do not have access' });
        }
        const result = await my_db?.showAllTable(req, res);
        if (result?.error) {
            return res.status(404).send(`${result?.error}`).end();
        }
        res.status(200).send(result?.data).end();
    } catch (error) {
        console.error(`Error in showTables route: ${error}`);
        res.status(500).send('Internal Server Error').end();
    }
});

// post 
dbRouter.post(keyDBRouter?.createTable, my_db?.createNewTable);


dbRouter.post(keyDBRouter?.showColumns, my_db?.showColumns);


//del
dbRouter.delete(keyDBRouter?.dropTable, my_db?.dropAnTable);

dbRouter.delete(keyDBRouter?.truncateTable, my_db?.truncateTable);

dbRouter.delete(keyDBRouter?.dropColumn, my_db?.deleteAnColumn);

// put
dbRouter.put(keyDBRouter?.alterTable, my_db?.modefiyAnTable);

dbRouter.put(keyDBRouter?.alterColumn, my_db?.modefiyAnColumn);




export default dbRouter;