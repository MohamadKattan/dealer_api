import { validationResult, matchedData } from 'express-validator';

const ALLOWED_PERMISSONS = new Set(['admin', 'manger']);


const LevelOfPer = {
    high: 1,
    middel: 2,
    normal: 3
};

const tK = {
    typeSuccess: 'success',
    typeError: 'errors',
    kLogin: 'login',
    kSignUp: 'signUp',
    kcreateTable: 'createTable',
    kNoTables: 'noTables',
    ksuccess: 'successSql',
    kGetUsers: 'getUsers',
    kvalidation: 'validation',
    kAuthFail: 'authFail',
    kErrorSignUp: "errorSignUp",
    kNotFound: 'notFound',
    kTokenFail: 'tokenFail',
    kserverError: 'serverError',
    kLoginRequired: 'loginRequired',
    kNoAccess: 'noAccess',
    kErrorMysQL: 'errorSql',
    kInviledToken: 'inviledToken',
    kNoTokenP: 'noToken',
    kDeleteOnUser: "deleteOnUser",
    kEditeUserInfo: "editeUserInfo",
    kauthLimt: "authLimt",
    errGetWhouse: "errGetWhouse",
    getWhouse: "getWhouse",
    errCreateWhouse: "errCreateWhouse",
    createWhouse: "createWhouse",
    errEditeWhouse: "errEditeWhouse",
    editeWhouse: "edietWhouse",
    errDeleteWhouse: "errDeleteWhouse",
    delWhouse: "delWhouse"
};

// Reusable body 
const resBody = {
    success: {
        signUp: { statusCode: 200, status: "success", msg: "Create new user successful" },
        login: { statusCode: 200, status: "success", msg: "Login Successful" },
        createTable: { statusCode: 200, status: "success", msg: "Create New Table successful" },
        noTables: { statusCode: 200, status: "success", msg: "No Tables Exist yet ..." },
        successSql: { statusCode: 200, status: "success", msg: "Successful" },
        getUsers: { statusCode: 200, status: "success", msg: "Get  all users data Successful" },
        deleteOnUser: { statusCode: 200, status: "success", msg: "Delete one user Successful" },
        editeUserInfo: { statusCode: 200, status: "success", msg: "Edite user info Successful" },
        getWhouse: { statusCode: 200, status: "success", msg: "get wareHouses Successful" },
        createWhouse: { statusCode: 200, status: "success", msg: "create new wareHouses Successful" },
        edietWhouse: { statusCode: 200, status: "success", msg: "Edite  wareHouses Successful" },
        delWhouse: { statusCode: 200, status: "success", msg: "delete  wareHouses Successful" }
    },
    errors: {
        validation: { statusCode: 400, status: "fail", msg: "Validation failed" },
        authFail: { statusCode: 401, status: "fail", msg: "Authentication failed" },
        errorSignUp: { statusCode: 401, status: "fail", msg: "Error creating new user" },
        notFound: { statusCode: 404, status: "fail", msg: "Check user name and passWord and try again" },
        tokenFail: { statusCode: 401, status: "fail", msg: "Error creating new token try again" },
        serverError: { statusCode: 500, status: "fail", msg: "An unexpected error occurred" },
        loginRequired: { statusCode: 401, status: "fail", msg: "Login is required" },
        noAccess: { statusCode: 403, status: "fail", msg: "You do not have access" },
        errorSql: { statusCode: 400, status: "fail", msg: "error in sql" },
        inviledToken: { statusCode: 401, status: "fail", msg: "Invalid token login and try again" },
        kNoTokenP: { statusCode: 403, status: "fail", msg: "No token provided" },
        kSignUp: { statusCode: 401, status: "fail", msg: "Authentication failed" },
        getUsers: { statusCode: 400, status: "fail", msg: "Error to get all users" },
        deleteOnUser: { statusCode: 400, status: "fail", msg: "Error to delete one user" },
        editeUserInfo: { statusCode: 400, status: "fail", msg: "Error to edite user info" },
        authLimt: { statusCode: 429, status: "fail", msg: "Too many attempts. Try again in 15 minutes" },
        errGetWhouse: { statusCode: 404, status: "fail", msg: "error to get wareHouses from DB" },
        errCreateWhouse: { statusCode: 404, status: "fail", msg: "error while create new warehouse" },
        errEditeWhouse: { statusCode: 404, status: "fail", msg: "error while edite wareHouses from DB" },
        errDeleteWhouse: { statusCode: 404, status: "fail", msg: "error while delete wareHouses from DB" },
    }
};


// Reusable response handler function
const sendRes = (res, type, key, msg, data = null) => {
    const responseConfig = resBody[type][key];
    const response = { status: responseConfig.status, msg: msg ?? responseConfig.msg };
    if (data) response.data = data;
    return res.status(responseConfig.statusCode).send(JSON.stringify(response)).end();
};

const checkPer = async (res, per, level) => {
    switch (level) {
        case LevelOfPer.high:
            if (per !== 'admin') {
                reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kNoAccess);
                return false;
            };
            console.log('level is high');
            return true;


        case LevelOfPer.middel:
            if (!ALLOWED_PERMISSONS.has(per)) {
                reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kNoAccess);
                return false;
            };
            console.log(' levele is middel');
            return true;

        case LevelOfPer.normal:
            if (!ALLOWED_PERMISSONS.has(per)) {
                reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kNoAccess);
                return false;
            };
            console.log(' levele is normal');
            return true;

        default:
            console.log('No level provder');
            reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kLoginRequired);
            return false;
    }

}

const checkHighPer = async (res, per) => {
    if (!per) {
        reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kLoginRequired);
        return false;
    }

    if (per !== 'admin') {
        reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kNoAccess);
        return false;

    }
    console.log('per is okay');
    return true;
}

const typeIsString = async (name) => {
    if (typeof name !== 'string' || !/^[a-zA-Z0-9_]+$/.test(name)) {
        return false;
    } else {
        return true;
    }

}


const resultValidatData = async (req, res) => {
    const resultValidat = validationResult(req);
    if (!resultValidat.isEmpty()) {
        const msg = resultValidat.array()[0]['msg']
        console.error(msg);
        reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kvalidation, msg);
        return { data: false };
    }
    console.log('Validat Data is okay');
    const validdata = matchedData(req);
    return { data: validdata };
}

const reusable = { sendRes, checkHighPer, resultValidatData, typeIsString, checkPer, tK, LevelOfPer };

export default reusable;