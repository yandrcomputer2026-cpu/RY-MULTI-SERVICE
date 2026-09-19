// ======================================================
// RY MULTI SERVICE
// Banking Provider Adapter
// AEPS + Money Transfer + UPI Cash + Payout
// ======================================================

import {
  getProviderForService,
} from "@/lib/providers/registry";

import type {
  ProviderHealthResult,
  ProviderResponse,
  ServiceProvider,
} from "@/lib/providers/types";

type BankingService =
  | "AEPS"
  | "MONEY_TRANSFER"
  | "UPI_CASH"
  | "PAYOUT";

export class BankingProvider
  implements ServiceProvider
{
  public readonly config;

  constructor(service: BankingService) {
    const provider =
      getProviderForService(service);

    if (!provider) {
      throw new Error(
        `Banking provider not registered for service: ${service}`,
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
      "Banking provider अभी configured नहीं है।";

    if (status === "ACTIVE") {
      message =
        "Banking provider active है।";
    } else if (status === "TEST_MODE") {
      message =
        "Banking provider test mode में है।";
    } else if (status === "INACTIVE") {
      message =
        "Banking provider inactive है।";
    } else if (status === "ERROR") {
      message =
        "Banking provider में error है।";
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

export const aepsProvider =
  new BankingProvider("AEPS");

export const moneyTransferProvider =
  new BankingProvider("MONEY_TRANSFER");

export const upiCashProvider =
  new BankingProvider("UPI_CASH");

export const payoutProvider =
  new BankingProvider("PAYOUT");