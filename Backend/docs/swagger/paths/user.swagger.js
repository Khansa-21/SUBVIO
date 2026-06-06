import { authSecurity, commonErrors, jsonBody, ok } from "../helpers.js";

export const userPaths = {
  "/users/me": {
    get: {
      tags: ["Users"],
      summary: "Get the logged-in user's profile",
      security: authSecurity,
      responses: {
        200: ok("Current user profile", "#/components/schemas/UserEnvelope"),
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
    patch: {
      tags: ["Users"],
      summary: "Update the logged-in user's profile",
      security: authSecurity,
      requestBody: jsonBody("#/components/schemas/UpdateProfileInput"),
      responses: {
        200: ok("Updated user profile", "#/components/schemas/UserEnvelope"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Delete the logged-in user's account",
      security: authSecurity,
      responses: {
        200: ok("Account deleted", "#/components/schemas/MessageResponse"),
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
  "/users/me/password": {
    patch: {
      tags: ["Users"],
      summary: "Change the logged-in user's password",
      security: authSecurity,
      requestBody: jsonBody("#/components/schemas/ChangePasswordInput"),
      responses: {
        200: ok("Password updated", "#/components/schemas/MessageResponse"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
};
