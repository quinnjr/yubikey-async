/**
 * Options for the Yubikey verification request.
 *
 * @todo
 * @export
 * @class YubikeyOptions
 */
export declare class YubikeyOptions {
    timestamp: number;
    sl: string;
    timeout: number;
}
/**
 * Yubikey verification class.
 *
 * @export
 * @class Yubikey
 */
export declare class Yubikey {
    private clientId;
    private clientSecret;
    /**
     * Class constructor
     * @param clientId Client ID for the API request.
     * @param clientSecret Client secret for the API request.
     */
    constructor(clientId?: string, clientSecret?: string);
    /**
     * Verification of a Yubikey OTP by the Yubico API.
     * @param otp One-time password generated by a Yubikey.
     * @param options Additional options for the request.
     * @returns
     */
    verify(otp: string, options?: YubikeyOptions): Promise<boolean>;
    /**
     * Generate a HMAC signature for the request.
     * @param params The parameters of the request.
     * @returns An HMAC signature of the parameters.
     */
    private generateSignature;
    /**
     * Convert a string body response to a valid JSON Object
     *
     * @param body The string response body
     * @returns A JSON object of key-value pairs
     */
    private parseResponseBody;
    /**
     * Creates a valid query string from the input request parameters,
     * escaping HTML entities as needed.
     * @param params The request parameters
     * @param escape Whether to escape HTML entities
     * @returns A stringified representation of the request query
     */
    private querify;
}
