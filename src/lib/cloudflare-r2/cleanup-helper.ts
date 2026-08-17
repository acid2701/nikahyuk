import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getDynamicR2Client } from "./dynamic-config";

export async function deletePhysicalR2File(r2FileKey: string): Promise<void> {
  const { s3, config } = await getDynamicR2Client();

  const command = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: r2FileKey,
  });

  await s3.send(command);
}
