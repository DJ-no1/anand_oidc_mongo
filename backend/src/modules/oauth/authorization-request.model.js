import mongoose from "mongoose";

/**
 * Short-lived record while the user completes consent on the frontend (transaction_id).
 */
const authorizationRequestSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: { type: String, required: true },
    redirectUri: { type: String, required: true },
    state: { type: String, required: true },
    codeChallenge: { type: String, required: true },
    codeChallengeMethod: { type: String, default: "S256" },
    scope: { type: String, default: "openid" },
    nonce: { type: String },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export default mongoose.model("AuthorizationRequest", authorizationRequestSchema);
