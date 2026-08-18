-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `referenceId` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Transaction_transactionId_key`(`transactionId`),
    INDEX `Transaction_userId_idx`(`userId`),
    INDEX `Transaction_service_idx`(`service`),
    INDEX `Transaction_status_idx`(`status`),
    INDEX `Transaction_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
