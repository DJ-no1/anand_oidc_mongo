import mongoose from "mongoose";

const oauthAccessTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: { type: String, required: true, index: true },
    scope: { type: String, default: "openid" },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export default mongoose.model("OAuthAccessToken", oauthAccessTokenSchema);
