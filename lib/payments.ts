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
  wireInstructions: `Tesla Motors Marketplace
Beneficiary / Account name: Tesla Motors Marketplace
Bank name: JPMorgan Chase Bank, N.A.
Bank address: 270 Park Avenue, New York, NY 10017, USA

Routing number (ACH): 021000021
Wire routing (domestic): 021000021
SWIFT / BIC (international): CHASUS33
Account number: Contact your advisor or use the reference on your order confirmation

Payment reference (required): Your order number (e.g. TM-XXXXXXXX)
Currency: USD

Important
• Include your full order reference in the wire memo / reference field so we can match payment to your order.
• Domestic wires typically clear in 1 business day; international wires may take 2–5 business days.
• Do not send cash. Bank fees charged by your institution are your responsibility.
• After you send the wire, tap “I’ve made payment” on your order page (if shown) or email info@teslamotors.sale with the transfer confirmation.

Questions: info@teslamotors.sale · (347) 508-6807
235 East 42nd Street, New York, NY 10017`,
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
