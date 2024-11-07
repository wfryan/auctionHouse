import mysql from 'mysql2'
import * as argon2 from 'argon2'


export const handler = async (event) => {

    let connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });



    //finds if the user exists, gets its id if so
    let CheckIdentity = (username) => {
        let name = String(username);
        return new Promise((resolve, reject) => {
            connection.query('SELECT user_id, password, account_type FROM users WHERE username=?',
                [username], (error, result) => {
                    if (error) { return reject(error); }
                    else { return resolve(result) };
                })
        })
    }



    const identity = await CheckIdentity(event.username);

    if (identity.length != 1) {
        const response = {
            statusCode: 404,
            body: { message: 'No user' }
        };
        return response;
    }




    const isMatch = await argon2.verify(identity[0].password, event.password,)


    if (isMatch) {
        const response = {
            statusCode: 200,
            body: { message: 'Login Success', type: identity[0].account_type }
        };
        return response;
    } else {
        const response = {
            statusCode: 400,
            body: { message: 'Login Failed' }
        };
        return response;
    }

};
