export interface CreateFeatureRequestDto {
  target: 'AGENT' | 'PROPERTY'; // "AGENT" ou "PROPERTY"
  target_id: string; // ID de l'agent (User) ou propriété (Property)
  reason?: string;
}

export interface FeatureRequestResponseDto {
  id: string;
  requester_id: string;
  target: 'AGENT' | 'PROPERTY';
  target_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  created_at: Date;
  updated_at: Date;
  reviewed_by?: string;
  reviewed_at?: Date;
  rejection_reason?: string;
  requester?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  agent?: {
    id: string;
    full_name: string;
    email: string;
  };
  property?: {
    id: string;
    title: string;
    city: string;
  };
}

export interface ApproveFeatureRequestDto {
  request_id: string;
}

export interface RejectFeatureRequestDto {
  request_id: string;
  rejection_reason?: string;
}

export interface FeatureRequestsListQuery {
  page?: string;
  limit?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  target?: 'AGENT' | 'PROPERTY';
}

export interface MyFeatureRequestsQuery {
  page?: string;
  limit?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  target?: 'AGENT' | 'PROPERTY';
}
