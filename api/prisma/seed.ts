import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "superadmin@immo-platform.com";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("Super admin already exists, skipping seed.");
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString("hex");
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      full_name: "Super Admin",
      email: adminEmail,
      phone: "+237600000000",
      password: hashedPassword,
      role: "ADMIN",
      is_verified: true,
    },
  });

  console.log(`Super admin created successfully.`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Set ADMIN_PASSWORD env var to use a custom password.`);

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(`WARNING: Generated random admin password. Set ADMIN_PASSWORD env var for reproducibility.`);
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
