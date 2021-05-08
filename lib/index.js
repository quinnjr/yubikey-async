(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "querystring", "axios", "crypto"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Yubikey = exports.YubikeyOptions = void 0;
    const tslib_1 = require("tslib");
    const querystring_1 = tslib_1.__importDefault(require("querystring"));
    const axios_1 = tslib_1.__importDefault(require("axios"));
    const crypto_1 = tslib_1.__importDefault(require("crypto"));
    /**
     * Yubico Validation Protocol v2.0
     * https://developers.yubico.com/yubikey-val/Validation_Protocol_V2.0.html
     */
    /**
     * Map of responses from the Yubikey API server.
     */
    const Status = new Map([
        ['OK', 'The OTP is valid.'],
        ['BAD_OTP', 'The OTP is invalid format.'],
        ['REPLAYED_OTP', 'The OTP has already been seen by the service.'],
        ['BAD_SIGNATURE', 'The HMAC signature verification failed.'],
        ['MISSING_PARAMETER', 'The request lacks a parameter.'],
        ['NO_SUCH_CLIENT', 'The request id does not exist.'],
        ['OPERATION_NOT_ALLOWED', 'The request id is not allowed to verify OTPs.'],
        ['BACKEND_ERROR', 'Unexpected error in our server. Please contact Yubico if you see this error.'],
        ['NOT_ENOUGH_ANSWERS', 'Server could not get requested number of syncs before timeout.'],
        ['REPLAYED_REQUEST', 'Server has seen the OTP/Nonce combination before.']
    ]);
    /**
     * Parameters to send to the Yubico API server.
     */
    class Params {
        constructor(nonce, otp, id) {
            this.nonce = nonce;
            this.otp = otp;
            this.id = id;
        }
    }
    /**
     * Options for the Yubikey verification request.
     *
     * @todo
     * @export
     * @class YubikeyOptions
     */
    class YubikeyOptions {
        constructor() {
            this.timestamp = 0;
            this.sl = 'secure';
            this.timeout = 10;
        }
    }
    exports.YubikeyOptions = YubikeyOptions;
    /**
     * Yubikey verification class.
     *
     * @export
     * @class Yubikey
     */
    class Yubikey {
        /**
         * Class constructor
         * @param clientId Client ID for the API request.
         * @param clientSecret Client secret for the API request.
         */
        constructor(clientId, clientSecret) {
            this.clientId = clientId || process.env.YUBIKEY_CLIENT_ID;
            this.clientSecret = clientSecret || process.env.YUBIKEY_CLIENT_SECRET;
        }
        /**
         * Verification of a Yubikey OTP by the Yubico API.
         * @param otp One-time password generated by a Yubikey.
         * @param options Additional options for the request.
         * @returns
         */
        async verify(otp, options) {
            const nonce = await new Promise((resolve, reject) => {
                crypto_1.default.randomBytes(40, (err, buf) => {
                    if (err)
                        reject(err);
                    return resolve(buf.toString('hex').slice(0, 40));
                });
            });
            if (!this.clientId) {
                throw new Error("Client ID was not specified");
            }
            if (!this.clientSecret) {
                throw new Error("Client secret was not specified");
            }
            const params = new Params(nonce, otp, this.clientId);
            const signature = this.generateSignature(params);
            Object.defineProperty(params, 'h', {
                value: signature,
                enumerable: true
            });
            const query = this.querify(params, true);
            const uri = `https://api.yubico.com/wsapi/2.0/verify?${query}`;
            let response = await axios_1.default.get(uri);
            if (response.status != 200) {
                throw new Error(`Yubico server returned error ${response.status}: ${response.statusText}`);
            }
            response.data = this.parseResponseBody(response.data);
            if (response.data.status !== 'OK') {
                throw new Error(`Yubico server responded with error: ${Status.get(response.data.status)}`);
            }
            if (response.data.otp !== params.otp) {
                throw new Error('Response OTP does not match request OTP');
            }
            if (response.data.nonce !== params.nonce) {
                throw new Error('Response nonce does not match request nonce');
            }
            return true;
        }
        /**
         * Generate a HMAC signature for the request.
         * @param params The parameters of the request.
         * @returns An HMAC signature of the parameters.
         */
        generateSignature(params) {
            if (this.clientSecret) {
                const buf = Buffer.from(this.clientSecret, 'base64');
                const hmac = crypto_1.default.createHmac('sha1', buf);
                return hmac.update(this.querify(params)).digest('base64');
            }
            else {
                throw new Error('Failed to generate HMAC signature');
            }
        }
        /**
         * Convert a string body response to a valid JSON Object
         *
         * @param body The string response body
         * @returns A JSON object of key-value pairs
         */
        parseResponseBody(body) {
            let params = {};
            body.trim()
                .split('\n')
                .forEach((line) => {
                const match = line.trim().match(/^(\w+)=(.*)$/);
                if (match) {
                    Object.defineProperty(params, match[1], {
                        value: match[2],
                        enumerable: true
                    });
                }
            });
            return params;
        }
        /**
         * Creates a valid query string from the input request parameters,
         * escaping HTML entities as needed.
         * @param params The request parameters
         * @param escape Whether to escape HTML entities
         * @returns A stringified representation of the request query
         */
        querify(params, escape = false) {
            return Object.keys(params)
                .sort()
                .map((key) => {
                if (escape) {
                    let d = {};
                    Object.defineProperty(d, key, {
                        value: params[key],
                        enumerable: true
                    });
                    return querystring_1.default.stringify(d);
                }
                else {
                    return `${key}=${params[key]}`;
                }
            })
                .join('&');
        }
    }
    exports.Yubikey = Yubikey;
});