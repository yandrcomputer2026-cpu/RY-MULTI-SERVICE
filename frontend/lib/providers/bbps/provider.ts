// ======================================================
// RY MULTI SERVICE
// BBPS Provider Adapter
// Mobile Postpaid + Electricity
// ======================================================

import {
  getProviderForService,
} from "@/lib/providers/registry";

import type {
  ProviderHealthResult,
  ProviderResponse,
  ServiceCategory,
  ServiceProvider,
} from "@/lib/providers/types";

type BBPSService =
  | "MOBILE_POSTPAID"
  | "ELECTRICITY";

export class BBPSProvider
  implements ServiceProvider
{
  public readonly config;

  constructor(service: BBPSService) {
    const provider =
      getProviderForService(service);

    if (!provider) {
      throw new Error(
        `BBPS provider not registered for service: ${service}`,
      );
    }

    this.config = provider;
  }

  async healthCheck(): Promise<
    ProviderResponse<ProviderHealthResult>
  > {
    const status = this.config.status;

    const configured =
      status !== "NOT_CONFIGURED";

    const available =
      status === "ACTIVE";

    let message =
      "BBPS provider अभी configured नहीं है।";

    if (status === "ACTIVE") {
      message =
        "BBPS provider active है।";
    } else if (status === "TEST_MODE") {
      message =
        "BBPS provider test mode में है।";
    } else if (status === "INACTIVE") {
      message =
        "BBPS provider inactive है।";
    } else if (status === "ERROR") {
      message =
        "BBPS provider में error है।";
    }

    return {
      success: true,
      message,
      data: {
        configured,
        available,
        status,
        message,
      },
    };
  }
}

export const mobilePostpaidProvider =
  new BBPSProvider("MOBILE_POSTPAID");

export const electricityProvider =
  new BBPSProvider("ELECTRICITY");