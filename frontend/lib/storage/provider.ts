import type {
  StorageProvider,
  StorageUploadInput,
  StorageUploadResult,
} from "./storage";

import { TemporaryStorageProvider } from "./temporary-storage";

class NotConfiguredStorageProvider implements StorageProvider {
  async upload(
    _input: StorageUploadInput
  ): Promise<StorageUploadResult> {
    throw new Error(
      "KYC document storage provider is not configured."
    );
  }

  async delete(_key: string): Promise<void> {
    throw new Error(
      "KYC document storage provider is not configured."
    );
  }

  async getPrivateUrl(_key: string): Promise<string> {
    throw new Error(
      "KYC document storage provider is not configured."
    );
  }
}

function createStorageProvider(): StorageProvider {
  const provider = process.env.KYC_STORAGE_PROVIDER
    ?.trim()
    .toLowerCase();

  if (provider === "backblaze") {
    return new TemporaryStorageProvider();
  }

  return new NotConfiguredStorageProvider();
}

export const storageProvider: StorageProvider =
  createStorageProvider();