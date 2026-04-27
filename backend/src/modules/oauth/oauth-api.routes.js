import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import validate from "../../common/middleware/validate.middleware.js";
import ConsentDecisionDto from "./dto/consent-decision.dto.js";
import * as consentCtrl from "./oauth-consent.controller.js";

const router = Router();

router.get("/consent/context", authenticate, consentCtrl.getConsentContext);
router.post("/consent", authenticate, validate(ConsentDecisionDto), consentCtrl.postConsent);

export default router;
