const response = user => [
  {
    statusCode: 202,
    from: user.from,
  },
];
const sendEmailConfirmationLink = user => new Promise(resolve => resolve(response(user)));

const resetPasswordEmail = user => new Promise(resolve => resolve(response(user)));

const newPasswordEmail = user => new Promise(resolve => resolve(response(user)));

const sendEmailVerified = user => new Promise(resolve => resolve(response(user)));

export { sendEmailConfirmationLink, resetPasswordEmail, newPasswordEmail, sendEmailVerified };
