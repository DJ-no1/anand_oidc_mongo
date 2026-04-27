import * as adminService from "./admin.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const stats = async (req, res) => {
  const data = await adminService.getStats();
  ApiResponse.ok(res, "Admin stats", data);
};

const listApps = async (req, res) => {
  const data = await adminService.listAllClients();
  ApiResponse.ok(res, "All OAuth clients", data);
};

const getApp = async (req, res) => {
  const data = await adminService.getClientByIdAdmin(req.params.clientId);
  ApiResponse.ok(res, "OAuth client", data);
};

const patchApp = async (req, res) => {
  const data = await adminService.setClientSuspended(req.params.clientId, req.body);
  ApiResponse.ok(res, "Client updated", data);
};

const listUsers = async (req, res) => {
  const data = await adminService.listUsers(req.query.page, req.query.limit);
  ApiResponse.ok(res, "Users", data);
};

const userAuthorizedApps = async (req, res) => {
  const data = await adminService.listUserAuthorizedApps(req.params.userId);
  ApiResponse.ok(res, "Authorized apps", data);
};

const revokeConsent = async (req, res) => {
  const data = await adminService.revokeUserConsent(req.params.userId, req.params.clientId);
  ApiResponse.ok(res, "Consent and tokens revoked for this app", data);
};

export { stats, listApps, getApp, patchApp, listUsers, userAuthorizedApps, revokeConsent };
