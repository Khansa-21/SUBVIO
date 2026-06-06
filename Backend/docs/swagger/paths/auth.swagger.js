import {
  commonErrors,
  jsonBody,
  ok,
  tokenParam,
  created,
} from "../helpers.js";

export const authPaths = {
  "/auth/sign-up": {
    post: {
      tags: ["Auth"],
      summary: "Create a new user account",
      requestBody: jsonBody("#/components/schemas/SignupInput"),
      responses: {
        201: created("User created and auth cookie set", "#/components/schemas/AuthResponse"),
        400: commonErrors.BadRequest,
        409: commonErrors.Conflict,
        500: commonErrors.ServerError,
      },
    },
  },
  "/auth/log-in": {
    post: {
      tags: ["Auth"],
      summary: "Log in and set the auth cookie",
      requestBody: jsonBody("#/components/schemas/LoginInput"),
      responses: {
        200: ok("User logged in", "#/components/schemas/AuthResponse"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
  "/auth/sign-out": {
    post: {
      tags: ["Auth"],
      summary: "Clear the auth cookie",
      responses: {
        200: ok("Logged out", "#/components/schemas/MessageResponse"),
        500: commonErrors.ServerError,
      },
    },
  },
  "/auth/forgot-password": {
    post: {
      tags: ["Auth"],
      summary: "Send a password reset email if the account exists",
      requestBody: jsonBody("#/components/schemas/ForgotPasswordInput"),
      responses: {
        200: ok("Password reset response", "#/components/schemas/MessageResponse"),
        400: commonErrors.BadRequest,
        500: commonErrors.ServerError,
      },
    },
  },
  "/auth/reset-password/{token}": {
    get: {
      tags: ["Auth"],
      summary: "Verify a password reset token",
      parameters: [tokenParam],
      responses: {
        200: ok("Reset token is valid", "#/components/schemas/VerifyResetTokenResponse"),
        400: commonErrors.BadRequest,
        500: commonErrors.ServerError,
      },
    },
    post: {
      tags: ["Auth"],
      summary: "Reset password with a valid token",
      parameters: [tokenParam],
      requestBody: jsonBody("#/components/schemas/ResetPasswordInput"),
      responses: {
        200: ok("Password updated", "#/components/schemas/MessageResponse"),
        400: commonErrors.BadRequest,
        500: commonErrors.ServerError,
      },
    },
  },
};
