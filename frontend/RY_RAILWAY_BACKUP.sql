-- MySQL dump 10.13  Distrib 8.4.11, for Win64 (x86_64)
--
-- Host: ballast.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Transaction`
--

DROP TABLE IF EXISTS `Transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Transaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `transactionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `referenceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `razorpayOrderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpayPaymentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpaySignature` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Transaction_transactionId_key` (`transactionId`),
  KEY `Transaction_userId_idx` (`userId`),
  KEY `Transaction_service_idx` (`service`),
  KEY `Transaction_status_idx` (`status`),
  KEY `Transaction_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Transaction`
--

LOCK TABLES `Transaction` WRITE;
/*!40000 ALTER TABLE `Transaction` DISABLE KEYS */;
INSERT INTO `Transaction` VALUES (1,1,'RYPR-1788093463891-a6ec1311','MOBILE_PREPAID','PREPAID_RECHARGE','Mobile: 8109431008, Operator: airtel, Circle: uttar-pradesh',99.00,'RECHARGE_SUCCESS','8109431008','RAZORPAY','2026-08-30 12:37:43.989','2026-08-30 12:37:43.892','order_TVz3VI0Lw5tgsZ','pay_TVz3k5tZJ06k2r','f47af62026b9188015af6c08ca6d1bf7d59a93a31fed048dbfe60137a57b11ac'),(2,1,'BUS-1788244405037-4947','BUS_BOOKING','TRAVEL','{\"bookingType\":\"BUS_BOOKING\",\"bus\":{\"busId\":\"BUS001\",\"operator\":\"UPSRTC\",\"busType\":\"AC Seater\",\"from\":\"lalitpur\",\"to\":\"bhopal\",\"journeyDate\":\"2026-09-09\",\"departure\":\"06:30 AM\",\"arrival\":\"12:30 PM\",\"duration\":\"6h 00m\"},\"passenger\":{\"name\":\"pravesh\",\"age\":30,\"gender\":\"MALE\",\"mobile\":\"9856922222\",\"seatNumber\":\"1\"},\"payment\":{\"totalAmount\":670,\"currency\":\"INR\"}}',670.00,'SUCCESS','BUS001','RAZORPAY','2026-09-01 06:33:25.221','2026-09-01 06:33:25.037','order_TWfuriCI34tv4s','pay_TWfuzzG0rqNtwq','6295fc8518bcb09a6190eef7c00fde154642112133a42403977defbd516b220d'),(3,1,'BUS-1788244406218-5318','BUS_BOOKING','TRAVEL','{\"bookingType\":\"BUS_BOOKING\",\"bus\":{\"busId\":\"BUS001\",\"operator\":\"UPSRTC\",\"busType\":\"AC Seater\",\"from\":\"lalitpur\",\"to\":\"bhopal\",\"journeyDate\":\"2026-09-09\",\"departure\":\"06:30 AM\",\"arrival\":\"12:30 PM\",\"duration\":\"6h 00m\"},\"passenger\":{\"name\":\"pravesh\",\"age\":30,\"gender\":\"MALE\",\"mobile\":\"9856922222\",\"seatNumber\":\"1\"},\"payment\":{\"totalAmount\":670,\"currency\":\"INR\"}}',670.00,'PENDING','BUS001','UPSRTC','2026-09-01 06:33:26.395','2026-09-01 06:33:26.218',NULL,NULL,NULL),(4,2,'RYPR-1788513828047-e159668d','MOBILE_PREPAID','PREPAID_RECHARGE','Mobile: 8109431008, Operator: jio, Circle: uttar-pradesh',99.00,'RECHARGE_SUCCESS','8109431008','RAZORPAY','2026-09-04 09:23:48.145','2026-09-04 09:23:48.048','order_TXuQDnyphlHcz6','pay_TXuQMtwfTjUVpH','1b0a5b63aa551c0ae7267c74f35a0307231eb3448675eac4b2d4407b9ae39bc8'),(5,1,'RYPR-1788529365463-62a17b34','MOBILE_PREPAID','PREPAID_RECHARGE','{\"bookingType\":\"MOBILE_PREPAID_RECHARGE\",\"recharge\":{\"mobile\":\"8859332565\",\"operator\":\"airtel\",\"circle\":\"uttar-pradesh\"},\"payment\":{\"amount\":99,\"currency\":\"INR\"}}',99.00,'RECHARGE_SUCCESS','8859332565','RAZORPAY','2026-09-04 13:42:45.561','2026-09-04 13:42:45.464','order_TXypms7TUuQjfU','pay_TXypuwUupN7900','6e121a237d3e7005418cc8ff88ebc85d6d6a64f00ec32712da2f8b64a010dafc'),(6,1,'RYPP-1788530594560-c2155579','MOBILE_POSTPAID','POSTPAID_BILL','{\"bookingType\":\"MOBILE_POSTPAID_BILL\",\"bill\":{\"mobile\":\"8564564234\",\"operator\":\"airtel\"},\"payment\":{\"amount\":99,\"currency\":\"INR\"}}',99.00,'POSTPAID_SUCCESS','8564564234','RAZORPAY','2026-09-04 14:03:14.658','2026-09-04 14:03:46.074','order_TXzBQf08PJ0eaV','pay_TXzBXKZvi00nPe','87f409e39ee9eb233cc74ef4d5e7f3c1b44e15842abd9f9784b08db7fb22e46c'),(7,1,'RYDTH-1788531961812-9e5756d4','DTH_RECHARGE','DTH','{\"bookingType\":\"DTH_RECHARGE\",\"dth\":{\"customerId\":\"4545454455\",\"operator\":\"airtel-digital-tv\"},\"payment\":{\"amount\":50,\"currency\":\"INR\"}}',50.00,'PENDING','4545454455','airtel-digital-tv','2026-09-04 14:26:01.921','2026-09-04 14:26:01.813',NULL,NULL,NULL),(8,1,'RYDTH-1788537473073-28d96bdc','DTH_RECHARGE','DTH','{\"bookingType\":\"DTH_RECHARGE\",\"dth\":{\"customerId\":\"64454154646\",\"operator\":\"airtel-digital-tv\"},\"payment\":{\"amount\":26,\"currency\":\"INR\"}}',26.00,'DTH_SUCCESS','64454154646','RAZORPAY','2026-09-04 15:57:53.181','2026-09-04 15:58:30.110','order_TY18WWwlmySuFP','pay_TY18j9LDM1m7tm','ff23f4159b6d35a2a6d6ab566fa2051ad2bc3f973977b89a84b4e665dda95021'),(9,1,'RYELE-1788539098817-51dc1187','ELECTRICITY_BILL','ELECTRICITY','{\"bookingType\":\"ELECTRICITY_BILL_PAYMENT\",\"electricity\":{\"consumerNumber\":\"0401114000\",\"operator\":\"uppcl\"},\"payment\":{\"amount\":99.97,\"currency\":\"INR\"}}',99.97,'ELECTRICITY_SUCCESS','0401114000','RAZORPAY','2026-09-04 16:24:58.918','2026-09-04 16:25:44.357','order_TY1bG4lRW7Y4pn','pay_TY1bVlVaiqRg6J','fc3c401c7246e59392def38e3e8e5bf630fce33a1a698a924b217fac54031d07'),(10,2,'RYFTG-1789318215936-1a3aa2d4','FASTAG_RECHARGE','FASTAG','{\"bookingType\":\"FASTAG_RECHARGE\",\"fastag\":{\"vehicleNumber\":\"UP94AE2563\",\"provider\":\"HDFC_BANK\"},\"payment\":{\"amount\":100,\"currency\":\"INR\"}}',100.00,'PENDING','UP94AE2563','HDFC_BANK','2026-09-13 16:50:16.038','2026-09-13 16:50:15.936',NULL,NULL,NULL),(11,1,'RYPR-1789572536538-2f6371f7','MOBILE_PREPAID','PREPAID_RECHARGE','{\"bookingType\":\"MOBILE_PREPAID_RECHARGE\",\"recharge\":{\"mobile\":\"8109423141\",\"operator\":\"airtel\",\"circle\":\"uttar-pradesh\"},\"payment\":{\"amount\":99,\"currency\":\"INR\"}}',99.00,'RECHARGE_SUCCESS','8109423141','RAZORPAY','2026-09-16 15:28:56.745','2026-09-16 15:28:56.539','order_Tcl3lTiJ7Tqkhz','pay_Tcl42x8rDOQy6D','bced2bf092b158405fba748bf1acbf7b2a76ff64bf0491bdcf8a08d4e2fa2706'),(12,1,'RYDTH-1789573747411-31dcfa12','DTH_RECHARGE','DTH','{\"bookingType\":\"DTH_RECHARGE\",\"dth\":{\"customerId\":\"125636124552202\",\"operator\":\"airtel-digital-tv\"},\"payment\":{\"amount\":100,\"currency\":\"INR\"}}',100.00,'DTH_SUCCESS','125636124552202','RAZORPAY','2026-09-16 15:49:07.513','2026-09-16 15:49:56.200','order_TclOrk7KytXdnK','pay_TclP4NoH7RamW7','3c26794b2f12c266a9d03c963ab8cd31f6ed5e5fa5f5d00b627391709c663390'),(13,1,'BUS-1789836277805-1560','BUS_BOOKING','TRAVEL','{\"bookingType\":\"BUS_BOOKING\",\"bus\":{\"busId\":\"BUS001\",\"operator\":\"UPSRTC\",\"busType\":\"AC Seater\",\"from\":\"lucknow\",\"to\":\"delhi\",\"journeyDate\":\"2026-09-20\",\"departure\":\"06:30 AM\",\"arrival\":\"12:30 PM\",\"duration\":\"6h 00m\"},\"passenger\":{\"name\":\"sdadds\",\"age\":30,\"gender\":\"MALE\",\"mobile\":\"8263333333\",\"seatNumber\":\"1\"},\"payment\":{\"totalAmount\":670,\"currency\":\"INR\"}}',670.00,'PENDING','BUS001','RAZORPAY','2026-09-19 16:44:37.997','2026-09-19 16:44:37.805','order_TdxwmuT7sROA0P',NULL,NULL);
/*!40000 ALTER TABLE `Transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `mobile` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('RETAILER','DISTRIBUTOR','MASTER_DISTRIBUTOR','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RETAILER',
  `userCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_mobile_key` (`mobile`),
  UNIQUE KEY `User_userCode_key` (`userCode`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,'Ajay sahu','yandr.computer2026@gmail.com','$2b$10$Tv3hWjQJdzJDfkE4BPvguuY5Kyy2D1.Ronyp1ZMtqVB54IbtydwJW','2026-08-30 11:22:58.193','2026-08-30 11:22:58.193','7355399347','ADMIN',NULL),(2,'AJAY SAHU','ajaysbi31@gmail.com','$2b$10$XJ4tiTNuwUKt1gzs8XWOcuaXpZGkuUaskxgR7yjFea8xXM9JaoS/6','2026-09-04 09:22:36.299','2026-09-14 17:48:21.389','8109431008','RETAILER',NULL);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Wallet`
--

DROP TABLE IF EXISTS `Wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Wallet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `availableBalance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `lockedBalance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('ACTIVE','BLOCKED','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Wallet_userId_key` (`userId`),
  KEY `Wallet_status_idx` (`status`),
  CONSTRAINT `Wallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Wallet`
--

LOCK TABLES `Wallet` WRITE;
/*!40000 ALTER TABLE `Wallet` DISABLE KEYS */;
INSERT INTO `Wallet` VALUES (1,2,100.00,0.00,'ACTIVE','2026-09-13 08:26:28.631','2026-09-13 09:06:04.089'),(2,1,200.00,0.00,'ACTIVE','2026-09-21 17:18:07.745','2026-09-23 02:41:43.991');
/*!40000 ALTER TABLE `Wallet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WalletTransaction`
--

DROP TABLE IF EXISTS `WalletTransaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WalletTransaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transactionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `walletId` int NOT NULL,
  `userId` int NOT NULL,
  `type` enum('CREDIT','DEBIT','HOLD','RELEASE','REFUND','ADJUSTMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` enum('ADD_MONEY','SERVICE_PAYMENT','REFUND','BANK_SETTLEMENT','ADMIN_ADJUSTMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `balanceBefore` decimal(12,2) NOT NULL,
  `balanceAfter` decimal(12,2) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `referenceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `razorpayOrderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpayPaymentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpaySignature` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `WalletTransaction_transactionId_key` (`transactionId`),
  KEY `WalletTransaction_walletId_idx` (`walletId`),
  KEY `WalletTransaction_userId_idx` (`userId`),
  KEY `WalletTransaction_type_idx` (`type`),
  KEY `WalletTransaction_source_idx` (`source`),
  KEY `WalletTransaction_status_idx` (`status`),
  KEY `WalletTransaction_createdAt_idx` (`createdAt`),
  CONSTRAINT `WalletTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WalletTransaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WalletTransaction`
--

LOCK TABLES `WalletTransaction` WRITE;
/*!40000 ALTER TABLE `WalletTransaction` DISABLE KEYS */;
INSERT INTO `WalletTransaction` VALUES (1,'RYWAL-1789290326237-84948',1,2,'CREDIT','ADD_MONEY',100.00,0.00,100.00,'SUCCESS','pay_TbSv8Is26u3nSA','{\"bookingType\":\"WALLET_ADD_MONEY\",\"payment\":{\"amount\":100,\"currency\":\"INR\"}}','order_TbSupHzUq0xNwM','pay_TbSv8Is26u3nSA','c7423526f67685006e8ef2b1a78563531ca6896be78f39346e8cd2dc1159a8eb','2026-09-13 09:05:27.113','2026-09-13 09:06:04.713'),(2,'RYWAL-1790011144067-87403',2,1,'CREDIT','ADD_MONEY',10.00,0.00,0.00,'PENDING','order_TelbEDn3rKEtA6','{\"bookingType\":\"WALLET_ADD_MONEY\",\"payment\":{\"amount\":10,\"currency\":\"INR\"}}','order_TelbEDn3rKEtA6',NULL,NULL,'2026-09-21 17:19:04.918','2026-09-21 17:19:04.918'),(3,'RYWAL-1790100205154-78331',2,1,'CREDIT','ADD_MONEY',10.00,0.00,0.00,'PENDING','order_TfAtCRh3BVYXMV','{\"bookingType\":\"WALLET_ADD_MONEY\",\"payment\":{\"amount\":10,\"currency\":\"INR\"}}','order_TfAtCRh3BVYXMV',NULL,NULL,'2026-09-22 18:03:26.042','2026-09-22 18:03:26.042'),(4,'RYWAL-1790100277921-88533',2,1,'CREDIT','ADD_MONEY',10.00,0.00,0.00,'PENDING','order_TfAuTp0P6A6wJv','{\"bookingType\":\"WALLET_ADD_MONEY\",\"payment\":{\"amount\":10,\"currency\":\"INR\"}}','order_TfAuTp0P6A6wJv',NULL,NULL,'2026-09-22 18:04:38.758','2026-09-22 18:04:38.758'),(5,'RYWAL-1790100279828-22650',2,1,'CREDIT','ADD_MONEY',100.00,0.00,100.00,'SUCCESS','pay_TfAulaNgSbbNc4','{\"bookingType\":\"WALLET_ADD_MONEY\",\"payment\":{\"amount\":100,\"currency\":\"INR\"}}','order_TfAuVSlAF09Gsu','pay_TfAulaNgSbbNc4','4df62178699561a713600b338f47503cdc9a0637a6b9081e3cee1c7df80ed08e','2026-09-22 18:04:40.249','2026-09-22 18:05:22.675'),(6,'RYWAL-1790131203052-28313',2,1,'CREDIT','ADD_MONEY',100.00,100.00,200.00,'SUCCESS','pay_TfJhpaBzlOB6mJ','{\"bookingType\":\"WALLET_ADD_MONEY\",\"payment\":{\"amount\":100,\"currency\":\"INR\"}}','order_TfJgvyWW19bKnO','pay_TfJhpaBzlOB6mJ','3b61f0425e5a838581e5e166eb5db202ca020d6f98338849d65c1ca865ebac68','2026-09-23 02:40:03.893','2026-09-23 02:41:44.519');
/*!40000 ALTER TABLE `WalletTransaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('0acaeeff-2c40-4c4e-b671-5c01ea74917f','f47f7d91735ee9cca22268058bd28f9eb48fd97e75f151ff4aa0df044555c065','2026-09-13 08:23:41.164','20260913121000_add_wallet_system',NULL,NULL,'2026-09-13 08:23:39.350',1),('254853db-eeb4-4115-841d-310c46ae4120','fc8d13aaaf80a2d7ad2372eaf1e6e38337f2f627f55e998e19c4511138251195','2026-09-13 08:18:11.419','20260904183000_add_user_role','',NULL,'2026-09-13 08:18:11.419',0),('5fad14af-716e-46a6-a625-7d0d6c45c9b8','5add1d3a9aed672f68a068f642131228fbd383acba6056650418fc86851bf9a4',NULL,'20260816105402_increase_transaction_description','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260816105402_increase_transaction_description\n\nDatabase error code: 1146\n\nDatabase error:\nTable \'railway.transaction\' doesn\'t exist\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260816105402_increase_transaction_description\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20260816105402_increase_transaction_description\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255','2026-08-30 11:08:33.292','2026-08-30 11:05:49.052',0),('80eeb646-3bfd-42fa-98a5-8f3ac7a757b5','756c7024c8a72358f3e3274d72ac67097f29211ef8c0e1d10b09bf6dd83981a5','2026-08-30 11:01:56.741','20260814042930_add_transaction',NULL,NULL,'2026-08-30 11:01:55.806',1),('90f8a772-ec41-4d90-9042-9610f5be76fc','a7b9a4d96e8e1a9bdef4d15024f13dd1a60696570b4f6861140bf95c2346c917','2026-08-30 11:05:48.501','20260814164630_add_razorpay_fields',NULL,NULL,'2026-08-30 11:05:47.064',1),('977276bd-a825-4e0a-8982-1cc8a93609c6','35319d6ca16fb7c644fd04f8e8ca94c34d77c3ff3b25d25febf8927a3909c8f4',NULL,'20260814164630_add_razorpay_fields','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260814164630_add_razorpay_fields\n\nDatabase error code: 1146\n\nDatabase error:\nTable \'railway.transaction\' doesn\'t exist\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260814164630_add_razorpay_fields\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20260814164630_add_razorpay_fields\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255','2026-08-30 11:05:32.279','2026-08-30 11:01:57.042',0),('98d38bd4-6a7f-4999-9d83-ad55435d5d3b','a53f4c3f74e561a6b75a92e9c8abe0ee242dd6da98db259239d9fc3219c556c3','2026-08-30 11:01:55.193','20260813154921_add_mobile',NULL,NULL,'2026-08-30 11:01:53.629',1),('c5741aa8-5938-4084-b35a-708fe1d79c82','bf4d4089c40a35c033852adaf6c6317c79813438535d2b4fbb27665cc2e58242','2026-08-30 11:08:48.245','20260816105402_increase_transaction_description',NULL,NULL,'2026-08-30 11:08:46.743',1),('e1438160-c7de-44eb-a806-8dd56331b7d3','405ab847a9a65091a7078920ee642f9bd97a36ee4e9e14af1656f28c9a2823ee',NULL,'20260813154921_add_mobile','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260813154921_add_mobile\n\nDatabase error code: 1146\n\nDatabase error:\nTable \'railway.user\' doesn\'t exist\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260813154921_add_mobile\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20260813154921_add_mobile\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255','2026-08-30 11:00:57.463','2026-08-30 10:53:15.938',0),('eb57de90-b34c-44b6-97a2-e44bef0b4e03','30ac152c0ce0772e888ef993c2b493c179d720105c02587fbe6a338e2550e3c3','2026-08-30 10:53:15.293','20260813154519_add_user',NULL,NULL,'2026-08-30 10:53:13.210',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'railway'
--

--
-- Dumping routines for database 'railway'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-23  9:01:39
