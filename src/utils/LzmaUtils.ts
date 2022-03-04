import { compress as lzmaCompress, decompress as lzmaDecompress } from "@blu3r4y/lzma";

export async function compress(data: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    lzmaCompress(data, 1, (result: Uint8Array, err: any) => {
      if (err) reject("LZMAError: can not compress data\n\n" + err.toString());
      else resolve(result);
    });
  });
}

export async function decompress(data: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    lzmaDecompress(data, (result: string | Uint8Array, err: any) => {
      if (err) reject("LZMAError: can not decompress data\n\n" + err.toString());
      else resolve(result as string);
    });
  });
}
