'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Venue.belongsTo(models.Vendor)
      Venue.hasMany(models.Venue_Photo)
      Venue.hasMany(models.Document)
    }
  };
  Venue.init({
    VendorId: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull:false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull:false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    city: {
      type: DataTypes.STRING,
      allowNull:false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull:false
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull:false
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull:false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};