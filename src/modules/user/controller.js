import * as userService from "./service.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import Joi from "joi";
import sgMail from "@sendgrid/mail";

import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SEND_GRID_PASSWORD);
const secret = process.env.SECRET;

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });
  const { error } = schema.validate({
    email: email,
    password: password,
  });
  if (error) return res.status(400).json(error.details[0].message);
  try {
    const user = await userService.findUserByEmail(email);
    if (!user || !user.validPassword(password)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Incorrect login or password",
        data: "Bad request",
      });
    }
    if (user.verify === false) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Email need verification, please check your email",
        data: "Bad request",
      });
    }
    const payload = {
      id: user.id,
      useremail: user.email,
      name: user.name,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    const refreshToken = nanoid();
    await userService.saveToken(user.id, token, refreshToken);
    res.json({
      status: "success",
      code: 200,
      data: {
        token,
        user: {
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const signup = async (req, res, next) => {
  const { email, password, name } = req.body;
  const pattern =
    "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp(pattern)).required(),
  });
  const { error } = schema.validate({
    name: name,
    email: email,
    password: password,
  });
  if (error) return res.status(400).json(error.details[0].message);
  try {
    const user = await userService.findUserByEmail(email);
    if (user) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email is already in use",
        data: "Conflict",
      });
    }
    const verificationToken = nanoid();
    const newUser = await userService.register(
      name,
      email,
      password,
      verificationToken
    );
    const { email: emailRegistered, name: nameRegistered } = newUser;
    const msg = {
      to: emailRegistered,
      from: "walletapphelper@gmail.com",
      subject: "WalletApp - Please Verify Your Account",
      html: `<p>Hello,</p><p>Thank you for signing up! Please click on the following link to verify your account:</p><p><a href="https://wallet-febk.onrender.com/api/users/verify/${verificationToken}">Verify</a></p><p>Best regards,</p><p>Contacts APP Team</p>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
        return res.json({
          status: "Internal Server Error",
          code: 500,
          ResponseBody: {
            message: "Email sent Error",
          },
        });
      });
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        user: {
          name: nameRegistered,
          email: emailRegistered,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  const id = req.user;
  try {
    await userService.saveToken(id, null);
    res.json({
      status: "success",
      code: 204,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const current = async (req, res, next) => {
  return res.json({
    status: "success",
    code: 200,
    data: {
      user: {
        name: req.user.name,
        email: req.user.email,
        balance: req.user.balance,
      },
    },
  });
};

export const verificationToken = async (req, res, next) => {
  const verificationToken = req.params.verificationToken;
  const schema = Joi.object({
    verificationToken: Joi.string().required(),
  });
  const { error } = schema.validate({
    verificationToken: verificationToken,
  });
  if (error) return res.status(400).json(error.details[0].message);
  try {
    const user = await userService.findUserByverificationTokenAndVerify(
      verificationToken
    );
    if (user) {
      return res.json({
        status: "success",
        code: 200,
        ResponseBody: {
          message: "Verification successful",
        },
      });
    }
    return res.status(401).json({
      status: "error",
      code: 401,
      ResponseBody: {
        message: "User not found",
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const verify = async (req, res, next) => {
  const { email } = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error } = schema.validate({
    email: email,
  });
  if (error) return res.status(400).json(error.details[0].message);
  try {
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "no user found",
        data: "Conflict",
      });
    }
    if (user.verify) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Verification has already been passed",
        data: "Conflict",
      });
    }
    const verificationToken = nanoid();
    await userService.findUserByEmailAndRenevToken(email, verificationToken);
    const msg = {
      to: email,
      from: "walletapphelper@gmail.com",
      subject: "Please Verify Your Account",
      html: `<p>Hello,</p><p>Thank you for signing up! Please click on the following link to verify your account:</p><p><a href="https://wallet-febk.onrender.com/api/users/verify/${verificationToken}">Verify</a></p><p>Best regards,</p><p>Contacts APP Team</p>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
        return res.json({
          status: "Internal Server Error",
          code: 500,
          ResponseBody: {
            message: "Email sent Error",
          },
        });
      });
    res.status(200).json({
      status: "success",
      code: 200,
      ResponseBody: {
        message: "Verification email sent",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error } = schema.validate({
    email: email,
  });
  if (error) return res.status(400).json(error.details[0].message);
  try {
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
        data: "Conflict",
      });
    }

    const resetToken = nanoid();
    await userService.updateUserResetToken(user.id, resetToken);
    const msg = {
      to: email,
      from: "walletapphelper@gmail.com",
      subject: "Password Reset",
      html: `<p>Hello,</p><p>You have requested to reset your password. Please click on the following link to reset your password:</p><p><a href="https://wallet-febk.onrender.com/api/reset-password/${resetToken}">Reset Password</a></p><p>Best regards,</p><p>Contacts APP Team</p>`,
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({
          status: "Internal Server Error",
          code: 500,
          ResponseBody: {
            message: "Email sent Error",
          },
        });
      });

    res.status(200).json({
      status: "success",
      code: 200,
      ResponseBody: {
        message: "Password reset email sent",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });

  try {
    await schema.validateAsync(req.body);
    const user = await userService.findUserByToken(token);
    if (!user) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid or expired reset token",
        data: "Conflict",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 6);

    await userService.updateUserPassword(user.id, hashedPassword);
    await userService.updateUserResetToken(user.id);

    res.status(200).json({
      status: "success",
      code: 200,
      ResponseBody: {
        message: "Password reset successful",
      },
    });
  } catch (error) {
    next(error);
  }
};
export const findUserRefreshToken = async (userId) => {
  try {
    const user = await userService.findUserByID({ _id: userId });
    if (user) {
      const refreshToken = user.refreshToken;
      return refreshToken;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error while reading user refreshToken:", error);
    throw error;
  }
};
export const saveRefreshToken = async (userId, refreshToken) => {
  try {
    const user = await userService.saveRefreshToken({
      _id: userId,
      refreshToken,
    });
    if (user) {
      return true;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error while reading user saverefreshToken:", error);
    throw error;
  }
};
