import type { S3Handler } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Jimp } from "jimp";
import type { Readable } from "stream";

const s3 = new S3Client({});

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

export const handler: S3Handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Only process images
    if (!/\.(jpe?g|png|webp|gif)$/i.test(key)) {
      console.log(`Skipping non-image object: ${key}`);
      continue;
    }

    console.log(`Optimizing image: ${bucket}/${key}`);

    // 1. Download original
    const getRes = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const bodyStream = getRes.Body as Readable | undefined;
    if (!bodyStream) {
      console.warn(`No body for object: ${key}`);
      continue;
    }

    const originalBuffer = await streamToBuffer(bodyStream);

    // 2. Use Jimp v1 API to resize/compress
    const image = await Jimp.read(originalBuffer);

    // width = 400, keep aspect ratio (just set w)
    image.resize({ w: 400 });

    // getBuffer is async in v1 and takes mime + options (quality here)
    const optimizedBuffer = await image.getBuffer("image/jpeg", {
      quality: 75,
    });

    // 3. Overwrite original
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: optimizedBuffer,
        ContentType: "image/jpeg",
        Metadata: {
          optimized: "true",
        },
      })
    );

    console.log(`Optimized image saved as: ${key}`);
  }
};
