import { encode as toonEncode, decode as toonDecode } from '@toon-format/toon';

/**
 * Converts a JavaScript object or array to TOON format string
 * @param data The data to encode
 * @returns TOON format string
 */
export function encode(data: any): string {
    return toonEncode(data);
}

/**
 * Converts a TOON format string back to JavaScript object
 * @param toonString The TOON format string to decode
 * @returns Parsed JavaScript object
 */
export function decode(toonString: string): any {
    return toonDecode(toonString);
}
