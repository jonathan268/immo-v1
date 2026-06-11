import { body, param, query, ValidationChain } from 'express-validator';

export const createInquiryValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('phone_number')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
];

export const inquiryIdValidator: ValidationChain[] = [
  param('id').isUUID().withMessage('Invalid inquiry ID'),
];

export const propertyIdParamValidator: ValidationChain[] = [
  param('propertyId').isUUID().withMessage('Invalid property ID'),
];

export const inquiriesListValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('property_id').optional().isUUID().withMessage('Invalid property ID'),
];
