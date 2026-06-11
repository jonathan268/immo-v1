import { body, param, query, ValidationChain } from "express-validator";

export const updateProfileValidator: ValidationChain[] = [
  body("full_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("phone")
    .optional()
    .trim()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
];

export const changePasswordValidator: ValidationChain[] = [
  body("current_password")
    .notEmpty()
    .withMessage("Current password is required"),

  body("new_password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase, one lowercase and one number"
    ),

  body("confirm_password")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

export const getUserValidator: ValidationChain[] = [
  param("id")
    .isUUID()
    .withMessage("Invalid user ID"),
];

export const usersListValidator: ValidationChain[] = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("role")
    .optional()
    .isIn(["ADMIN", "OWNER", "TENANT"])
    .withMessage("Role must be ADMIN, OWNER, or TENANT"),

  query("is_suspended")
    .optional()
    .isIn(["true", "false"])
    .withMessage("is_suspended must be true or false"),
];