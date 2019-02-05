import PasswordHash from '../utilities/passwords';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    username: DataTypes.STRING,
    display_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  User.authenticate = (username, password) => {
    User.findAll({ where: { username } }).then((user) => {
      if (user) return PasswordHash.compare(password, user.password);
      return False;
    });
  };
  return User;
};
