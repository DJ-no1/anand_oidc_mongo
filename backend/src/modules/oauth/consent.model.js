import mongoose from "mongoose";

const consentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: { type: String, required: true, index: true },
    scope: { type: String, default: "openid" },
  },
  { timestamps: true },
);

consentSchema.index({ userId: 1, clientId: 1 }, { unique: true });

export default mongoose.model("OAuthConsent", consentSchema);
