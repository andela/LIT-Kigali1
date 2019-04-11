const moment = require('moment');
const bcrypt = require('bcrypt');

const password = bcrypt.hashSync('123456', 10);
const createdAt = moment('2018-01-07').format();
const updatedAt = createdAt;
const gender = 'Male';
const userType = 'user';
module.exports = [
  {
    id: 'f1541522-ec9c-48a1-9414-1e26587c56e8',
    firstName: 'Rose',
    lastName: 'Maina',
    username: 'rose.maina',
    email: 'rose.maina@email.com',
    confirmed: 'confirmed',
    password,
    gender,
    userType,
    createdAt,
    updatedAt
  },
  {
    id: '0855528e-35fe-4b1f-bf2b-4882ad361577',
    firstName: 'Grace',
    lastName: 'Kimotho',
    username: 'grace.kimotho',
    email: 'grace.kimotho@email.com',
    confirmed: 'confirmed',
    password,
    gender,
    userType,
    createdAt,
    updatedAt
  },
  {
    id: '4b134316-966b-47f8-bb47-2fb27a36b40c',
    firstName: 'Fabrice',
    lastName: 'Manzi',
    username: 'manzi',
    email: 'manzi@email.com',
    confirmed: 'confirmed',
    password,
    gender,
    userType,
    createdAt,
    updatedAt
  },
  {
    id: 'dfef16f9-11a7-4eae-9ba0-7038c6ccaa73',
    firstName: 'Christian',
    lastName: 'Rene',
    username: 'christian',
    email: 'christian@email.com',
    confirmed: 'confirmed',
    password,
    gender,
    userType,
    createdAt,
    updatedAt
  },
  {
    id: '09a0a74f-e2d0-4976-84bc-8118b0c3d86c',
    firstName: 'Caleb',
    lastName: 'Mugisha',
    username: 'caleb',
    email: 'caleb@email.com',
    confirmed: 'confirmed',
    password,
    gender,
    userType,
    createdAt,
    updatedAt
  },
  {
    id: '4bab4fb6-531e-494f-826c-880e532f076b',
    firstName: 'Daniel',
    lastName: 'Nziranziza',
    username: 'daniel',
    email: 'daniel@email.com',
    confirmed: 'confirmed',
    password,
    gender,
    userType,
    createdAt,
    updatedAt
  },
  {
    id: 'd018c3b5-13c7-41c0-8b2c-4ec1cb6b21da',
    firstName: 'Olivier',
    lastName: 'Esuka',
    username: 'olivier',
    email: 'olivier@email.com',
    confirmed: 'confirmed',
    password,
    gender,
    userType,
    createdAt,
    updatedAt
  },
  {
    id: 'cfb94dfa-a03b-4fc2-9e08-376681707418',
    firstName: 'Admin',
    lastName: 'admin',
    username: 'admin',
    email: 'admin@email.com',
    confirmed: 'confirmed',
    userType: 'admin',
    password,
    gender,
    createdAt,
    updatedAt
  }
];
