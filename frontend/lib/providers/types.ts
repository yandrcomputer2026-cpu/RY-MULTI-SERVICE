// ======================================================
// RY MULTI SERVICE
// Common Provider Types
// ======================================================

/**
 * सभी external service providers के लिए common status.
 */
export type ProviderStatus =
  | "NOT_CONFIGURED"
  | "TEST_MODE"
  | "ACTIVE"
  | "INACTIVE"
  | "ERROR";

/**
 * RY MULTI SERVICE में supported service categories.
 */
export type ServiceCategory =
  | "MOBILE_PREPAID"
  | "MOBILE_POSTPAID"
  | "DTH"
  | "ELECTRICITY"
  | "FASTAG"
  | "AEPS"
  | "MONEY_TRANSFER"
  | "UPI_CASH"
  | "PAYOUT"
  | "TRAIN"
  | "BUS"
  | "FLIGHT"
  | "HOTEL";

/**
 * किसी provider की basic configuration.
 *
 * IMPORTANT:
 * API keys/secrets client-side code में कभी नहीं भेजने हैं.
 */
export interface ProviderConfig {
  id: string;
  name: string;
  status: ProviderStatus;
  services: ServiceCategory[];
}

/**
 * सभी provider API responses का common structure.
 */
export interface ProviderResponse<T = unknown> {
  success: boolean;

  message: string;

  data?: T;

  provider?: string;

  providerReference?: string;

  errorCode?: string;
}

/**
 * Recharge / bill-payment जैसी services के लिए
 * common transaction status.
 */
export type ProviderTransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REVERSED";

/**
 * Provider transaction का common result.
 */
export interface ProviderTransactionResult {
  transactionId?: string;

  providerReference?: string;

  status: ProviderTransactionStatus;

  message: string;

  amount?: number;
}

/**
 * Provider health/status check result.
 */
export interface ProviderHealthResult {
  configured: boolean;

  available: boolean;

  status: ProviderStatus;

  message: string;
}

/**
 * Common provider interface.
 *
 * हर external provider adapter को कम से कम
 * अपनी identity और health check देना होगा.
 */
export interface ServiceProvider {
  readonly config: ProviderConfig;

  healthCheck(): Promise<ProviderResponse<ProviderHealthResult>>;
}