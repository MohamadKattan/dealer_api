import { Router } from "express";
import my_db from "./my_db.js";
import appSecure from "../utiles/app_secure.js";

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


// general just for dev env
// dbRouter.post(keyDBRouter.genarlSql, appSecure.verifyToken, my_db.queryByDev);

// show  
dbRouter.get(keyDBRouter?.showTables, appSecure.verifyToken, my_db.showAllTable);


dbRouter.post(keyDBRouter?.showColumns, appSecure.verifyToken, my_db.showColumns);

// create
dbRouter.post(keyDBRouter?.createTable, appSecure.verifyToken, my_db.createNewTable);

//del
dbRouter.delete(keyDBRouter?.dropTable, appSecure.verifyToken, my_db.dropAnTable);

dbRouter.delete(keyDBRouter?.truncateTable, appSecure.verifyToken, my_db.truncateTable);

dbRouter.delete(keyDBRouter?.dropColumn, appSecure.verifyToken, my_db.deleteAnColumn);

// put
dbRouter.put(keyDBRouter?.alterColumn, appSecure.verifyToken, my_db.modefiyAnColumn);

dbRouter.put(keyDBRouter?.alterTable, appSecure.verifyToken, my_db.modefiyAnTable);

export default dbRouter;