import type { JsonObject } from '../../models/common.type';

/** Input shared by charge and authorize gateway calls. */
export type GatewayChargeInput = {
  amount: number;
  currency: string;
  paymentToken: string;
  orderReference?: string;
  customerId?: number;
  metadata: JsonObject;
};

/** Input for capturing a prior authorization. */
export type GatewayCaptureInput = {
  providerReference: string;
  amount: number;
  currency: string;
  metadata: JsonObject;
};

/** Input for refunding a prior charge or capture. */
export type GatewayRefundInput = {
  providerReference: string;
  amount: number;
  currency: string;
  metadata: JsonObject;
};

/** Normalized gateway response used by the payment engine. */
export type GatewayResult = {
  status: string;
  providerReference: string;
  raw: JsonObject;
  failureCode?: string;
  failureMessage?: string;
};

export type ChargeFn = (_input: GatewayChargeInput) => Promise<GatewayResult>;
export type CaptureFn = (_input: GatewayCaptureInput) => Promise<GatewayResult>;
export type RefundFn = (_input: GatewayRefundInput) => Promise<GatewayResult>;
export type VerifyWebhookFn = (
  _payload: string,
  _signature: string,
  _webhookSecret: string,
) => boolean;

/** Strategy contract implemented by each payment provider adapter. */
export type PaymentProviderAdapter = {
  charge: ChargeFn;
  authorize: ChargeFn;
  capture: CaptureFn;
  refund: RefundFn;
  verifyWebhookSignature: VerifyWebhookFn;
};
