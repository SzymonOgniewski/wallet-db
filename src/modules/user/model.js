import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  balance: {
    type: Number,
    default: 0,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  validationToken: {
    type: String,
    default: null,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  refreshToken: {
    type: String,
    default: null,
  },
});
userSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(6));
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
export const User = model("user", userSchema);
