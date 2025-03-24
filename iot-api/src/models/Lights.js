'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lights extends Model {

  };
  Lights.init({
    lux: DataTypes.FLOAT,
    deviceId: DataTypes.STRING,
    time: DataTypes.TIME, 
    date: DataTypes.DATEONLY, 
  }, {
    sequelize,
    modelName: 'Lights',
    timestamps: false,
  });
  return Lights;
};