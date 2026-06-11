import { param, body, ValidationChain } from "express-validator";

export const propertyIdValidator: ValidationChain[] = [
  param("propertyId")
    .isUUID()
    .withMessage("Invalid property ID"),
];

export const imageIdValidator: ValidationChain[] = [
  param("propertyId")
    .isUUID()
    .withMessage("Invalid property ID"),

  param("imageId")
    .isUUID()
    .withMessage("Invalid image ID"),
];

export const reorderImagesValidator: ValidationChain[] = [
  param("propertyId")
    .isUUID()
    .withMessage("Invalid property ID"),

  body("images")
    .isArray({ min: 1 })
    .withMessage("Images must be a non-empty array"),

  body("images.*.id")
    .isUUID()
    .withMessage("Each image must have a valid UUID"),

  body("images.*.order")
    .isInt({ min: 0 })
    .withMessage("Each image must have a valid order (positive integer)"),
];