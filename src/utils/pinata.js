import PinataSDK from '@pinata/sdk';

const pinata = PinataSDK(
  import.meta.env.VITE_PINATA_API_KEY,
  import.meta.env.VITE_PINATA_SECRET_API_KEY
);

export default pinata;
