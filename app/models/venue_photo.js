'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue_Photo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Venue_Photo.belongsTo(models.Venue)
    }
  };
  Venue_Photo.init({
    VenueId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    filename: {
      allowNull: false,
      type: DataTypes.STRING
    },
    url: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Venue_Photo',
  });
  return Venue_Photo;
};