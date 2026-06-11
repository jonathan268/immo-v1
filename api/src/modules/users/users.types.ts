export interface UpdateProfileDto {
  full_name?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserResponseDto {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_verified: boolean;
  is_suspended: boolean;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UsersListQuery {
  page?: string;
  limit?: string;
  role?: string;
  is_suspended?: string;
}