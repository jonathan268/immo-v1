import { prisma } from "../../utils/prisma";

export const getDashboardStatsService = async () => {
  const [
    totalProperties,
    totalOwners,
    totalInquiries,
    citiesWithCount,
  ] = await Promise.all([
    prisma.property.count({
      where: { is_deleted: false, status: "APPROVED" },
    }),
    prisma.user.count({
      where: { role: "OWNER" },
    }),
    prisma.inquiry.count(),
    prisma.property.groupBy({
      by: ["city"],
      where: { is_deleted: false, status: "APPROVED" },
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
    }),
  ]);

  return {
    total_properties: totalProperties,
    total_cities: citiesWithCount.length,
    total_owners: totalOwners,
    total_inquiries: totalInquiries,
    cities: citiesWithCount.map((c) => ({
      name: c.city,
      count: c._count.city,
    })),
  };
};
