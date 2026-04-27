import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

/** Self-service registration must not create admins in production. */
const allowPrivilegedSelfRegister =
  process.env.NODE_ENV !== "production" &&
  process.env.ALLOW_REGISTER_ADMIN_ROLES === "true";

const REGISTER_ROLES = allowPrivilegedSelfRegister
  ? ["customer", "seller", "admin", "support"]
  : ["customer", "seller"];

class RegisterDto extends BaseDto {
  static schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string()
      .min(8)
      .pattern(/(?=.*[A-Z])(?=.*\d)/)
      .message(
        "Password must contain at least one uppercase letter and one digit",
      )
      .required(),
    role: Joi.string()
      .valid(...REGISTER_ROLES)
      .default("customer")
      .messages({
        "any.only": `role must be one of: ${REGISTER_ROLES.join(", ")}. In production, only customer/seller are allowed; grant admin with backend script promote:admin.`,
      }),
    termsAccepted: Joi.boolean().valid(true).required(),
    country: Joi.string().trim().length(2).uppercase().allow("").optional(),
  });
}

export default RegisterDto;
