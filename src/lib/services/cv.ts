/**
 * CV Storage Service — Issue #13
 *
 * Provider-agnostic interface for CV file storage. Consuming code
 * (upload/download/delete flows) calls these methods and never
 * knows whether the backend is S3, GDrive, local disk, or anything else.
 *
 * When the storage decision is finalised, only the implementation
 * below changes — all call sites remain untouched.
 */

export interface CVFileMetadata {
  /** Original filename as uploaded by the student */
  fileName: string;
  /** MIME type (e.g. "application/pdf") */
  mimeType: string;
  /** User ID of the uploader — used for path namespacing */
  userId: string;
  /** Human-readable label the student assigns to this CV */
  label: string;
}

export interface CVStorageService {
  /** Upload a CV file and return the publicly-accessible URL */
  uploadFile(file: Buffer, metadata: CVFileMetadata): Promise<string>;

  /** Retrieve a CV file by its stored URL, returns the raw bytes */
  getFile(fileUrl: string): Promise<Buffer>;

  /** Delete a CV file from storage by its stored URL */
  deleteFile(fileUrl: string): Promise<void>;
}

// ─── Stub implementation (placeholder until storage decision) ─────

export const cvStorage: CVStorageService = {
  async uploadFile(_file: Buffer, metadata: CVFileMetadata): Promise<string> {
    console.warn("[CVStorageService] uploadFile stub called — no storage backend configured");
    return `https://placeholder.storage/${metadata.userId}/${metadata.fileName}`;
  },

  async getFile(_fileUrl: string): Promise<Buffer> {
    console.warn("[CVStorageService] getFile stub called — no storage backend configured");
    return Buffer.from("");
  },

  async deleteFile(_fileUrl: string): Promise<void> {
    console.warn("[CVStorageService] deleteFile stub called — no storage backend configured");
  },
};
