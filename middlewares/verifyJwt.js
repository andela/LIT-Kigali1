import passport from 'passport';

const verifyJwt = (req,res,next) => {
  passport.authenticate('jwt', (err, user, info) => {
      if (err) { return res.status(520).send({errors: {
        body:[err.message]
    }}); }
      if (!user) { const status = info.message === 'user does not exist'? 404:401;
      return res.status(status).send({ errors: {
          body: [info.message]
      }}); }
        req.currentUser = user;
        return next();
    })(req, res, next);
}

export default verifyJwt;
