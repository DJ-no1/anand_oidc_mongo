import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class UpdateClientDto extends BaseDto {
  static schema = Joi.object({
    clientName: Joi.string().trim().min(1).max(120),
    redirectUris: Joi.array().items(Joi.string().uri()).min(1),
    description: Joi.string().trim().max(2000).allow(""),
    logoUrl: Joi.string().uri().allow(""),
  })
    .or("clientName", "redirectUris", "description", "logoUrl")
    .messages({
      "object.missing": "Provide at least one of: clientName, redirectUris, description, logoUrl",
    });
}

export default UpdateClientDto;
