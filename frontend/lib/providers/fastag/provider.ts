// ======================================================
// RY MULTI SERVICE
// FASTag Provider Adapter
// ======================================================

import { getProviderForService } from "@/lib/providers/registry";

import type {
  ProviderHealthResult,
  ProviderResponse,
  ServiceProvider,
} from "@/lib/providers/types";

/**
 * FASTag provider adapter.
 *
 * अभी authorized external FASTag provider configured नहीं है।
 * इसलिए यह adapter केवल configuration/health status देगा।
 *
 * Live provider मिलने के बाद:
 * - vehicle lookup
 * - provider/issuer lookup
 * - recharge request
 * - transaction status
 *
 * इसी adapter layer में implement किए जाएंगे।
 */
class FastagProvider implements ServiceProvider {
  readonly config;

  constructor() {
    const config = getProviderForService("FASTAG");

    if (!config) {
      throw new Error(
        "FASTag provider configuration registry में नहीं मिली.",
      );
    }

    this.config = config;
  }

  /**
   * FASTag provider availability check.
   */
  async healthCheck(): Promise<
    ProviderResponse<ProviderHealthResult>
  > {
    const configured =
      this.config.status !== "NOT_CONFIGURED";

    const available =
      this.config.status === "ACTIVE";

    return {
      success: true,

      message: available
        ? "FASTag provider active है."
        : "FASTag provider अभी configured नहीं है.",

      provider: this.config.name,

      data: {
        configured,
        available,
        status: this.config.status,
        message: available
          ? "FASTag live processing available है."
          : "Authorized FASTag provider integration required है.",
      },
    };
  }
}

/**
 * Single server-side FASTag provider instance.
 */
export const fastagProvider = new FastagProvider();