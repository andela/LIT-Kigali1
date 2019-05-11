import passport from 'passport';

const verifyJwt = ({
  tokenRequired = true,
  confirmEmail = false,
  access = ['admin', 'user']
} = {}) => (req, res, next) => {
  passport.authenticate('jwt', (err, user, info) => {
    if (err) {
      return res.status(520).send({ errors: { body: [err.message] } });
    }
    if (!user && tokenRequired) {
      const status = info.message === 'user does not exist' ? 404 : 401;
      return res.status(status).send({
        status,
        message: info.message
      });
    }

    if (user) {
      if (confirmEmail && user.confimed !== 'confirmed') {
        return res.status(401).json({ status: 401, message: 'Please confirm your email' });
      }
      req.currentUser = user;
    }
    if (access.length === 1 && access[0] === 'admin' && user.userType === 'user') {
      return res.status(401).send({
        status: 401,
        message: 'Not authorized'
      });
    }
    if (access.length === 1 && access[0] === 'user' && user.userType === 'admin') {
      return res.status(401).send({
        status: 401,
        message: 'Not authorized'
      });
    }
    if (access.length === 1 && access[0] === 'super-admin' && user.userType !== 'super-admin') {
      return res.status(401).send({
        status: 401,
        message: 'Not authorized'
      });
    }

    return next();
  })(req, res, next);
};

export default verifyJwt;
