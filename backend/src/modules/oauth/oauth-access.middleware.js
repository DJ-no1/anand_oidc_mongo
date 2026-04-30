import { hashToken } from "../../common/utils/crypto.utils.js";
import redis from "../../common/config/redis.js";

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
  
  const tokenJson = await redis.get(`access_token:${tokenHash}`);
  if (!tokenJson) {
    return res
      .status(401)
      .set("WWW-Authenticate", 'Bearer error="invalid_token"')
      .json({ error: "invalid_token", error_description: "Invalid or expired access token" });
  }
  const row = JSON.parse(tokenJson);
  req.oauth = {
    userId: row.userId,
    clientId: row.clientId,
    scope: row.scope,
  };
  return next();
};

export { authenticateOidcAccess };
