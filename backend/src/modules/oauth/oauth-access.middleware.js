import { hashToken } from "../../common/utils/crypto.utils.js";
import OAuthAccessToken from "./oauth-access-token.model.js";

const authenticateOidcAccess = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res
      .status(401)
      .set("WWW-Authenticate", 'Bearer error="invalid_token"')
      .json({ error: "invalid_token", error_description: "Missing or invalid access token" });
  }
  const token = auth.slice(7);
  const tokenHash = hashToken(token);
  const row = await OAuthAccessToken.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });
  if (!row) {
    return res
      .status(401)
      .set("WWW-Authenticate", 'Bearer error="invalid_token"')
      .json({ error: "invalid_token", error_description: "Invalid or expired access token" });
  }
  req.oauth = {
    userId: row.userId,
    clientId: row.clientId,
    scope: row.scope,
  };
  return next();
};

export { authenticateOidcAccess };
