import jwt from 'jsonwebtoken';



const createToken = async () => {
    try {
        const tokeOptions = {
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: 'foobar'
        };

        const token = jwt.sign(tokeOptions, 'secret');
        return token;
    } catch (error) {
        console.error('error to create new token')
        return { error: error };

    }
}

const verifyToken = async (token) => {
    try {
        const result = await new Promise((resolve, reject) => {
            jwt.verify(token, 'secret', function (err, decoded) {
                if (err) {
                    console.error(err);
                    return reject({ error: err });
                }
                console.log(decoded);
                resolve(decoded);
            });
        });
        return result;
    } catch (error) {
        console.error(`error at verifyToken :: ${error}`);
    }

}

const appSecure = { createToken, verifyToken }

export default appSecure;
