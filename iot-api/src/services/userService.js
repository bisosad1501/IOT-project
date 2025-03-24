import db from '../models/index';
const { Op, fn, col, where } = require('sequelize');



let Login = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {}
            let isExist = await checkUserEmail(email)
            if (isExist) {
                let user = await db.Users.findOne({
                    where: { email: email }
                })
                let check = password === user.password
                if (check) {
                    userData.errCode = 0
                    userData.message = `OK`
                    delete user.password;
                    let User = {
                        ...user.dataValues, // Sao chép dữ liệu
                        devicesOfUser: {}
                    };
                    user.deviceId.split(',').forEach(deviceId => {
                        User.devicesOfUser[deviceId] = {status : 'offline' };  // Mỗi deviceId sẽ là key, và value là đối tượng trống {}
                    });
                    console.log('USER Ở ĐÂY NÈ CHECK DI: ', user)
                    userData.user = User
                } else {
                    userData.errCode = 3
                    userData.message = `Wrong password`
                }
            } else {
                userData.errCode = 1
                userData.message = "Your email isn't exist in system. Plz try other one."
            }
            console.log(userData)
            resolve(userData)
        } catch (e) {
            reject(e)
        }
    })
}

let checkUserEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.Users.findOne({
                where: { email: email }
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    Login
}