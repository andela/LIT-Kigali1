import passport from 'passport';

const verifyJwt = ({ tokenRequired = true, confirmEmail = false } = {}) => (req, res, next) => {
  passport.authenticate('jwt', (err, user, info) => {
    if (err) {
      return res.status(520).send({
        errors: {
          body: [err.message]
        }
      });
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

    return next();
  })(req, res, next);
};

export default verifyJwt;
