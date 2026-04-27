import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class SuspendClientDto extends BaseDto {
  static schema = Joi.object({
    suspended: Joi.boolean().required(),
    suspendedReason: Joi.string().trim().max(500).allow("").optional(),
  });
}

export default SuspendClientDto;
