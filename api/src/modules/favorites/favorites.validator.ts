import { param } from "express-validator";

export const propertyIdParamValidator = [
  param("propertyId").isUUID().withMessage("Invalid property ID"),
];