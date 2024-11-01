const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require('path');
const app = express();
const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const keyD = new NodeRSA({ b: 512 });

app.use(express.static(path.join(__dirname, 'pages')));

app.use(express.json());
const db = require('../lib/db.js');
const userMiddleware = require('../middleware/users.js');



//http://localhost:3000/api/sign-up
router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
    const db_username = `SELECT * 
                         FROM data_test.users
                         WHERE 
                         LOWER(usersname) = LOWER("${req.body.username}")`

    db.query(db_username, (err, result) => {
        if (err != null) {
            return res.status(409).send({
                message: err.sqlMessage
            });
        }
        if (result != undefined && result.length == 0) {
            var rawSql = `
               INSERT INTO data_test.users 
                (usersname,password ,registered,lastlogin)
                VALUES  
                ( 
                LOWER("${req.body.username}"),
                LOWER("${req.body.password}"),now(),now()
                )`

            db.query(rawSql, (err, result) => {
                if (err != null) {
                    return res.status(409).send({
                        message: err.sqlMessage
                    });
                } else {
                    return res.status(200).send({
                        message: "dang ki tai khoan thanh cong! "
                    });
                }
            })
        } else {
            return res.status(409).send({
                message: "this username is already in use"
            });
        }
    }
    )
});

//http://localhost:3000/api/delete
router.delete('/delete', (req, res, next) => {
    // const db_delete = ` SELECT * 
    //                     FROM data_test.users
    //                     WHERE 
    //                     TRIM(LOWER(usersname)) = TRIM(LOWER("${req.body.username}"))`
         const db_delete = ` SELECT * FROM data_test.users where TRIM(LOWER(usersname)) = TRIM(LOWER("${req.body.username}"));`
    db.query(db_delete,
        (err, result) => {
            console.log("chekc", result);
            if (err != null) {
                return res.status(409).send({
                    message: err.sqlMessage
                });
            }
            if (result != undefined && result.length != 0) {
                console.log("hree");
                var rawSql = ` DELETE FROM data_test.users
                                WHERE TRIM(LOWER(usersname)) = TRIM(LOWER("${req.body.username}"))
                            `
                db.query(rawSql, (err, result) => {
                    console.log("check:0", err);

                    if (err != null) {
                        return res.status(409).send({
                            message: err.sqlMessage
                        });
                    } else {
                        console.log("here");
                        return res.status(200).send({
                            message: "xoa tai khoan thanh cong! "
                        });
                    }

                })

            } else {
                return res.status(409).send({
                    message: 'account does not exist'
                })
            }


        });

});



//http://localhost:3000/api/login
router.post('/login', (req, res, next) => {
    
    const db_login = `  SELECT * 
                        FROM data_test.users 
                        WHERE usersname  = ${db.escape(req.body.username)}`
 console.log("db: ",req.body.username);
    db.query(db_login, (err, result) => {
        if (err) {
            throw err;
            return res.status(400).send({
                message: err
            });
        }
        if (!result.length) {
            return res.status(400).send({
                message: 'Username or PassWord incorrect 1'
            });
        }
        bcrypt.compare(req.body.password, result[0]['password'],
            (bErr, bResult) => {
                if (bErr) {
                    throw bErr;
                    return res.status(400).send({
                        message: 'Username or PassWord incorrect'
                    });
                }
                if (!bResult) {
                    //password match

                    const token = jwt.sign(
                        {
                            username: result[0].usersname,
                            userId: result[0].id,
                            
                            
                        },
                        "SECRETKEY",
                        { expiresIn: '1h' }
                    );
                    db.query(
                        `UPDATE data_test.users SET lastlogin = now() WHERE id = '${result[0].id}';`
                    );
                    return res.status(200).send({
                        message: "Logged in!!",
                        token,
                        user: result[0],
                    });
                } else {
                    return res.status(400).send({
                        message: "Username and Password incorrect! 2 "
                    });
                }
               

            });
    })
});

//http://localhost:3000/api/list-users
router.get('/list-users', userMiddleware.isLoggedIn, (req, res, next) => {
    const db_listUser = `SELECT * 
                         FROM data_test.users`;

    db.query(db_listUser, (err, result) => {
        if (err != null) {
            console.log("da vao here");

            return res.status(409).send({
                message: err.sqlMessage
            });
        }
        if (result != undefined && result.length != 0) {
            return res.status(200).send({
                result: result
            });

        }
    });
});

//http://localhost:3000/api/secret-route
router.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {

});

