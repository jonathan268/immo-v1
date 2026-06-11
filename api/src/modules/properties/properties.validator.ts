import { body, param, query, ValidationChain } from "express-validator";

export const createPropertyValidator: ValidationChain[] = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),

  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("neighborhood")
    .trim()
    .notEmpty()
    .withMessage("Neighborhood is required"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),

  body("property_type")
    .notEmpty()
    .withMessage("Property type is required")
    .isIn(["MAISON", "BUREAU", "ENTREPOT", "LOCAL_COMMERCIAL", "TERRAIN"])
    .withMessage(
      "Property type must be one of: MAISON, BUREAU, ENTREPOT, LOCAL_COMMERCIAL, TERRAIN"
    ),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),

  body("size_m2")
    .notEmpty()
    .withMessage("Size is required")
    .isFloat({ min: 0 })
    .withMessage("Size must be a positive number"),
];

export const updatePropertyValidator: ValidationChain[] = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),

  body("country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Country cannot be empty"),

  body("city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City cannot be empty"),

  body("neighborhood")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Neighborhood cannot be empty"),

  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address cannot be empty"),

  body("property_type")
    .optional()
    .isIn(["MAISON", "BUREAU", "ENTREPOT", "LOCAL_COMMERCIAL", "TERRAIN"])
    .withMessage(
      "Property type must be one of: MAISON, BUREAU, ENTREPOT, LOCAL_COMMERCIAL, TERRAIN"
    ),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),

  body("size_m2")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Size must be a positive number"),
];

export const updatePropertyStatusValidator: ValidationChain[] = [
  param("id")
    .isUUID()
    .withMessage("Invalid property ID"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["APPROVED", "REJECTED"])
    .withMessage("Status must be APPROVED or REJECTED"),
];

export const propertyIdValidator: ValidationChain[] = [
  param("id")
    .isUUID()
    .withMessage("Invalid property ID"),
];

export const propertiesListValidator: ValidationChain[] = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("city")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("City must be between 1 and 100 characters"),

  query("neighborhood")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Neighborhood must be between 1 and 100 characters"),

  query("price_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("price_min must be a positive number"),

  query("price_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("price_max must be a positive number"),

  query("size_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("size_min must be a positive number"),

  query("size_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("size_max must be a positive number"),

  query("property_type")
    .optional()
    .isIn(["MAISON", "BUREAU", "ENTREPOT", "LOCAL_COMMERCIAL", "TERRAIN"])
    .withMessage("Invalid property type"),

  query("sort")
    .optional()
    .isIn(["price_asc", "price_desc", "newest"])
    .withMessage("Sort must be price_asc, price_desc or newest"),
];