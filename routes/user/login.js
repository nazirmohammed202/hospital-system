const router = require("express").Router();
const { validateLogin, User } = require("../../models/User");
const { routeHandler } = require("../../startup/expressMiddlewares");

//This route is used to login a user
router.post(
  "/",
  routeHandler(async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(404).send({ message: "Invalid email or password" });

    const validPassword = await user.validatePassword(req.body.password);

    if (!validPassword)
      return res.status(400).send({ message: "Invalid email or password" });

    const token = user.generateToken();

    res.status(200).send(token);
  })
);

module.exports = router;