//http://localhost:3000/api/id-detail
router.get('/id-detail', (req, res, next) => {
    const id_detail = ` SELECT * 
                        FROM data_test.users 
                        WHERE id  = ${req.query.id}`
    db.query(id_detail, (err, result) => {
        if (err != null) {
            return res.status(409).send({
                message: err.sqlMessage
            });
        }
        if (result != undefined && result.length != 0) {
            return res.status(200).send({
                result: result
            });

        }
        if (result != req.query.id) {
            return res.status(409).send({
                message: 'ID incorrect'
            });
        }

    });
});


//http://localhost:3000/api/update
router.put('/update', userMiddleware.validateRegister, (req, res, next) => {
    const getUserSql = `SELECT id 
                        FROM data_test.users 
                        WHERE id  = ${req.query.id}`

    const updateUserSql = `UPDATE data_test.users 
                    SET usersname =' ${req.body.username} ', 
                        password = ' ${req.body.password} '
                    WHERE id = ${req.query.id} `
    const isTakenSql = `SELECT *
                        FROM data_test.users
                        WHERE usersname = '${req.body.username}'`
    db.query(isTakenSql, (err, result) => {
        console.log("err: ", err);
        console.log("result: ", result);

        if (err != null) {
            return res.status(409).send({
                message: err.sqlMessage
            })
        }
        if (result != undefined && result.length != 0) {
            return res.status(409).send({
                message: 'user name nay da ton tai'
            })
        } else {
            db.query(getUserSql, (err, result) => {
                if (err != null) {
                    return res.status(409).send({
                        message: err.sqlMessage
                    });
                }
                if (result[0] != undefined && result.length != 0) {
                    db.query(updateUserSql, (err, result) => {
                        if (err != null) {
                            return res.status(409).send({
                                message: err.sqlMessage
                            });
                        }
                        if (result != undefined && result.length != 0) {
                            return res.status(200).send({
                                message: 'Update successfully'
                            });
                        }
                    });

                }
                else {
                    return res.status(409).send({
                        message: 'ID incorrect'
                    });
                }

            });
        }
    })

});

  
    function decrypt(ciphertext, key, iv) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        let decryptedData = decipher.update(ciphertext, 'base64', 'utf8');
        decryptedData += decipher.final('utf8');
        return decryptedData;
    }

    

    function encrypt(text, key, iv) {
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        let encryptedData = cipher.update(text, 'utf8', 'base64');
        encryptedData += cipher.final('base64');
        return encryptedData;
      }
    
    router.post("/encrypt", function (req, res) {
        const username = req.body.username;
        const password = req.body.password;
    
        try {
            const key = crypto.randomBytes(32).toString('hex');
            const iv = crypto.randomBytes(16).toString('hex');
            const ciphertext = encrypt(password, key, iv);

            //=============================================================
           
            const sql = "INSERT INTO data_test.users(usersname,password,keyAES, iv, ciphertxt) VALUES (?, ?, ?, ?, ?)";
            db.query(sql, [username, password, key, iv, ciphertext], function (err, results) {
                if (err) {
                    console.error('Lỗi khi lưu vào database:', err);
                    return res.status(500).json({ error: "Lỗi khi lưu dữ liệu mã hóa" });
                }
                res.json({ 
                    message: "Dữ liệu đã được mã hóa và lưu thành công",
                    ciphertext, 
                    key, 
                    iv 
                });
            });
        } catch (error) {
            console.error('Lỗi khi mã hóa:', error);
            res.status(500).json({ error: "Lỗi khi mã hóa dữ liệu" });
        }
    });


    router.post('/dencrypt', (req, res) => {
        const { ciphertxt, key, iv } = req.body;

        try {
          const decryptedMessage = decrypt(ciphertxt, key, iv);
          res.json({ decryptedMessage });
        } catch (error) {
          res.status(400).json({ error: 'Decryption failed' });
        }
      })
    
    

      router.post("/users", function (req, res) {
        const { username, ciphertext, key, iv } = req.body;
        var sql = "INSERT INTO data_test.users (username, keyAES, iv, ciphertxt) VALUES (?, ?, ?, ?)";
        db.query(sql, [username, key, iv, ciphertext], function (err, results) {
            if (err) {
                console.error('Lỗi khi lưu người dùng:', err);
                res.status(500).json({ error: 'Lỗi khi lưu người dùng' });
            } else {
                res.json({ message: 'Người dùng đã được lưu thành công' });
            }
        });
    });
module.exports = router;
