import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class ConsentDecisionDto extends BaseDto {
  static schema = Joi.object({
    transaction_id: Joi.string().trim().min(8).max(128).required(),
    decision: Joi.string().trim().valid("allow", "deny", "Allow", "Deny").required(),
  });
}

export default ConsentDecisionDto;
