import { User } from "./model.js";

export const findUserByEmail = (email) => {
  return User.findOne({ email });
};

export const findUserByverificationTokenAndVerify = (verificationToken) => {
  return User.findOneAndUpdate(
    { verificationToken },
    { verificationToken: null, verify: true },

    {
      new: true,
    }
  );
};

export const findUserByEmailAndRenevToken = (email, verificationToken) => {
  return User.findOneAndUpdate(
    { email },
    { verificationToken: verificationToken }
  );
};

export const findUserByID = (id) => {
  return User.findOne({ _id: id });
};

export const findUserByToken = (token) => {
  return User.findOne({ token });
};

export const saveToken = (id, token, refreshToken) => {
  return User.findOneAndUpdate(
    { _id: id },
    { validationToken: token, refreshToken: refreshToken }
  );
};

export const register = (name, email, password, verificationToken) => {
  const newUser = new User({ name, email, password, verificationToken });
  newUser.setPassword(password);
  return newUser.save();
};
export const updateUserResetToken = (id, token = null) => {
  return User.findOneAndUpdate({ _id: id }, { token: token });
};
export const updateUserPassword = (id, password) => {
  return User.findOneAndUpdate({ _id: id }, { password: password });
};
export const saveRefreshToken = (id, refreshToken) => {
  return User.findOneAndUpdate({ _id: id }, { refreshToken: refreshToken });
};
