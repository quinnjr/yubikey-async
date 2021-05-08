# yubikey-async

A Promise-based client library for verifying Yubikey OTPs with Yubikey's API servers.

Based on the original work of [node-yubikey](https://github.com/jedp/node-yubikey).

## Usage

```js
import { Yubikey } from 'yubikey-async';

const otp = ...;

const auth = new Yubikey(process.env.YUBIKEY_CLIENT_ID, process.env.YUBIKEY_CLIENT_SECRET);

const isValid = await auth.verify(otp);

...
```

## Testing

Please use the `test.ts` file with `ts-node` and a valid Yubikey device.

```sh
npm test -- --otp <otp>
```

## License

See: [License](./LICENSE.md);
