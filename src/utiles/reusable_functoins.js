
const tK = {
    ttsuccess: 'success',
    kLogin: 'login',
    kSignUp: 'signUp',
    kcreateTable: 'createTable',
    ksuccess: 'successSql',
    kGetUsers: 'getUsers',
    tterror: 'errors',
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
    kDeleteOnUser: "deleteOnUser"
};

// Reusable body 
const resBody = {
    success: {
        signUp: { statusCode: 200, status: "success", msg: "Create new user successful" },
        login: { statusCode: 200, status: "success", msg: "Login Successful" },
        createTable: { statusCode: 200, status: "success", msg: "Create New Table successful" },
        successSql: { statusCode: 200, status: "success", msg: "Successful" },
        getUsers: { statusCode: 200, status: "success", msg: "Get  all users data Successful" },
        deleteOnUser: { statusCode: 200, status: "success", msg: "Delete  one user  Successful" }
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
        deleteOnUser: { statusCode: 400, status: "fail", msg: "Error to delete one user" }
    }
};

// Reusable response handler function
const sendRes = (res, type, key, msg, data = null) => {
    const responseConfig = resBody[type][key];
    const response = { status: responseConfig.status, msg: msg ?? responseConfig.msg };
    if (data) response.data = data;
    return res.status(responseConfig.statusCode).send(JSON.stringify(response)).end();
};


const checkPerType = (per) => {
    const isAdmin = process.env.PER;
    if (!per) {
        return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kLoginRequired, null);
    }

    if (per !== isAdmin) {
        return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kNoAccess, null);
    }
}

const reusable = { sendRes, checkPerType, tK };

export default reusable;