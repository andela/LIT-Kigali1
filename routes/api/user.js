import express from 'express';
import passport from 'passport';
import { ProfileController } from '../../controllers';


const router = express.Router();

router.put('/', (req, res, next) => {
    passport.authenticate('jwt', (err, user, info) => {
      if (err) { return res.status(520).send({errors: {
        body:[err.message]
    }}); }
      if (!user) { const status = info.message === 'user does not exist'? 404:401;
      return res.status(status).send({ errors: {
          body: [info.message]
      }}); }
      req.logIn(user,{ session: false }, (err) => {
        if (err) { return res.status(520).send({errors: {
            body:[err.message]
        }}); }
        req.body.currentUser = user;
        return next();
      });
    })(req, res, next);
  }, ProfileController.createProfile);


export default router;