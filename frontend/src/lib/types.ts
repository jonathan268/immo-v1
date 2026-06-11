// Enums
export type Role = 'ADMIN' | 'OWNER' | 'TENANT';
export type PropertyType = 'MAISON' | 'BUREAU' | 'ENTREPOT' | 'LOCAL_COMMERCIAL' | 'TERRAIN';
export type PropertyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';
export type PaymentType = 'FEATURED' | 'SUBSCRIPTION' | 'AGENT_FEATURE';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type FeatureTarget = 'AGENT' | 'PROPERTY';

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

// Auth
export interface RegisterDto {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// User
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  is_verified: boolean;
  is_suspended: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileDto {
  full_name?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Property
export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  order: number;
  created_at: string;
}

export interface PropertyOwner {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  country: string;
  city: string;
  neighborhood: string;
  address: string;
  property_type: PropertyType;
  price: number;
  currency: string;
  size_m2: number;
  is_featured: boolean;
  is_deleted: boolean;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
  images: PropertyImage[];
  owner: PropertyOwner;
}

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

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {}

// Media
export interface UploadedImage {
  image_url: string;
  public_id: string;
  order: number;
}

export interface ReorderImage {
  id: string;
  order: number;
}

// Inquiry
export interface InquirySender {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

export interface InquiryProperty {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  owner_id: string;
}

export interface Inquiry {
  id: string;
  property_id: string;
  sender_id: string | null;
  name: string;
  phone_number: string;
  message: string;
  created_at: string;
  property: InquiryProperty;
  sender: InquirySender | null;
}

export interface CreateInquiryDto {
  name: string;
  phone_number: string;
  message: string;
}

// Payment
export interface PaymentOwner {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

export interface PaymentProperty {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  status: PropertyStatus;
  is_featured: boolean;
}

export interface Payment {
  id: string;
  owner_id: string;
  property_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  flutterwave_ref: string;
  created_at: string;
  updated_at: string;
  owner: PaymentOwner;
  property: PaymentProperty | null;
}

export interface InitiatePaymentDto {
  property_id?: string;
  amount: number;
  currency?: string;
  phone_number: string;
  type?: PaymentType;
}

// Feature Request
export interface FeatureRequestUser {
  id: string;
  full_name: string;
  email: string;
  role?: string;
}

export interface FeatureRequestAgent {
  id: string;
  full_name: string;
  email: string;
}

export interface FeatureRequestProperty {
  id: string;
  title: string;
  city: string;
}

export interface FeatureRequest {
  id: string;
  requester_id: string;
  target: FeatureTarget;
  target_id: string;
  status: RequestStatus;
  reason: string | null;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  requester: FeatureRequestUser;
  agent: FeatureRequestAgent | null;
  property: FeatureRequestProperty | null;
}

export interface CreateFeatureRequestDto {
  target: FeatureTarget;
  target_id: string;
  reason?: string;
}

// Favorite
export interface CheckFavoriteResponse {
  isFavorite: boolean;
}

// Query params
export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

export interface PropertiesListQuery extends PaginationQuery {
  city?: string;
  neighborhood?: string;
  property_type?: PropertyType;
  price_min?: number | string;
  price_max?: number | string;
  size_min?: number | string;
  size_max?: number | string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export interface UsersListQuery extends PaginationQuery {
  role?: Role;
  is_suspended?: string;
}

export interface PaymentsListQuery extends PaginationQuery {
  status?: PaymentStatus;
  property_id?: string;
}

export interface FeatureRequestsListQuery extends PaginationQuery {
  status?: RequestStatus;
  target?: FeatureTarget;
}

export interface InquiriesListQuery extends PaginationQuery {
  property_id?: string;
}

export interface CityStat {
  name: string;
  count: number;
}

export interface DashboardStats {
  total_properties: number;
  total_cities: number;
  total_owners: number;
  total_inquiries: number;
  cities: CityStat[];
}
