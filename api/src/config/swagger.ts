import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Immo Platform API',
      version: '1.0.0',
      description:
        'API REST pour la plateforme digitale de location immobilière. Gestion des annonces, utilisateurs, demandes de contact et paiements.',
      contact: {
        name: 'Immo Platform',
        email: 'support@immo-platform.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}/api/v1`,
        description: 'Serveur de développement',
      },
      {
        url: 'https://immo-1-uu6j.onrender.com/api/v1',
        description: 'Serveur de production',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre access token JWT',
        },
      },
      schemas: {
        // ─── Common ───────────────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' },
                },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'array', items: { type: 'object' } },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 100 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 10 },
              },
            },
          },
        },
        // ─── Auth ─────────────────────────────────────────────────────────
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              example: 'a1b2c3d4e5f6...',
            },
          },
        },
        RegisterDto: {
          type: 'object',
          required: ['full_name', 'email', 'phone', 'password', 'confirm_password'],
          properties: {
            full_name: { type: 'string', example: 'Jonathan Dev' },
            email: {
              type: 'string',
              format: 'email',
              example: 'jonathan@example.com',
            },
            phone: { type: 'string', example: '+237612345678' },
            password: { type: 'string', example: 'Password123' },
            confirm_password: { type: 'string', example: 'Password123' },
            role: {
              type: 'string',
              enum: ['OWNER', 'TENANT'],
              example: 'OWNER',
            },
          },
        },
        LoginDto: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'jonathan@example.com',
            },
            password: { type: 'string', example: 'Password123' },
          },
        },
        RefreshDto: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'a1b2c3d4e5f6...' },
          },
        },
        // ─── User ─────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            full_name: { type: 'string', example: 'Jonathan Dev' },
            email: {
              type: 'string',
              format: 'email',
              example: 'jonathan@example.com',
            },
            phone: { type: 'string', example: '+237612345678' },
            role: {
              type: 'string',
              enum: ['ADMIN', 'OWNER', 'TENANT'],
              example: 'OWNER',
            },
            is_verified: { type: 'boolean', example: false },
            is_suspended: { type: 'boolean', example: false },
            is_featured: { type: 'boolean', example: false },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        UpdateProfileDto: {
          type: 'object',
          properties: {
            full_name: { type: 'string', example: 'Jonathan Updated' },
            phone: { type: 'string', example: '+237698765432' },
          },
        },
        ChangePasswordDto: {
          type: 'object',
          required: ['current_password', 'new_password', 'confirm_password'],
          properties: {
            current_password: { type: 'string', example: 'OldPassword123' },
            new_password: { type: 'string', example: 'NewPassword123' },
            confirm_password: { type: 'string', example: 'NewPassword123' },
          },
        },
        // ─── Property ─────────────────────────────────────────────────────
        Property: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            owner_id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Belle villa à Bastos' },
            description: {
              type: 'string',
              example: 'Superbe villa moderne avec piscine',
            },
            country: { type: 'string', example: 'Cameroun' },
            city: { type: 'string', example: 'Yaoundé' },
            neighborhood: { type: 'string', example: 'Bastos' },
            address: { type: 'string', example: 'Rue 1234 Bastos' },
            property_type: {
              type: 'string',
              enum: [
                'MAISON',
                'BUREAU',
                'ENTREPOT',
                'LOCAL_COMMERCIAL',
                'TERRAIN',
              ],
              example: 'MAISON',
            },
            price: { type: 'number', example: 500000 },
            currency: { type: 'string', example: 'XOF' },
            size_m2: { type: 'number', example: 250 },
            is_featured: { type: 'boolean', example: false },
            is_deleted: { type: 'boolean', example: false },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
              example: 'PENDING',
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            images: {
              type: 'array',
              items: { $ref: '#/components/schemas/PropertyImage' },
            },
            owner: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                full_name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
              },
            },
          },
        },
        PropertyImage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            property_id: { type: 'string', format: 'uuid' },
            image_url: {
              type: 'string',
              example: 'https://res.cloudinary.com/...',
            },
            order: { type: 'integer', example: 0 },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreatePropertyDto: {
          type: 'object',
          required: [
            'title',
            'description',
            'country',
            'city',
            'neighborhood',
            'address',
            'property_type',
            'price',
            'size_m2',
          ],
          properties: {
            title: { type: 'string', example: 'Belle villa à Bastos' },
            description: {
              type: 'string',
              example: 'Superbe villa moderne avec piscine et jardin',
            },
            country: { type: 'string', example: 'Cameroun' },
            city: { type: 'string', example: 'Yaoundé' },
            neighborhood: { type: 'string', example: 'Bastos' },
            address: { type: 'string', example: 'Rue 1234 Bastos' },
            property_type: {
              type: 'string',
              enum: [
                'MAISON',
                'BUREAU',
                'ENTREPOT',
                'LOCAL_COMMERCIAL',
                'TERRAIN',
              ],
            },
            price: { type: 'number', example: 500000 },
            currency: { type: 'string', example: 'XOF' },
            size_m2: { type: 'number', example: 250 },
          },
        },
        // ─── Inquiry ──────────────────────────────────────────────────────
        Inquiry: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            property_id: { type: 'string', format: 'uuid' },
            sender_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            name: { type: 'string', example: 'John Doe' },
            phone_number: { type: 'string', example: '+237612345678' },
            message: {
              type: 'string',
              example: 'Je suis intéressé par ce bien',
            },
            created_at: { type: 'string', format: 'date-time' },
            property: { type: 'object' },
            sender: { type: 'object', nullable: true },
          },
        },
        CreateInquiryDto: {
          type: 'object',
          required: ['name', 'phone_number', 'message'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            phone_number: { type: 'string', example: '+237612345678' },
            message: {
              type: 'string',
              example: 'Je suis intéressé par ce bien immobilier',
            },
          },
        },
        // ─── Payment ──────────────────────────────────────────────────────
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            owner_id: { type: 'string', format: 'uuid' },
            property_id: { type: 'string', format: 'uuid', nullable: true },
            amount: { type: 'number', example: 50000 },
            currency: { type: 'string', example: 'XOF' },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'FAILED'],
              example: 'PENDING',
            },
            type: {
              type: 'string',
              enum: ['FEATURED', 'SUBSCRIPTION', 'AGENT_FEATURE'],
              example: 'FEATURED',
            },
            flutterwave_ref: {
              type: 'string',
              example: 'IMMO-1234567890-ABCD',
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        InitiatePaymentDto: {
          type: 'object',
          required: ['amount', 'phone_number'],
          properties: {
            property_id: { type: 'string', format: 'uuid', nullable: true },
            amount: { type: 'number', example: 50000 },
            currency: { type: 'string', example: 'XOF' },
            phone_number: { type: 'string', example: '+237612345678' },
            type: {
              type: 'string',
              enum: ['FEATURED', 'AGENT_FEATURE'],
              example: 'FEATURED',
              description: "FEATURED pour une propriété, AGENT_FEATURE pour un agent",
            },
          },
        },
        // ─── Favorites ─────────────────────────────────────────────────────
        CheckFavoriteResponse: {
          type: 'object',
          properties: {
            isFavorite: { type: 'boolean', example: true },
          },
        },
      },
      // ─── Reusable responses ──────────────────────────────────────────────
      responses: {
        TooManyRequests: {
          description: 'Trop de requêtes — limite de taux dépassée (429). Chaque utilisateur authentifié a son propre compteur ; les utilisateurs non authentifiés sont limités par IP. La limite se réinitialise après 15 minutes.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Too many requests, please try again later.' },
            },
          },
          headers: {
            'RateLimit-Limit': {
              schema: { type: 'integer' },
              description: 'Nombre maximum de requêtes autorisées dans la fenêtre',
            },
            'RateLimit-Remaining': {
              schema: { type: 'integer' },
              description: 'Requêtes restantes dans la fenêtre actuelle',
            },
            'RateLimit-Reset': {
              schema: { type: 'integer' },
              description: 'Timestamp UNIX de réinitialisation du compteur',
            },
          },
        },
        Unauthorized: {
          description: 'Token manquant ou invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'No token provided' },
            },
          },
        },
        Forbidden: {
          description: 'Accès refusé — rôle insuffisant',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'You do not have permission to perform this action',
              },
            },
          },
        },
        NotFound: {
          description: 'Ressource introuvable',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Resource not found' },
            },
          },
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse',
              },
            },
          },
        },
      },
      // ─── Reusable parameters ─────────────────────────────────────────────
      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', default: 1 },
          description: 'Numéro de page',
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 10 },
          description: "Nombre d'éléments par page",
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentification et gestion des tokens' },
      { name: 'Users', description: 'Gestion des utilisateurs' },
      {
        name: 'Properties',
        description: 'Gestion des annonces immobilières',
      },
      { name: 'Inquiries', description: 'Système de demandes de contact' },
      { name: 'Payments', description: 'Paiements et mise en avant' },
      { name: 'Media', description: 'Upload et gestion des images' },
      { name: 'Favorites', description: 'Gestion des favoris' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
