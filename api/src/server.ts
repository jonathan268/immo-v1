import "dotenv/config";
import app from "./app";
import { env } from "./config/env";
import { prisma } from "./utils/prisma";

const startServer = async (): Promise<void> => {
  try {
    // Tester la connexion DB
    await prisma.$connect();
    console.log(" Database connected successfully");

    app.listen(env.port, () => {
      console.log(` Server running in ${env.nodeEnv} mode on port ${env.port}`);
      console.log(` Health check: http://localhost:${env.port}/health`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();