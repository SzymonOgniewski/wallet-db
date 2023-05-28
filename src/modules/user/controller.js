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
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await userService.saveToken(user.id, token);
    res.json({
      status: "success",
      code: 200,
      data: {
        token,
        user: {
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
      email,
      password,
      verificationToken
    );
    const { email: emailRegistered } = newUser;
    const msg = {
      to: emailRegistered,
      // from: "contactsapp@op.pl",
      from: "szymonogniewski00@gmail.com",
      subject: "Please Verify Your Account",
      html: `<p>Hello,</p><p>Thank you for signing up! Please click on the following link to verify your account:</p><p><a href="http://localhost:3000/api/users/verify/${verificationToken}">Verify</a></p><p>Best regards,</p><p>Contacts APP Team</p>`,
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
  console.log(req.user);
  return res.json({
    status: "success",
    code: 200,
    data: {
      user: {
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

export const verifiy = async (req, res, next) => {
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
      from: "contactsapp@op.pl",
      subject: "Please Verify Your Account",
      html: `<p>Hello,</p><p>Thank you for signing up! Please click on the following link to verify your account:</p><p><a href="http://localhost:3000/api/users/verify/${verificationToken}">Verify</a></p><p>Best regards,</p><p>Contacts APP Team</p>`,
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
