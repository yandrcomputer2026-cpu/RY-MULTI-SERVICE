import { getProviderForService } from "@/lib/providers/registry";

import type {
  ProviderConfig,
  ProviderHealthResult,
  ProviderResponse,
  ServiceCategory,
  ServiceProvider,
} from "@/lib/providers/types";

type RechargeService =
  | "MOBILE_PREPAID"
  | "DTH";

export class RechargeProvider
  implements ServiceProvider
{
  readonly config: ProviderConfig;

  constructor(service: RechargeService) {
    const config = getProviderForService(
      service as ServiceCategory
    );

    if (!config) {
      throw new Error(
        `Provider configuration not found for ${service}.`
      );
    }

    this.config = config;
  }

  async healthCheck(): Promise<
    ProviderResponse<ProviderHealthResult>
  > {
    const status = this.config.status;

    // Provider configured माना जाएगा जब
    // वह NOT_CONFIGURED नहीं है.
    const configured =
      status !== "NOT_CONFIGURED";

    // TEST_MODE = UAT/Sandbox available
    // ACTIVE    = Production/Live available
    const available =
      status === "TEST_MODE" ||
      status === "ACTIVE";

    let message =
      "Authorized recharge provider integration required है.";

    if (status === "TEST_MODE") {
      message =
        "Pay2All recharge provider UAT/Test Mode में available है.";
    } else if (status === "ACTIVE") {
      message =
        "Pay2All recharge provider LIVE mode में active है.";
    } else if (status === "INACTIVE") {
      message =
        "Recharge provider temporarily inactive है.";
    } else if (status === "ERROR") {
      message =
        "Recharge provider status error है.";
    } else if (status === "NOT_CONFIGURED") {
      message =
        "Recharge provider अभी configured नहीं है.";
    }

    return {
      success: true,

      message,

      provider: this.config.name,

      data: {
        configured,
        available,
        status,
        message,
      },
    };
  }
}

export const prepaidRechargeProvider =
  new RechargeProvider(
    "MOBILE_PREPAID"
  );

export const dthRechargeProvider =
  new RechargeProvider("DTH");