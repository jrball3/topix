const UserModel = require('../models/user')
const Passwords = require('../utilities/passwords')
const faker = require('faker')

module.exports = {
  createUser: function () {
    const password = faker.internet.password()
    return Passwords
      .hash(password)
      .then(hashedPassword => {
        const user = UserModel({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          username: faker.internet.userName(),
          passwordHash: hashedPassword
        })
        user.password = password
        return user
      })
      .then(model => {
        console.log(model)
        return model.save()
      })
  }
}
