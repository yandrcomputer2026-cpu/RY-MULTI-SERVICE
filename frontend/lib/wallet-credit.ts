import { prisma } from "@/lib/prisma";

type CreditWalletInput = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountInPaise: number;
  currency: string;
  razorpaySignature?: string | null;
};

export async function creditWalletFromRazorpayPayment({
  razorpayOrderId,
  razorpayPaymentId,
  amountInPaise,
  currency,
  razorpaySignature,
}: CreditWalletInput) {
  // ======================================================
  // BASIC VALIDATION
  // ======================================================

  if (!razorpayOrderId || !razorpayPaymentId) {
    throw new Error("PAYMENT_DETAILS_MISSING");
  }

  if (currency !== "INR") {
    throw new Error("PAYMENT_CURRENCY_INVALID");
  }

  if (
    !Number.isSafeInteger(amountInPaise) ||
    amountInPaise <= 0
  ) {
    throw new Error("PAYMENT_AMOUNT_INVALID");
  }

  // ======================================================
  // FIND OUR INTERNAL TRANSACTION
  // ======================================================

  const walletTransaction =
    await prisma.walletTransaction.findFirst({
      where: {
        razorpayOrderId,
      },
    });

  if (!walletTransaction) {
    throw new Error("WALLET_TRANSACTION_NOT_FOUND");
  }

  // ======================================================
  // VERIFY EXACT AMOUNT
  // DB amount = rupees
  // Razorpay amount = paise
  // ======================================================

  const expectedAmountInPaise = Math.round(
    Number(walletTransaction.amount) * 100
  );

  if (expectedAmountInPaise !== amountInPaise) {
    throw new Error("PAYMENT_AMOUNT_MISMATCH");
  }

  // ======================================================
  // ALREADY SUCCESS
  //
  // Browser verify और webhook दोनों आ सकते हैं।
  // SUCCESS है तो दोबारा credit नहीं करना।
  // ======================================================

  if (walletTransaction.status === "SUCCESS") {
    const wallet = await prisma.wallet.findUnique({
      where: {
        id: walletTransaction.walletId,
      },
    });

    if (!wallet) {
      throw new Error("WALLET_NOT_FOUND");
    }

    return {
      alreadyProcessed: true,
      wallet,
      transaction: walletTransaction,
    };
  }

  // ======================================================
  // ONLY PENDING CAN BE CLAIMED
  // ======================================================

  if (walletTransaction.status !== "PENDING") {
    throw new Error("WALLET_TRANSACTION_BUSY");
  }

  // ======================================================
  // ATOMIC CREDIT
  // ======================================================

  try {
    return await prisma.$transaction(async (tx) => {
      // --------------------------------------------------
      // CLAIM PENDING TRANSACTION
      //
      // updateMany condition prevents two requests from
      // claiming the same payment simultaneously.
      // --------------------------------------------------

      const claimed =
        await tx.walletTransaction.updateMany({
          where: {
            id: walletTransaction.id,
            status: "PENDING",
          },

          data: {
            status: "PROCESSING",
          },
        });

      if (claimed.count !== 1) {
        throw new Error(
          "WALLET_TRANSACTION_BUSY"
        );
      }

      // --------------------------------------------------
      // CURRENT WALLET
      // --------------------------------------------------

      const currentWallet =
        await tx.wallet.findUnique({
          where: {
            id: walletTransaction.walletId,
          },
        });

      if (!currentWallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      if (
        currentWallet.userId !==
        walletTransaction.userId
      ) {
        throw new Error("WALLET_USER_MISMATCH");
      }

      if (currentWallet.status !== "ACTIVE") {
        throw new Error("WALLET_NOT_ACTIVE");
      }

      const balanceBefore =
        currentWallet.availableBalance;

      // --------------------------------------------------
      // CREDIT WALLET
      // --------------------------------------------------

      const updatedWallet = await tx.wallet.update({
        where: {
          id: currentWallet.id,
        },

        data: {
          availableBalance: {
            increment: walletTransaction.amount,
          },
        },
      });

      // --------------------------------------------------
      // MARK LEDGER SUCCESS
      // --------------------------------------------------

      const updatedTransaction =
        await tx.walletTransaction.update({
          where: {
            id: walletTransaction.id,
          },

          data: {
            status: "SUCCESS",

            balanceBefore,

            balanceAfter:
              updatedWallet.availableBalance,

            razorpayPaymentId,

            razorpaySignature:
              razorpaySignature || undefined,

            referenceId: razorpayPaymentId,
          },
        });

      return {
        alreadyProcessed: false,
        wallet: updatedWallet,
        transaction: updatedTransaction,
      };
    });
  } catch (error) {
    // Prisma transaction rollback होने पर PROCESSING भी
    // rollback होकर पुराने PENDING state में रहेगा.
    throw error;
  }
}