import mongoose from "mongoose";

const oauthAuditSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, index: true },
    clientId: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true },
);

oauthAuditSchema.index({ createdAt: 1 });

export default mongoose.model("OAuthAudit", oauthAuditSchema);
