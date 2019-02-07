const moment = require('moment');
const bcrypt = require('bcrypt');

const password = bcrypt.hashSync('123456', 10);
const createdAt = moment('2018-01-07').format();
const updatedAt = createdAt;
const gender = 'Male';
module.exports = [
  {
    id: '4b134316-966b-47f8-bb47-2fb27a36b40c',
    firstName: 'Manzi',
    lastName: 'Manzi',
    username: 'manzi',
    email: 'manzi@email.com',
    password,
    gender,
    createdAt,
    updatedAt
  },
  {
    id: 'dfef16f9-11a7-4eae-9ba0-7038c6ccaa73',
    firstName: 'Christian',
    lastName: 'Christian',
    username: 'Christian',
    email: 'christian@email.com',
    password,
    gender,
    createdAt,
    updatedAt
  },
  {
    id: '09a0a74f-e2d0-4976-84bc-8118b0c3d86c',
    firstName: 'Caleb',
    lastName: 'Caleb',
    username: 'Caleb',
    email: 'caleb@email.com',
    password,
    gender,
    createdAt,
    updatedAt
  },
  {
    id: '4bab4fb6-531e-494f-826c-880e532f076b',
    firstName: 'Daniel',
    lastName: 'Daniel',
    username: 'Daniel',
    email: 'daniel@email.com',
    password,
    gender,
    createdAt,
    updatedAt
  },
  {
    id: 'd018c3b5-13c7-41c0-8b2c-4ec1cb6b21da',
    firstName: 'Olivier',
    lastName: 'olivier',
    username: 'Olivier',
    email: 'olivier@email.com',
    password,
    gender,
    createdAt,
    updatedAt
  }
];
