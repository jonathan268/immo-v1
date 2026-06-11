const requiredEnvVars = [
  "DATABASE_URL",
  "DIRECT_URL",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "FLUTTERWAVE_SECRET_KEY",
  "FLUTTERWAVE_PUBLIC_KEY",
  "FLUTTERWAVE_SECRET_HASH",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
] as const;

export const validateEnv = (): void => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "5000", 10),
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },
  flutterwave: {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
    secretHash: process.env.FLUTTERWAVE_SECRET_HASH!,
  },
  mail: {
    host: process.env.MAIL_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.MAIL_PORT ?? "587", 10),
    user: process.env.MAIL_USER!,
    pass: process.env.MAIL_PASS!,
    from: process.env.MAIL_FROM!,
  },
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
  },
};