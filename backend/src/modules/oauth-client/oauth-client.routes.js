import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import validate from "../../common/middleware/validate.middleware.js";
import CreateClientDto from "./dto/create-client.dto.js";
import UpdateClientDto from "./dto/update-client.dto.js";
import * as controller from "./oauth-client.controller.js";

const router = Router();

router.post("/", authenticate, validate(CreateClientDto), controller.create);
router.get("/", authenticate, controller.list);
router.get("/:clientId", authenticate, controller.getOne);
router.patch("/:clientId", authenticate, validate(UpdateClientDto), controller.update);
router.post("/:clientId/roll-secret", authenticate, controller.rollSecret);

export default router;
