'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {

  };
  Users.init({
    userId: {
      type: DataTypes.INTEGER, // Kiểu dữ liệu của userId
      primaryKey: true,        // Đặt userId là khóa chính
      autoIncrement: true,     // Tự động tăng giá trị userId
  },
    userName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    deviceId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Users',
    timestamps: false,
  });
  return Users;
};