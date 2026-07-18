import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Not required: Google-only accounts won't have a password
    passwordHash: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "provider"],
      required: true,
      default: "user",
    },
    // Optional, useful once you add provider verification/branding later
    brandName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Never leak the password hash to the client
userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    brandName: this.brandName,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
