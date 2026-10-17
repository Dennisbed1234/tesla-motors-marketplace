export type CryptoNetwork = {
  id: string;
  label: string;
  address: string;
};

export type PaymentMethodsConfig = {
  creditDebitEnabled: boolean;
  wireEnabled: boolean;
  cryptoEnabled: boolean;
  wireInstructions: string;
  crypto: CryptoNetwork[];
};

export const DEFAULT_PAYMENT_METHODS: PaymentMethodsConfig = {
  creditDebitEnabled: true,
  wireEnabled: true,
  cryptoEnabled: true,
  wireInstructions:
    'Bank wire details will be provided by your advisor after order confirmation. Reference your order number on the transfer.',
  crypto: [
    {
      id: 'btc',
      label: 'BTC',
      address: '18WGuvU1apn6f2h5uZWF6biS3MFaZ5Pj9d',
    },
    {
      id: 'usdt-erc20',
      label: 'USDT (ERC20)',
      address: '0xd134ebcb7060e22f2c6454df28c810dd33a02f5c',
    },
    {
      id: 'usdt-trc20',
      label: 'USDT (TRC20)',
      address: 'TCeddcjw9VzBsMZFbA9mACfuQLzdAkjwA5',
    },
    {
      id: 'usdc-erc20',
      label: 'USDC (ERC20)',
      address: '0xd134ebcb7060e22f2c6454df28c810dd33a02f5c',
    },
    {
      id: 'usdc-bnb',
      label: 'USDC (BNB)',
      address: '0xd134ebcb7060e22f2c6454df28c810dd33a02f5c',
    },
  ],
};

export const PAYMENT_METHODS_KEY = 'payment_methods';
