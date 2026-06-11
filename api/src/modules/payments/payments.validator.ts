import { body, param, query, ValidationChain } from "express-validator";

export const initiatePaymentValidator: ValidationChain[] = [
  body("property_id")
    .optional()
    .isUUID()
    .withMessage("Invalid property ID"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 1 })
    .withMessage("Amount must be a positive number"),

  body("currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),

  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),

  body("type")
    .optional()
    .isIn(["FEATURED", "AGENT_FEATURE"])
    .withMessage("Type must be FEATURED or AGENT_FEATURE"),

  body("property_id")
    .if(body("type").equals("AGENT_FEATURE").not())
    .notEmpty()
    .withMessage("Property ID is required for FEATURED payment")
    .isUUID()
    .withMessage("Invalid property ID"),
];

export const paymentIdValidator: ValidationChain[] = [
  param("id")
    .isUUID()
    .withMessage("Invalid payment ID"),
];

export const paymentsListValidator: ValidationChain[] = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["PENDING", "CONFIRMED", "FAILED"])
    .withMessage("Status must be PENDING, CONFIRMED or FAILED"),

  query("property_id")
    .optional()
    .isUUID()
    .withMessage("Invalid property ID"),
];

export const confirmPaymentValidator: ValidationChain[] = [
  param("id")
    .isUUID()
    .withMessage("Invalid payment ID"),
];