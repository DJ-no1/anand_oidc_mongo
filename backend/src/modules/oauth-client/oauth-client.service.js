import bcrypt from "bcryptjs";
import ApiError from "../../common/utils/api-error.js";
import { randomBase64Url } from "../../common/utils/crypto.utils.js";
import OAuthClient from "./oauth-client.model.js";

const makeClientId = () => {
  return `cl_${randomBase64Url(18).replace(/[^a-zA-Z0-9_-]/g, "")}`.slice(0, 40);
};

const makeClientSecret = () => randomBase64Url(48);

const create = async (ownerId, { clientName, redirectUris, description = "", logoUrl = "" }) => {
  const clientId = makeClientId();
  const rawSecret = makeClientSecret();
  const clientSecretHash = await bcrypt.hash(rawSecret, 12);

  await OAuthClient.create({
    clientId,
    clientSecretHash,
    clientName: clientName.trim(),
    redirectUris,
    description: String(description || "").trim().slice(0, 2000),
    logoUrl: String(logoUrl || "").trim().slice(0, 2048),
    ownerId,
  });

  return {
    clientId,
    clientSecret: rawSecret,
    clientName: clientName.trim(),
    redirectUris,
    description: String(description || "").trim(),
    logoUrl: String(logoUrl || "").trim(),
  };
};

const listByOwner = async (ownerId) => {
  return OAuthClient.find({ ownerId })
    .select("clientId clientName redirectUris description logoUrl suspended createdAt")
    .lean();
};

const findByClientId = async (clientId, { withSecret = false } = {}) => {
  const q = OAuthClient.findOne({ clientId });
  if (withSecret) q.select("+clientSecretHash");
  return q.lean();
};

const verifyClientSecret = async (client, plainSecret) => {
  if (!client?.clientSecretHash) return false;
  return bcrypt.compare(plainSecret, client.clientSecretHash);
};

const assertOwner = async (clientId, userId) => {
  const c = await OAuthClient.findOne({ clientId, ownerId: userId });
  if (!c) throw ApiError.forbidden("Not allowed to access this client");
  return c;
};

const getByOwner = async (ownerId, clientId) => {
  await assertOwner(clientId, ownerId);
  const doc = await OAuthClient.findOne({ clientId, ownerId })
    .select("clientId clientName redirectUris description logoUrl suspended createdAt updatedAt")
    .lean();
  if (!doc) throw ApiError.notFound("Client not found");
  return doc;
};

const updateByOwner = async (ownerId, clientId, body) => {
  await assertOwner(clientId, ownerId);
  const patch = {};
  if (body.clientName !== undefined) patch.clientName = String(body.clientName).trim();
  if (body.redirectUris !== undefined) patch.redirectUris = body.redirectUris;
  if (body.description !== undefined) patch.description = String(body.description).trim().slice(0, 2000);
  if (body.logoUrl !== undefined) patch.logoUrl = String(body.logoUrl).trim().slice(0, 2048);
  await OAuthClient.updateOne({ clientId, ownerId }, { $set: patch });
  return getByOwner(ownerId, clientId);
};

const rollSecretByOwner = async (ownerId, clientId) => {
  await assertOwner(clientId, ownerId);
  const rawSecret = makeClientSecret();
  const clientSecretHash = await bcrypt.hash(rawSecret, 12);
  await OAuthClient.updateOne({ clientId, ownerId }, { $set: { clientSecretHash } });
  return { clientId, clientSecret: rawSecret };
};

export {
  create,
  listByOwner,
  findByClientId,
  verifyClientSecret,
  assertOwner,
  getByOwner,
  updateByOwner,
  rollSecretByOwner,
};
