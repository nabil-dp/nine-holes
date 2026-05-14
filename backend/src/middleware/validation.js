const { validate, registerSchema, loginSchema, updateUserSchema, startGameSchema, placeBallSchema, moveBallSchema, sendInviteSchema } = require('../utils/validators');

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateUpdateUser: validate(updateUserSchema),
  validateStartGame: validate(startGameSchema),
  validatePlaceBall: validate(placeBallSchema),
  validateMoveBall: validate(moveBallSchema),
  validateSendInvite: validate(sendInviteSchema),
};
