-- CreateTable
CREATE TABLE `Kyc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `panNumber` VARCHAR(191) NULL,
    `aadhaarLast4` VARCHAR(191) NULL,
    `panDocumentUrl` VARCHAR(191) NULL,
    `aadhaarFrontUrl` VARCHAR(191) NULL,
    `aadhaarBackUrl` VARCHAR(191) NULL,
    `profilePhotoUrl` VARCHAR(191) NULL,
    `status` ENUM('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'NOT_SUBMITTED',
    `rejectionReason` TEXT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `verifiedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Kyc_userId_key`(`userId`),
    INDEX `Kyc_status_idx`(`status`),
    INDEX `Kyc_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kyc`
ADD CONSTRAINT `Kyc_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;