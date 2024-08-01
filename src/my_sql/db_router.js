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
dbRouter.get(keyDBRouter?.showTables, my_db?.showAllTable);

// post 
dbRouter.post(keyDBRouter?.createTable,  my_db?.createNewTable);

dbRouter.post(keyDBRouter?.showColumns, my_db?.showColumns);


//del
dbRouter.delete(keyDBRouter?.dropTable, my_db?.dropAnTable);

dbRouter.delete(keyDBRouter?.truncateTable, my_db?.truncateTable);

dbRouter.delete(keyDBRouter?.dropColumn, my_db?.deleteAnColumn);

// put
dbRouter.put(keyDBRouter?.alterTable, my_db?.modefiyAnTable);

dbRouter.put(keyDBRouter?.alterColumn, my_db?.modefiyAnColumn);




export default dbRouter;