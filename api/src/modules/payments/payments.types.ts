export interface InitiatePaymentDto {
  property_id?: string;
  amount: number;
  currency?: string;
  phone_number: string;
  type?: "FEATURED" | "AGENT_FEATURE";
}

export interface FlutterwaveWebhookDto {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: string;
    payment_type: string;
  };
}

export interface PaymentsListQuery {
  page?: string;
  limit?: string;
  status?: string;
  property_id?: string;
}