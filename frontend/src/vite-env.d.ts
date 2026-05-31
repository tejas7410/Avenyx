/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MONOLITH_URL: string;
  readonly VITE_BASKET_URL: string;
  readonly VITE_PAYMENT_URL: string;
  readonly VITE_ORDER_URL: string;
  readonly VITE_INVOICE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
