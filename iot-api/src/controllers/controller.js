import { forEach } from 'lodash'
import {
    getAllData, updateRainData, updateLightData, updateAirData,
    getAllDataDay, getAllDataMonth, getAllDataWeek, getLatestData
} from '../services/service'


let handleGetAllData = async (req, res) => {
    let types = req.query.types
    let deviceId = req.query.deviceId

    let data = await getAllData(types, deviceId)
    console.log(data)
    return res.status(200).json({
        errCode: 0,
        errMessage: 'ok',
        data
    })
}

let handleGetDataDay = async (req, res) => {
    let types = req.query.types
    let day = req.query.day
    let deviceId = req.query.deviceId
    
    let data = await getAllDataDay(types, day, deviceId)
    console.log(data)
    return res.status(200).json({
        errCode: 0,
        errMessage: 'ok',
        data
    })
}


let handleGetDataWeek = async (req, res) => {
    try {
        let types = req.query.types;
        let dates = req.query.date.split(',').map(date => date.trim()); 
        let deviceId = req.query.deviceId;

        if (!types || !dates || !deviceId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing required parameters'
            });
        }

        const validDates = dates.every(date => {
            const d = new Date(date);
            return d instanceof Date && !isNaN(d);
        });

        if (!validDates) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Invalid date format'
            });
        }

        let data = await getAllDataWeek(types, dates, deviceId);
        
        return res.status(200).json({
            errCode: 0,
            errMessage: 'ok',
            data
        });
    } catch (error) {
        console.error('Error in handleGetDataWeek:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error',
            error: error.message
        });
    }
};

let handleGetDataMonth = async (req, res) => {
    try {
        let types = req.query.types;
        let month = req.query.month;
        let year = req.query.year;
        let deviceId = req.query.deviceId;

        if (!types || !month || !year || !deviceId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing required parameters'
            });
        }


        let data = await getAllDataMonth(types, month, year, deviceId);
        
        return res.status(200).json({
            errCode: 0,
            errMessage: 'ok',
            data
        });
    } catch (error) {
        console.error('Error in handleGetDataMonth:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error',
            error: error.message
        });
    }
}


let handleUpdateDate = async (data) => {
    let message = data.type == "air" ? await updateAirData(data.mqttData) :
        data.type == "light" ? await updateLightData(data.mqttData) : await updateRainData(data.mqttData)
    console.log(message)
}


let handleGetLatestData = async (req, res) => {
    let types = req.query.types;
    let deviceId = req.query.deviceId;

    if (!types || !deviceId) {
        return res.status(400).json({
            errCode: 1,
            errMessage: 'Missing types or deviceId parameter'
        });
    }

    try {
        let data = await getLatestData(types, deviceId);
        return res.status(200).json({
            errCode: 0,
            errMessage: 'ok',
            data
        });
    } catch (error) {
        return res.status(500).json({
            errCode: -1,
            errMessage: error.message || 'Server error'
        });
    }
};

module.exports = {
    handleGetAllData, handleUpdateDate, handleGetDataDay, handleGetDataWeek,
    handleGetDataMonth,  handleGetLatestData
}