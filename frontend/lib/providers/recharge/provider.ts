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

  constructor(
    service: RechargeService
  ) {
    const config =
      getProviderForService(
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
    const configured =
      this.config.status !==
      "NOT_CONFIGURED";

    const available =
      this.config.status === "ACTIVE";

    let message =
      "Authorized recharge provider integration required है.";

    if (this.config.status === "ACTIVE") {
      message =
        "Recharge provider active है.";
    } else if (
      this.config.status === "TEST_MODE"
    ) {
      message =
        "Recharge provider test mode में है.";
    } else if (
      this.config.status === "INACTIVE"
    ) {
      message =
        "Recharge provider inactive है.";
    } else if (
      this.config.status === "ERROR"
    ) {
      message =
        "Recharge provider status error है.";
    }

    return {
      success: true,

      message:
        this.config.status ===
        "NOT_CONFIGURED"
          ? "Recharge provider अभी configured नहीं है."
          : message,

      provider: this.config.name,

      data: {
        configured,
        available,
        status: this.config.status,
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