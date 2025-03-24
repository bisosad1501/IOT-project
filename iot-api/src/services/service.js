import db from '../models/index';
const { Op, fn, col, where } = require('sequelize');


// air service
let updateAirData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.a || !data.time || !data.date || !data.deviceId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing input parameter!`
                })
            } else {
                await db.Airs.create({
                    ppm: Number(data.a),
                    deviceId: data.deviceId,
                    time: data.time,
                    date: data.date,
                })

                resolve({
                    errCode: 0,
                    errMessage: `ok`
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
// light service
let updateLightData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.a || !data.time || !data.date || !data.deviceId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing input parameter!`
                })
            } else {
                await db.Lights.create({
                    lux: Number(data.a),
                    deviceId: data.deviceId,
                    time: data.time,
                    date: data.date,
                })

                resolve({
                    errCode: 0,
                    errMessage: `ok`
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
// rain service
let updateRainData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.a || !data.time || !data.date || !data.deviceId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing input parameter!`
                })
            } else {
                await db.Rains.create({
                    status: Number(data.a),
                    deviceId: data.deviceId,
                    time: data.time,
                    date: data.date,
                })

                resolve({
                    errCode: 0,
                    errMessage: `ok`
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
// get all data for each type
let getAllData = (types, deviceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let datas = null
            if (!types || !deviceId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing input parameter!`
                })
            } else {
                let model = types == "air" ? db.Airs :
                    types == "light" ? db.Lights : db.Rains
                datas = await model.findAll({ where: { deviceId: deviceId } });
            }
            resolve(datas)
        } catch (e) {
            reject(e)
        }
    })
}

let getAllDataDay = (types, day, deviceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let datas = null
            if (!types || !day || !deviceId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing input parameter!`
                })
            } else {
                let model = types == "air" ? db.Airs :
                    types == "light" ? db.Lights : db.Rains

                datas = await model.findAll({
                    where: {
                        date: day,
                        deviceId: deviceId
                    }
                });
            }

            let value = types == "air" ? "ppm" :
            types == "light" ? "lux" : "status";

            let groupedData = datas.reduce((acc, data) => {
                let hour = data.time.split(':')[0]; 
                if (!acc[hour]) acc[hour] = [];
                acc[hour].push(data[value]); 
                return acc;
            }, {});

            let averagedData = Object.keys(groupedData).map(hour => {
                let values = groupedData[hour];
                let average = values.reduce((sum, value) => sum + value, 0) / values.length;
                average = Math.ceil(average * 100) / 100; 
                return {
                    hour, 
                    average: average
                };
            });
            resolve(
                averagedData
            )
        } catch (e) {
            reject(e)
        }
    })
}

let getAllDataMonth = (types, month, year, deviceId) => { 
    return new Promise(async (resolve, reject) => {
        try {
            if (!types || !month || !year || !deviceId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing input parameter!`
                });
                return;
            }

            let model = types === "air" ? db.Airs :
                        types === "light" ? db.Lights : db.Rains;

            const datas = await model.findAll({
                where: {
                    [Op.and]: [
                        where(fn('MONTH', col('date')), month), 
                        where(fn('YEAR', col('date')), year),    
                    ],
                    deviceId: deviceId
                },
                order: [['date', 'ASC']]
            });

            let value = types === "air" ? "ppm" :
                        types === "light" ? "lux" : "status";

            let dailyAverages = {};
            datas.forEach(data => {
                const day = data.date;
                if (!dailyAverages[day]) {
                    dailyAverages[day] = [];
                }
                dailyAverages[day].push(Number(data[value]));
            });

            let processedData = Object.keys(dailyAverages).map(day => {
                const dayData = dailyAverages[day];
                const sum = dayData.reduce((acc, curr) => acc + curr, 0);
                
                if (types !== 'rain') {
                    const average = Math.round((sum / dayData.length) * 100) / 100;
                    return {
                        date: day,
                        average: average
                    };
                } else {
                    return {
                        date: day,
                        average: sum
                    };
                }
            });

            const totalSum = processedData.reduce((acc, curr) => acc + curr.average, 0);
            const overallAverage = processedData.length > 0 ? Math.round((totalSum / processedData.length) * 100) / 100 : 0;

            resolve({
                errCode: 0,
                errMessage: 'ok',
                averagedData: processedData,
                overallAverage: overallAverage
            });

        } catch (e) {
            console.error('Error in getAllDataMonth:', e);
            reject(e);
        }
    });
};

let getAllDataWeek = (types, days, deviceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!types || !days || !deviceId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing input parameter!`
                });
                return;
            }

            let model = types == "air" ? db.Airs :
                       types == "light" ? db.Lights : db.Rains;

            const datas = await model.findAll({
                where: {
                    date: {
                        [Op.in]: days
                    },
                    deviceId: deviceId
                },
                order: [['date', 'ASC'], ['time', 'ASC']]
            });

            let value = types == "air" ? "ppm" :
                       types == "light" ? "lux" : "status";

            let processedData = days.map(date => {
                const dayData = datas.filter(d => d.date === date);
                
                if (dayData.length === 0) {
                    return {
                        date: date,
                        average: 0
                    };
                }
                const sum = dayData.reduce((acc, curr) => acc + Number(curr[value]), 0);

                if(types !== 'rain'){
                    const average = Math.round((sum / dayData.length) * 100) / 100;    
                    return {
                        date: date,
                        average: average
                    };
                }
                else{
                    return{
                        date: date,
                        average: sum
                    }
                }               
            });

            resolve({
                errCode: 0,
                errMessage: 'ok',
                averagedData: processedData
            });

        } catch (e) {
            console.error('Error in getAllDataWeek:', e);
            reject(e);
        }
    });
};


let averageDataInDay = (datas, value) => {
    let groupedData = datas.reduce((acc, data) => {
        let date = data.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(data[value]);
        return acc;

    }, {});

    let averagedData = Object.keys(groupedData).map(date => {
        let values = groupedData[date];
        let average = values.reduce((sum, value) => sum + value, 0) / values.length;
        average = Math.ceil(average * 100) / 100
        return {
            date: date,
            average: average
        };
    });
    return averagedData;
}

let getLatestData = (types, deviceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!types || !deviceId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing input parameter!`
                });
            } else {
                let model = types === "air" ? db.Airs :
                            types === "light" ? db.Lights : db.Rains;

                let latestData = await model.findAll({
                    where: { deviceId: deviceId },
                    order: [['date', 'DESC'], ['time', 'DESC']], 
                    limit: 1 
                });

                resolve({
                    errCode: 0,
                    errMessage: 'ok',
                    data: latestData
                });
            }
        } catch (e) {
            reject(e);
        }
    });
}


module.exports = {
    getAllData, updateRainData, updateLightData, updateAirData,
    getAllDataDay, getAllDataMonth, getAllDataWeek, getLatestData
}