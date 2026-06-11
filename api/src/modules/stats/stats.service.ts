import { prisma } from "../../utils/prisma";

export const getDashboardStatsService = async () => {
  const [
    totalProperties,
    citiesResult,
    totalOwners,
    totalInquiries,
  ] = await Promise.all([
    prisma.property.count({
      where: { is_deleted: false, status: "APPROVED" },
    }),
    prisma.property.findMany({
      where: { is_deleted: false, status: "APPROVED" },
      select: { city: true },
      distinct: ["city"],
    }),
    prisma.user.count({
      where: { role: "OWNER" },
    }),
    prisma.inquiry.count(),
  ]);

  return {
    total_properties: totalProperties,
    total_cities: citiesResult.length,
    total_owners: totalOwners,
    total_inquiries: totalInquiries,
  };
};
