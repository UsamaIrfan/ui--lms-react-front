import {
  filesVercelBlobControllerUploadFileV1,
  getFilesVercelBlobControllerUploadFileV1Url,
} from "./generated/endpoints/files/files";
import { customFetch } from "./generated/custom-fetch";
import { FileEntity } from "./types/file-entity";

type S3PresignedResponse = {
  data: {
    file: FileEntity;
    uploadSignedUrl: string;
  };
  status: number;
  headers: Headers;
};

/**
 * Upload a file using the appropriate driver.
 * - `s3-presigned`: JSON POST for signed URL, then PUT file to S3
 * - Other drivers: FormData POST via generated endpoint
 *
 * @returns The uploaded file entity
 */
export async function uploadFile(file: File): Promise<FileEntity> {
  if (process.env.NEXT_PUBLIC_FILE_DRIVER === "s3-presigned") {
    const result = await customFetch<S3PresignedResponse>(
      getFilesVercelBlobControllerUploadFileV1Url(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
        }),
      }
    );

    await fetch(result.data.uploadSignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    return result.data.file;
  }

  const result = await filesVercelBlobControllerUploadFileV1({ file });
  return result.data.file;
}
