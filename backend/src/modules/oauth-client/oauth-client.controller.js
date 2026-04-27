import * as service from "./oauth-client.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const create = async (req, res) => {
  const data = await service.create(req.user.id, req.body);
  ApiResponse.created(
    res,
    "Client created. Store the client secret now — it will not be shown again.",
    data,
  );
};

const list = async (req, res) => {
  const data = await service.listByOwner(req.user.id);
  ApiResponse.ok(res, "OAuth clients", data);
};

const getOne = async (req, res) => {
  const data = await service.getByOwner(req.user.id, req.params.clientId);
  ApiResponse.ok(res, "OAuth client", data);
};

const update = async (req, res) => {
  const data = await service.updateByOwner(req.user.id, req.params.clientId, req.body);
  ApiResponse.ok(res, "Client updated", data);
};

const rollSecret = async (req, res) => {
  const data = await service.rollSecretByOwner(req.user.id, req.params.clientId);
  ApiResponse.ok(
    res,
    "New client secret issued. Copy it now — it will not be shown again.",
    data,
  );
};

export { create, list, getOne, update, rollSecret };
