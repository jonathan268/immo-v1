import { PropertyStatus, PropertyType } from "@prisma/client";

export interface CreatePropertyDto {
  title: string;
  description: string;
  country: string;
  city: string;
  neighborhood: string;
  address: string;
  property_type: PropertyType;
  price: number;
  currency?: string;
  size_m2: number;
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  country?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  property_type?: PropertyType;
  price?: number;
  currency?: string;
  size_m2?: number;
}

export interface UpdatePropertyStatusDto {
  status: PropertyStatus;
}

export interface PropertiesListQuery {
  page?: string;
  limit?: string;
  city?: string;
  neighborhood?: string;
  property_type?: string;
  price_min?: string;
  price_max?: string;
  size_min?: string;
  size_max?: string;
  sort?: "price_asc" | "price_desc" | "newest";
}