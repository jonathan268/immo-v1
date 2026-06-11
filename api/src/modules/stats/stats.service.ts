import { prisma } from "../../utils/prisma";

export const getDashboardStatsService = async () => {
  const [
    totalProperties,
    totalOwners,
    totalInquiries,
    citiesWithCount,
    propertyCountsByOwner,
    topOwners,
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
    prisma.property.groupBy({
      by: ["owner_id"],
      where: { is_deleted: false },
      _count: { owner_id: true },
    }),
    prisma.user.findMany({
      where: { role: "OWNER" },
      select: {
        id: true,
        full_name: true,
        phone: true,
        is_featured: true,
        is_verified: true,
      },
      take: 50,
    }),
  ]);

  const countMap = new Map(propertyCountsByOwner.map((p) => [p.owner_id, p._count.owner_id]));

  const topAgents = topOwners
    .filter((u) => countMap.has(u.id))
    .sort((a, b) => (countMap.get(b.id) ?? 0) - (countMap.get(a.id) ?? 0))
    .slice(0, 3)
    .map((u) => ({
      id: u.id,
      full_name: u.full_name,
      phone: u.phone,
      is_featured: u.is_featured,
      is_verified: u.is_verified,
      property_count: countMap.get(u.id) ?? 0,
    }));

  return {
    total_properties: totalProperties,
    total_cities: citiesWithCount.length,
    total_owners: totalOwners,
    total_inquiries: totalInquiries,
    cities: citiesWithCount.map((c) => ({
      name: c.city,
      count: c._count.city,
    })),
    top_agents: topAgents,
  };
};
