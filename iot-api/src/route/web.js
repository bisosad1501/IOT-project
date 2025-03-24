import express from "express"
import {
    handleGetAllData, handleGetDataDay, handleGetDataWeek, handleGetDataMonth, handleGetLatestData
} from "../controllers/controller"
import {
    handleLogin, handleControl
} from "../controllers/userController"
import{getHomePage} from "../controllers/homeControler"


let router = express.Router()

let initWebRouter = (app) => {
    // homeController
    router.get('/', getHomePage)

    // Controller
    router.get('/api/get-all-data', handleGetAllData) 
    router.get('/api/get-data-day', handleGetDataDay) 
    router.get('/api/get-data-week', handleGetDataWeek) 
    router.get('/api/get-data-month', handleGetDataMonth) 
    router.get('/api/get-latest-data', handleGetLatestData);

    //userController
    router.post('/api/login', handleLogin)
    // light, toggle
    router.post('/api/control', handleControl)
    
    return app.use('/', router)
}

module.exports = initWebRouter