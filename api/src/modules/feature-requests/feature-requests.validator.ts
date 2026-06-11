import { body, param, query, ValidationChain } from 'express-validator';

export const createFeatureRequestValidator: ValidationChain[] = [
  body('target')
    .notEmpty()
    .withMessage('Target is required')
    .isIn(['AGENT', 'PROPERTY'])
    .withMessage('Target must be either AGENT or PROPERTY'),

  body('target_id')
    .notEmpty()
    .withMessage('Target ID is required')
    .isUUID()
    .withMessage('Target ID must be a valid UUID'),

  body('reason')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
];

export const featureRequestIdValidator: ValidationChain[] = [
  param('id').isUUID().withMessage('ID must be a valid UUID'),
];

export const approveFeatureRequestValidator: ValidationChain[] = [
  param('id').isUUID().withMessage('ID must be a valid UUID'),
];

export const rejectFeatureRequestValidator: ValidationChain[] = [
  param('id').isUUID().withMessage('ID must be a valid UUID'),

  body('rejection_reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Rejection reason must be between 5 and 500 characters'),
];

export const featureRequestsListValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED'])
    .withMessage('Status must be PENDING, APPROVED, or REJECTED'),

  query('target')
    .optional()
    .isIn(['AGENT', 'PROPERTY'])
    .withMessage('Target must be AGENT or PROPERTY'),
];

export const myFeatureRequestsValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED'])
    .withMessage('Status must be PENDING, APPROVED, or REJECTED'),

  query('target')
    .optional()
    .isIn(['AGENT', 'PROPERTY'])
    .withMessage('Target must be AGENT or PROPERTY'),
];
