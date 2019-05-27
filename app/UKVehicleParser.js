
const axios = require('axios');
const { get } = require('lodash');
const AWS = require('aws-sdk');

const CAR_URL = `https://uk1.ukvehicledata.co.uk/api/datapackage/VehicleData?v=2&api_nullitems=1&auth_apikey=${process.env.VDUK_API_KEY}&user_tag=&key_VRM=`;

const _getCarData = async (carReg) => await axios.get(CAR_URL + carReg);

module.exports = {
  getCar: async (carReg) => {
    const data = await _getCarData(carReg);
    const carData = get(data, 'data.Response.DataItems.TechnicalDetails', null);
    const carRegistration = get(data, 'data.Response.DataItems.VehicleRegistration', null);
  
    if (!carData || !carRegistration) throw 'Error getting car data';
  
    const make = carRegistration.Make;
    const model = carRegistration.Model;
  
    const FuelTankCapacity = carData.Dimensions.FuelTankCapacity;
    const combined = carData.Consumption.Combined.Mpg;
    const urban = carData.Consumption.UrbanCold.Mpg;
    const motorway = carData.Consumption.ExtraUrban.Mpg;
    const fuelType = carRegistration.FuelType;
    
    return {
      combined,
      urban,
      motorway,
      fuelTankCapacity,
      make,
      model,
      fuelType,
    };
  },
  getFuelPrice: async () => {
    return new Promise((resolve, reject) => {
      const s3 = new AWS.S3(
        // {
        //   credentials: {
        //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        //   }
        // }
        );
      s3.getObject({
        Bucket: 'int-fuel-cost',
        Key: 'costs.json',
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.Body.toString('utf-8')));
        }
      });
    });
  },
}