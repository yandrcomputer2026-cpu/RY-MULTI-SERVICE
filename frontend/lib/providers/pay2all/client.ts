// ======================================================
// RY MULTI SERVICE
// Pay2All Server-Side API Client
// ======================================================

import "server-only";

const DEFAULT_BASE_URL =
  "https://pay2all.in/api/v1";

type Pay2AllRechargeRequest = {
  clientId: string;
  providerId: number;
  number: string;
  amount: number;
};

export type Pay2AllRechargeResponse = {
  status_id?: number;
  message?: string;

  data?: {
    txn_id?: string;
    client_id?: string;
    utr?: string;
    report_id?: string | number;
    number?: string;
    amount?: number;
    wallet_balance?: number;
  };
};

function getPay2AllConfig() {
  const apiToken =
    process.env.PAY2ALL_API_TOKEN?.trim();

  const baseUrl =
    process.env.PAY2ALL_BASE_URL?.trim() ||
    DEFAULT_BASE_URL;

  const mode =
    process.env.PAY2ALL_MODE
      ?.trim()
      .toUpperCase() || "UAT";

  if (!apiToken) {
    throw new Error(
      "PAY2ALL_API_TOKEN is not configured."
    );
  }

  if (
    mode !== "UAT" &&
    mode !== "LIVE"
  ) {
    throw new Error(
      "PAY2ALL_MODE must be UAT or LIVE."
    );
  }

  return {
    apiToken,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    mode,
  };
}

export async function pay2AllRecharge(
  input: Pay2AllRechargeRequest
): Promise<Pay2AllRechargeResponse> {
  const {
    apiToken,
    baseUrl,
    mode,
  } = getPay2AllConfig();

  const response = await fetch(
    `${baseUrl}/recharge`,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${apiToken}`,

        "Content-Type":
          "application/json",

        Accept:
          "application/json",
      },

      body: JSON.stringify({
        client_id: input.clientId,
        provider_id: input.providerId,
        number: input.number,
        amount: input.amount,
        type: "MOBILE",
        mode,
      }),

      cache: "no-store",
    }
  );

  const responseText =
    await response.text();

  let data: Pay2AllRechargeResponse;

  try {
    data = JSON.parse(
      responseText
    ) as Pay2AllRechargeResponse;
  } catch {
    throw new Error(
      `Pay2All returned invalid response. HTTP ${response.status}.`
    );
  }

  if (!response.ok) {
    console.error(
      "PAY2ALL RECHARGE HTTP ERROR:",
      response.status,
      data
    );

    throw new Error(
      data.message ||
        `Pay2All recharge request failed. HTTP ${response.status}.`
    );
  }

  return data;
}