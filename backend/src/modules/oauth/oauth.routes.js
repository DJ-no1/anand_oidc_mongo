import { Router } from "express";
import { tryAttachUser } from "../auth/auth.middleware.js";
import { authenticateOidcAccess } from "./oauth-access.middleware.js";
import * as oidc from "./oidc-discovery.controller.js";
import * as ctrl from "./oauth.controller.js";

const router = Router();

router.get("/jwks", oidc.getJwks);
router.get("/authorize", tryAttachUser, ctrl.authorize);
router.post("/token", ctrl.token);
router.get("/userinfo", authenticateOidcAccess, ctrl.userinfo);

export default router;
