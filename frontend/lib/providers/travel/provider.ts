// ======================================================
// RY MULTI SERVICE
// Travel Provider Adapter
// ======================================================

import type {
  ProviderConfig,
  ProviderHealthResult,
  ProviderResponse,
  ServiceProvider,
} from "@/lib/providers/types";

import {
  getProviderForService,
} from "@/lib/providers/registry";

// ======================================================
// TRAVEL SERVICES
// ======================================================

export type TravelService =
  | "TRAIN"
  | "BUS"
  | "FLIGHT"
  | "HOTEL";

// ======================================================
// TRAVEL PROVIDER
// ======================================================

class TravelProvider
  implements ServiceProvider
{
  readonly config: ProviderConfig;

  constructor(
    private readonly service: TravelService
  ) {
    const provider =
      getProviderForService(service);

    if (!provider) {
      throw new Error(
        `Travel provider configuration not found for ${service}.`
      );
    }

    this.config = provider;
  }

  // ====================================================
  // HEALTH CHECK
  // ====================================================

  async healthCheck(): Promise<
    ProviderResponse<ProviderHealthResult>
  > {
    const status =
      this.config.status;

    const configured =
      status !== "NOT_CONFIGURED";

    const available =
      status === "ACTIVE";

    let message =
      "Travel provider अभी configure नहीं है।";

    switch (status) {
      case "ACTIVE":
        message =
          "Travel provider active है।";
        break;

      case "TEST_MODE":
        message =
          "Travel provider अभी test mode में है।";
        break;

      case "INACTIVE":
        message =
          "Travel provider अभी inactive है।";
        break;

      case "ERROR":
        message =
          "Travel provider में configuration error है।";
        break;

      case "NOT_CONFIGURED":
      default:
        message =
          "Travel provider अभी configure नहीं है।";
        break;
    }

    return {
      success: true,

      message,

      provider:
        this.config.name,

      data: {
        configured,
        available,
        status,
        message,
      },
    };
  }
}

// ======================================================
// SERVICE PROVIDERS
// ======================================================

export const trainProvider =
  new TravelProvider("TRAIN");

export const busProvider =
  new TravelProvider("BUS");

export const flightProvider =
  new TravelProvider("FLIGHT");

export const hotelProvider =
  new TravelProvider("HOTEL");