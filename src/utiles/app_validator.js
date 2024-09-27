import { query, body, param, check, checkSchema, validationResult, matchedData } from 'express-validator';


const appValidatorQuery = (reqQuery) => {
    query(reqQuery).notEmpty().escape();
}


const createUserValidatorSchema = {
    userName: {
        isString: true,
        notEmpty: true,
        escape: true,
        errorMessage: 'Invalid name',
    },
    // email: {
    //     isEmail: true,
    //     notEmpty: true,
    //     normalizeEmail: true,
    //     custom: {
    //         options: (value, { req }) => {
    //             const domain = value.split('@')[1];
    //             if (domain !==
    //                 'gmail.com' &&
    //                 domain !== 'yahoo.com' &&
    //                 domain !== 'hotmail.com'
    //             ) {
    //                 throw new Error('Invalid email domain');
    //             }
    //             // const existingUser = User.findOne({ email: value });
    //             // if (existingUser) {
    //             //     throw new Error('Email address already in use');
    //             // }
    //             return true;
    //         },
    //     },
    //     escape: true,
    //     errorMessage: 'Invalid email',
    // },
    passWord: {
        isString: true,
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password should be at least 8 chars',
        },
        matches: {
            options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
            errorMessage: 'Password should contain at least one uppercase letter, one lowercase letter, and one number'

        },
        escape: true,
        errorMessage: 'Invalid Password ',
    },
    address: {
        isString: true,
        escape: true,
        errorMessage: 'Invalid address'
    },
    per: {
        isString: true,
        notEmpty: true,
        escape: true,
        errorMessage: 'Invalid permission',

    }
}

const loginValidatorSchema = {
    userName: {
        isString: true,
        notEmpty: true,
        escape: true,
        errorMessage: 'Invalid user Name',
    },
    passWord: {
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password should be at least 8 chars',
        },
        matches: {
            options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
            errorMessage: 'Password should contain at least one uppercase letter, one lowercase letter, and one number'

        },
        escape: true,
        errorMessage: 'Invalid Password ',
    }
}

const userValidator = { createUserValidatorSchema, loginValidatorSchema }

export default userValidator;