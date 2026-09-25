// ======================================================
// RY MULTI SERVICE
// Central Provider Registry
// ======================================================

import type {
  ProviderConfig,
  ServiceCategory,
} from "@/lib/providers/types";

/**
 * Central provider registry.
 *
 * IMPORTANT:
 * API keys / secrets इस file में hard-code नहीं करने हैं.
 *
 * Provider Status:
 * NOT_CONFIGURED = Provider setup नहीं हुआ
 * TEST_MODE      = UAT / Sandbox testing
 * ACTIVE         = Production / Live
 * INACTIVE       = Temporarily disabled
 * ERROR          = Provider problem
 */

export const providerRegistry: ProviderConfig[] = [
  // ====================================================
  // PAY2ALL - RECHARGE
  // ====================================================
  {
    id: "pay2all-recharge",
    name: "Pay2All",
    status: "TEST_MODE",
    services: [
      "MOBILE_PREPAID",
      "DTH",
    ],
  },

  // ====================================================
  // BBPS
  // ====================================================
  {
    id: "bbps-provider",
    name: "BBPS Provider",
    status: "NOT_CONFIGURED",
    services: [
      "MOBILE_POSTPAID",
      "ELECTRICITY",
    ],
  },

  // ====================================================
  // FASTAG
  // ====================================================
  {
    id: "fastag-provider",
    name: "FASTag Provider",
    status: "NOT_CONFIGURED",
    services: ["FASTAG"],
  },

  // ====================================================
  // BANKING
  // ====================================================
  {
    id: "banking-provider",
    name: "Banking Provider",
    status: "NOT_CONFIGURED",
    services: [
      "AEPS",
      "MONEY_TRANSFER",
      "UPI_CASH",
      "PAYOUT",
    ],
  },

  // ====================================================
  // TRAVEL
  // ====================================================
  {
    id: "travel-provider",
    name: "Travel Provider",
    status: "NOT_CONFIGURED",
    services: [
      "TRAIN",
      "BUS",
      "FLIGHT",
      "HOTEL",
    ],
  },
];

/**
 * Service के लिए configured provider खोजता है.
 */
export function getProviderForService(
  service: ServiceCategory,
): ProviderConfig | null {
  const provider = providerRegistry.find((item) =>
    item.services.includes(service),
  );

  return provider ?? null;
}

/**
 * Service LIVE production processing के लिए
 * available है या नहीं.
 *
 * TEST_MODE को यहाँ ACTIVE नहीं माना जाएगा.
 */
export function isServiceProviderActive(
  service: ServiceCategory,
): boolean {
  const provider = getProviderForService(service);

  return provider?.status === "ACTIVE";
}

/**
 * Service UAT / Sandbox testing के लिए
 * available है या नहीं.
 */
export function isServiceProviderTestMode(
  service: ServiceCategory,
): boolean {
  const provider = getProviderForService(service);

  return provider?.status === "TEST_MODE";
}

/**
 * Service किसी processing environment में
 * available है या नहीं.
 *
 * TEST_MODE = UAT
 * ACTIVE    = LIVE
 */
export function isServiceProviderAvailable(
  service: ServiceCategory,
): boolean {
  const provider = getProviderForService(service);

  return (
    provider?.status === "TEST_MODE" ||
    provider?.status === "ACTIVE"
  );
}

/**
 * किसी provider को ID से खोजता है.
 */
export function getProviderById(
  providerId: string,
): ProviderConfig | null {
  const provider = providerRegistry.find(
    (item) => item.id === providerId,
  );

  return provider ?? null;
}