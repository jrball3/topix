const faker = require('faker')

module.exports = {
  mockUserDetails: function () {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: faker.internet.password()
    }
  }
}
