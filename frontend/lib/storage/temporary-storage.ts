import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type {
  StorageProvider,
  StorageUploadInput,
  StorageUploadResult,
} from "./storage";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getStorageConfig() {
  return {
    bucket: getRequiredEnv("KYC_STORAGE_BUCKET"),
    region: getRequiredEnv("KYC_STORAGE_REGION"),
    endpoint: getRequiredEnv("KYC_STORAGE_ENDPOINT"),
    accessKeyId: getRequiredEnv("KYC_STORAGE_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("KYC_STORAGE_SECRET_ACCESS_KEY"),
  };
}

function createClient() {
  const config = getStorageConfig();

  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

export class TemporaryStorageProvider implements StorageProvider {
  async upload(
    input: StorageUploadInput
  ): Promise<StorageUploadResult> {
    const config = getStorageConfig();
    const client = createClient();

    const safeFileName = sanitizeFileName(input.file.name);

    const key = [
      "kyc",
      String(input.userId),
      input.documentType.toLowerCase(),
      `${crypto.randomUUID()}-${safeFileName}`,
    ].join("/");

    const fileBuffer = Buffer.from(
      await input.file.arrayBuffer()
    );

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: input.file.type || "application/octet-stream",
      })
    );

    return {
      key,
      fileName: input.file.name,
      contentType:
        input.file.type || "application/octet-stream",
      size: input.file.size,
    };
  }

  async delete(key: string): Promise<void> {
    const config = getStorageConfig();
    const client = createClient();

    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      })
    );
  }

  async getPrivateUrl(key: string): Promise<string> {
    const config = getStorageConfig();
    const client = createClient();

    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    return getSignedUrl(client, command, {
      expiresIn: 300,
    });
  }
}