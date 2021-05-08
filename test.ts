declare var process: any;

import { Yubikey } from './lib';
import 'dotenv/config';

async function main(argv: string[]) {
  let otp: string = '';

  for(let i = 2; i < argv.length; i++) {
    if(argv[i] == '--otp') {
      otp = argv[i+1];
      i++;
    }
  }

  if(otp.length === 0) {
    throw new Error('No OTP was supplied');
  }

  if(!process.env.YUBIKEY_CLIENT_ID) {
    throw new Error('Client ID was not specified in the environment');
  }

  if(!process.env.YUBIKEY_CLIENT_SECRET) {
    throw new Error('Client secret was not specified in the environment');
  }

  const auth = new Yubikey(process.env.YUBIKEY_CLIENT_ID, process.env.YUBIKEY_CLIENT_SECRET);

  const isValid = await auth.verify(otp);

  if(!isValid) {
    throw new Error('OTP is invalid!');
  }

  console.log('Test passed!');
}

main(process.argv)
  .catch(console.error);
