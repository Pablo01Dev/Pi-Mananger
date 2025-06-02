import { Dropbox } from 'dropbox';
import dotenv from 'dotenv';

dotenv.config();

const dropbox = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch: fetch
});

export default dropbox;
