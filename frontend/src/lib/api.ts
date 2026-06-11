import type {
  ApiResponse,
  PaginatedResponse,
  RegisterDto,
  LoginDto,
  AuthTokens,
  User,
  UpdateProfileDto,
  ChangePasswordDto,
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyStatus,
  PropertyImage,
  UploadedImage,
  ReorderImage,
  Inquiry,
  CreateInquiryDto,
  Payment,
  InitiatePaymentDto,
  FeatureRequest,
  CreateFeatureRequestDto,
  CheckFavoriteResponse,
  PaginationQuery,
  PropertiesListQuery,
  UsersListQuery,
  PaymentsListQuery,
  FeatureRequestsListQuery,
  InquiriesListQuery,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const accessToken = tokenStorage.getAccess();
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  } as RequestInit);

  if (res.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
    const refreshToken = tokenStorage.getRefresh();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const { data } = await refreshRes.json();
          tokenStorage.setTokens(data.accessToken, data.refreshToken);
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include',
          } as RequestInit);
        } else {
          tokenStorage.clear();
          window.location.href = '/auth/login';
          throw new Error('Session expired');
        }
      } catch {
        tokenStorage.clear();
        window.location.href = '/auth/login';
        throw new Error('Session expired');
      }
    } else {
      tokenStorage.clear();
      window.location.href = '/auth/login';
      throw new Error('Session expired');
    }
  }

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(json.message || 'Request failed', res.status, json);
  }

  return json;
}

export const authApi = {
  register: (dto: RegisterDto) =>
    request<ApiResponse<AuthTokens>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  login: (dto: LoginDto) =>
    request<ApiResponse<AuthTokens>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  refresh: (refreshToken: string) =>
    request<ApiResponse<AuthTokens>>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (refreshToken: string) =>
    request<ApiResponse<null>>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  me: () => request<ApiResponse<User>>('/auth/me'),
  forgotPassword: (email: string) =>
    request<ApiResponse<null>>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (dto: { token: string; password: string; email: string }) =>
    request<ApiResponse<null>>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};

