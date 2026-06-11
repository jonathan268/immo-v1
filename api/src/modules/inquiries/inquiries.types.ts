export interface CreateInquiryDto {
  name: string;
  phone_number: string;
  message: string;
}

export interface InquiriesListQuery {
  page?: string;
  limit?: string;
  property_id?: string;
}