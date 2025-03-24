
import {Login} from '../services/userService'
import {userClients, publishToTopic, connectUser} from '../config/connectBroker'


let handleLogin = async (req, res) => {
    let email = req.body.email
    let password = req.body.password

    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing input parameter'
        })
    }

    let userData = await Login(email, password)
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.message,
        user: userData.user ? userData.user : {}
    })
}


let handleControl = async (req, res) => {
    let deviceId = req.query.deviceId
    let type = req.query.type 
    let status = req.query.status 
    if (!deviceId || !type || !status ) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing input parameter'
        })
    }

    publishToTopic(deviceId, type, status);

    return res.status(200).json({
        errCode: 0,
        errMessage: 'ok',
    })
}
module.exports = {
    handleLogin, handleControl
}