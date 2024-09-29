
const tK = {
    ttsuccess: 'success',
    kLogin: 'login',
    kSignUp: 'signUp',
    kcreateTable: 'createTable',
    ksuccess: 'successSql',
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
    kNoTokenP: 'noToken'
};

// Reusable body 
const resBody = {
    success: {
        signUp: { statusCode: 200, status: "success", msg: "Create new user successful" },
        login: { statusCode: 200, status: "success", msg: "Login Successful" },
        createTable: { statusCode: 200, status: "success", msg: "Create New Table successful" },
        successSql: { statusCode: 200, status: "success", msg: "Successful" },
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
    }
};

// Reusable response handler function
const sendRes = (res, type, key, msg, data = null) => {
    const responseConfig = resBody[type][key];
    const response = { status: responseConfig.status, msg: msg ?? responseConfig.msg };
    if (data) response.data = data;
    // console.log(`result from sendRes : ${JSON.stringify(response.msg)}`);
    return res.status(responseConfig.statusCode).send(JSON.stringify(response)).end();
};

const reusable = { sendRes, tK };

export default reusable;