export const usersApi = {
  getProfile: () => request<ApiResponse<User>>('/users/profile'),
  updateProfile: (dto: UpdateProfileDto) =>
    request<ApiResponse<User>>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  changePassword: (dto: ChangePasswordDto) =>
    request<ApiResponse<null>>('/users/profile/password', {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  list: (query?: UsersListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.role) params.set('role', query.role);
    if (query?.is_suspended) params.set('is_suspended', query.is_suspended);
    const qs = params.toString();
    return request<PaginatedResponse<User>>(`/users${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<ApiResponse<User>>(`/users/${id}`),
  suspend: (id: string) =>
    request<ApiResponse<User>>(`/users/${id}/suspend`, { method: 'PATCH' }),
  unsuspend: (id: string) =>
    request<ApiResponse<User>>(`/users/${id}/unsuspend`, { method: 'PATCH' }),
  feature: (id: string) =>
    request<ApiResponse<User>>(`/users/${id}/feature`, { method: 'PATCH' }),
  delete: (id: string) =>
    request<ApiResponse<null>>(`/users/${id}`, { method: 'DELETE' }),
};

export const propertiesApi = {
  list: (query?: PropertiesListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.city) params.set('city', query.city);
    if (query?.neighborhood) params.set('neighborhood', query.neighborhood);
    if (query?.property_type) params.set('property_type', query.property_type);
    if (query?.price_min) params.set('price_min', String(query.price_min));
    if (query?.price_max) params.set('price_max', String(query.price_max));
    if (query?.size_min) params.set('size_min', String(query.size_min));
    if (query?.size_max) params.set('size_max', String(query.size_max));
    if (query?.sort) params.set('sort', query.sort);
    const qs = params.toString();
    return request<PaginatedResponse<Property>>(`/properties${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<ApiResponse<Property>>(`/properties/${id}`),
  create: (dto: CreatePropertyDto) =>
    request<ApiResponse<Property>>('/properties', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: UpdatePropertyDto) =>
    request<ApiResponse<Property>>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  delete: (id: string) =>
    request<ApiResponse<null>>(`/properties/${id}`, { method: 'DELETE' }),
  myListings: (query?: PaginationQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    const qs = params.toString();
    return request<PaginatedResponse<Property>>(`/properties/my/listings${qs ? `?${qs}` : ''}`);
  },
  pending: (query?: PaginationQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    const qs = params.toString();
    return request<PaginatedResponse<Property>>(`/properties/pending${qs ? `?${qs}` : ''}`);
  },
  updateStatus: (id: string, status: PropertyStatus) =>
    request<ApiResponse<Property>>(`/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  feature: (id: string) =>
    request<ApiResponse<Property>>(`/properties/${id}/feature`, { method: 'PATCH' }),
};

export const mediaApi = {
  getImages: (propertyId: string) =>
    request<ApiResponse<PropertyImage[]>>(`/properties/${propertyId}/images`),
  upload: (propertyId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    return request<ApiResponse<UploadedImage[]>>(
      `/properties/${propertyId}/images`,
      { method: 'POST', body: formData }
    );
  },
  delete: (propertyId: string, imageId: string) =>
    request<ApiResponse<null>>(`/properties/${propertyId}/images/${imageId}`, {
      method: 'DELETE',
    }),
  reorder: (propertyId: string, images: ReorderImage[]) =>
    request<ApiResponse<null>>(
      `/properties/${propertyId}/images/reorder`,
      { method: 'PATCH', body: JSON.stringify({ images }) }
    ),
};

export const inquiriesApi = {
  create: (propertyId: string, dto: CreateInquiryDto) =>
    request<ApiResponse<Inquiry>>(`/inquiries/${propertyId}`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  getReceived: (query?: InquiriesListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.property_id) params.set('property_id', query.property_id);
    const qs = params.toString();
    return request<PaginatedResponse<Inquiry>>(`/inquiries/my/received${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<ApiResponse<Inquiry>>(`/inquiries/${id}`),
  list: (query?: InquiriesListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.property_id) params.set('property_id', query.property_id);
    const qs = params.toString();
    return request<PaginatedResponse<Inquiry>>(`/inquiries${qs ? `?${qs}` : ''}`);
  },
  delete: (id: string) =>
    request<ApiResponse<null>>(`/inquiries/${id}`, { method: 'DELETE' }),
};

export const paymentsApi = {
  initiate: (dto: InitiatePaymentDto) =>
    request<ApiResponse<{ payment: Payment; payment_link: string }>>(
      '/payments/initiate',
      { method: 'POST', body: JSON.stringify(dto) }
    ),
  myPayments: (query?: PaymentsListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.status) params.set('status', query.status);
    if (query?.property_id) params.set('property_id', query.property_id);
    const qs = params.toString();
    return request<PaginatedResponse<Payment>>(`/payments/my${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<ApiResponse<Payment>>(`/payments/${id}`),
  list: (query?: PaymentsListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.status) params.set('status', query.status);
    if (query?.property_id) params.set('property_id', query.property_id);
    const qs = params.toString();
    return request<PaginatedResponse<Payment>>(`/payments${qs ? `?${qs}` : ''}`);
  },
  confirm: (id: string) =>
    request<ApiResponse<Payment>>(`/payments/${id}/confirm`, { method: 'PATCH' }),
};

export const featureRequestsApi = {
  create: (dto: CreateFeatureRequestDto) =>
    request<ApiResponse<FeatureRequest>>('/feature-requests', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  my: (query?: FeatureRequestsListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.status) params.set('status', query.status);
    if (query?.target) params.set('target', query.target);
    const qs = params.toString();
    return request<PaginatedResponse<FeatureRequest>>(`/feature-requests/my${qs ? `?${qs}` : ''}`);
  },
  pending: (query?: FeatureRequestsListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.status) params.set('status', query.status);
    if (query?.target) params.set('target', query.target);
    const qs = params.toString();
    return request<PaginatedResponse<FeatureRequest>>(`/feature-requests/pending${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<ApiResponse<FeatureRequest>>(`/feature-requests/${id}`),
  approve: (id: string) =>
    request<ApiResponse<FeatureRequest>>(`/feature-requests/${id}/approve`, {
      method: 'PATCH',
    }),
  reject: (id: string, rejection_reason?: string) =>
    request<ApiResponse<FeatureRequest>>(`/feature-requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejection_reason }),
    }),
};

export const favoritesApi = {
  list: () => request<ApiResponse<Property[]>>('/favorites'),
  add: (propertyId: string) =>
    request<ApiResponse<null>>(`/favorites/${propertyId}`, { method: 'POST' }),
  remove: (propertyId: string) =>
    request<ApiResponse<null>>(`/favorites/${propertyId}`, { method: 'DELETE' }),
  check: (propertyId: string) =>
    request<ApiResponse<CheckFavoriteResponse>>(`/favorites/${propertyId}/check`),
};
