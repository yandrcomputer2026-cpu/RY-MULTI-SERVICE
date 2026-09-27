export type KycDocumentType =
  | "PAN"
  | "AADHAAR_FRONT"
  | "AADHAAR_BACK"
  | "PROFILE_PHOTO";

export type StorageUploadInput = {
  file: File;
  userId: number;
  documentType: KycDocumentType;
};

export type StorageUploadResult = {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
};

export interface StorageProvider {
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;

  delete(key: string): Promise<void>;

  getPrivateUrl(key: string): Promise<string>;
}