import { runAuthorize, exchangeToken, getUserinfo } from "./oauth.service.js";

const authorize = async (req, res) => {
  return runAuthorize(req, res);
};

const token = async (req, res) => {
  return exchangeToken(req, res);
};

const userinfo = async (req, res) => {
  return getUserinfo(req, res);
};

export { authorize, token, userinfo };
