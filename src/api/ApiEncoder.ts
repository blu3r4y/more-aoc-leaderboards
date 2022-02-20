import { Buffer } from "buffer";

import { IApiData, Schema } from "./ApiTypes";
import { compress, decompress } from "../utils/LzmaUtils";

export async function encodeData(apiData: IApiData): Promise<string> {
  const pack = JSON.stringify({ version: 1, payload: apiData });
  const buffer = await compress(pack);
  const base64 = Buffer.from(buffer).toString("base64");
  const code = base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "%3d");
  return code;
}

export async function decodeData(code: string): Promise<IApiData> {
  const base64 = code.replaceAll("-", "+").replaceAll("_", "/").replaceAll("%3d", "=");
  const buffer = Buffer.from(base64, "base64");
  const pack = await decompress(buffer);
  const data = JSON.parse(pack) as { version: number; payload: IApiData };
  console.assert(data.version === 1, `invalid data version: ${data.version}`);
  await Schema.validateAsync(data.payload);
  return data.payload;
}
