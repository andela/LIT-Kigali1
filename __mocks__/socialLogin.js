const socialLogin = async (req, res) =>
  res.status(200).json({
    status: 200,
    user: req.user
  });

export default socialLogin;
