-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `razorpayOrderId` VARCHAR(191) NULL,
    ADD COLUMN `razorpayPaymentId` VARCHAR(191) NULL,
    ADD COLUMN `razorpaySignature` VARCHAR(191) NULL;
