import * as oauthService from "./oauth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const getConsentContext = async (req, res) => {
  const q = req.query.transaction_id;
  const transactionId = Array.isArray(q) ? q[0] : q;
  const data = await oauthService.loadConsentContext(req.user.id, transactionId);
  ApiResponse.ok(res, "Consent context", data);
};

const postConsent = async (req, res) => {
  const data = await oauthService.completeConsent(
    req.user.id,
    req.body?.transaction_id,
    req.body?.decision,
  );
  ApiResponse.ok(res, data.message, { redirect_url: data.redirect_url });
};

export { getConsentContext, postConsent };
