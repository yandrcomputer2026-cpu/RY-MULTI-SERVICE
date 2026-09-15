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
 * External provider credentials मिलने के बाद
 * provider adapters यहाँ register किए जाएंगे.
 *
 * IMPORTANT:
 * API keys / secrets इस file में hard-code नहीं करने हैं.
 */
export const providerRegistry: ProviderConfig[] = [
  {
    id: "recharge-provider",
    name: "Recharge Provider",
    status: "NOT_CONFIGURED",
    services: ["MOBILE_PREPAID", "DTH"],
  },

  {
    id: "bbps-provider",
    name: "BBPS Provider",
    status: "NOT_CONFIGURED",
    services: ["MOBILE_POSTPAID", "ELECTRICITY"],
  },

  {
    id: "fastag-provider",
    name: "FASTag Provider",
    status: "NOT_CONFIGURED",
    services: ["FASTAG"],
  },

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
 * Service live processing के लिए available है या नहीं.
 */
export function isServiceProviderActive(
  service: ServiceCategory,
): boolean {
  const provider = getProviderForService(service);

  return provider?.status === "ACTIVE";
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