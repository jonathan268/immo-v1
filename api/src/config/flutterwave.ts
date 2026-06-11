import axios from "axios";
import { env } from "./env";

export const flutterwaveClient = axios.create({
  baseURL: "https://api.flutterwave.com/v3",
  headers: {
    Authorization: `Bearer ${env.flutterwave.secretKey}`,
    "Content-Type": "application/json",
  },
});

export interface FlutterwavePaymentPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phonenumber: string;
    name: string;
  };
  meta: {
    property_id?: string;
    owner_id: string;
    payment_db_id: string;
  };
  customizations: {
    title: string;
    description: string;
  };
}

export const initiateFlutterwavePayment = async (
  payload: FlutterwavePaymentPayload
): Promise<{ payment_link: string }> => {
  const response = await flutterwaveClient.post(
    "/payments",
    payload
  );

  if (response.data.status !== "success") {
    throw new Error("Failed to initiate payment with Flutterwave");
  }

  return { payment_link: response.data.data.link };
};

export const verifyFlutterwaveTransaction = async (
  transactionId: string
): Promise<{
  status: string;
  tx_ref: string;
  amount: number;
  currency: string;
}> => {
  const response = await flutterwaveClient.get(
    `/transactions/${transactionId}/verify`
  );

  if (response.data.status !== "success") {
    throw new Error("Failed to verify transaction");
  }

  return {
    status: response.data.data.status,
    tx_ref: response.data.data.tx_ref,
    amount: response.data.data.amount,
    currency: response.data.data.currency,
  };
};