import { Buffer } from "buffer";

import { IApiData, Schema } from "./ApiTypes";
import { compress, decompress } from "../utils/LzmaUtils";

export async function encodeData(apiData: IApiData): Promise<string> {
  const version = 1;

  const pack = JSON.stringify({ payload: apiData });
  const buffer = await compress(pack);
  const base64 = Buffer.from(buffer).toString("base64");
  const code = base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "%3d");
  const hash = `${version}~${code}`;
  return hash;
}

export async function decodeData(hash: string): Promise<IApiData> {
  const version = parseInt(hash.substring(0, 1));
  console.assert(version === 1, `invalid hash version: ${version}`);

  const code = hash.substring(2);
  const base64 = code.replaceAll("-", "+").replaceAll("_", "/").replaceAll("%3d", "=");
  const buffer = Buffer.from(base64, "base64");
  const pack = await decompress(buffer);
  const data = JSON.parse(pack) as { version: number; payload: IApiData };
  await Schema.validateAsync(data.payload);
  return data.payload;
}
