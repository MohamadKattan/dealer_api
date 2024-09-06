
const tK = {
    ttsuccess: 'success',
    kLogin: 'login',
    tterror: 'errors',
    kvalidation: 'validation',
    kAuthFail: 'authFail',
    kNotFound: 'notFound',
    kTokenFail: 'tokenFail',
    kserverError: 'serverError'
};

// Reusable body 
const resBody = {
    success: {
        login: { statusCode: 200, status: "success", msg: "Login successful" }
    },
    errors: {
        validation: { statusCode: 400, status: "fail", msg: "Validation failed" },
        authFail: { statusCode: 401, status: "fail", msg: "Authentication failed" },
        notFound: { statusCode: 404, status: "fail", msg: "User not found" },
        tokenFail: { statusCode: 401, status: "fail", msg: "Error creating new token try again" },
        serverError: { statusCode: 500, status: "fail", msg: "An unexpected error occurred" }
    }
};

// Reusable response handler function
const sendRes = (res, type, key, msg, data = null) => {
    const responseConfig = resBody[type][key];
    const response = { status: responseConfig.status, msg: msg ?? responseConfig.msg };
    if (data) response.data = data;
    console.log(`result from sendRes : ${response}`);
    return res.status(responseConfig.statusCode).send(JSON.stringify(response)).end();
};

const reusable = { sendRes, tK };

export default reusable;