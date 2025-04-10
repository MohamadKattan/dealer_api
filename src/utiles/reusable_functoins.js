import { validationResult } from 'express-validator';

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
    kEditeUserInfo: "editeUserInfo"
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
    },
    errors: {
        validation: { statusCode: 400, status: "fail", msg: "Validation failed" },
        authFail: { statusCode: 401, status: "fail", msg: "Authentication failed" },
        errorSignUp: { statusCode: 401, status: "fail", msg: "Error creating new user" },
        notFound: { statusCode: 404, status: "fail", msg: "User not found" },
        tokenFail: { statusCode: 401, status: "fail", msg: "Error creating new token try again" },
        serverError: { statusCode: 500, status: "fail", msg: "An unexpected error occurred" },
        loginRequired: { statusCode: 401, status: "fail", msg: "Login is required" },
        noAccess: { statusCode: 403, status: "fail", msg: "You do not have access" },
        errorSql: { statusCode: 400, status: "fail", msg: "error in sql" },
        inviledToken: { statusCode: 401, status: "fail", msg: "Invalid token" },
        kNoTokenP: { statusCode: 403, status: "fail", msg: "No token provided" },
        kSignUp: { statusCode: 401, status: "fail", msg: "Authentication failed" },
        getUsers: { statusCode: 400, status: "fail", msg: "Error to get all users" },
        deleteOnUser: { statusCode: 400, status: "fail", msg: "Error to delete one user" },
        editeUserInfo: { statusCode: 400, status: "fail", msg: "Error to edite user info" }
    }
};

const sanitizeTableName = (name) => {
    return name.replace(/[^a-zA-Z0-9_]/g, '');
}

// Reusable response handler function
const sendRes = (res, type, key, msg, data = null) => {
    const responseConfig = resBody[type][key];
    const response = { status: responseConfig.status, msg: msg ?? responseConfig.msg };
    if (data) response.data = data;
    return res.status(responseConfig.statusCode).send(JSON.stringify(response)).end();
};


const checkPerType = async (res, per) => {
    const isAdmin = process.env.PER;
    if (!per) {
        reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kLoginRequired);
        return false;
    }

    else if (per !== 'admin') {
        reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kNoAccess);
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
        reusable.sendRes(res, reusable.tK.tterror, reusable.tK.kvalidation, msg);
        return false;
    } else {
        return true;
    }
}

const reusable = { sendRes, checkPerType, resultValidatData,sanitizeTableName ,tK };

export default reusable;