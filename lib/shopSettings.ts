import { pool } from "@/lib/db";

export type ShopSettings = {
  freeShippingThreshold: number;
  dhakaDeliveryCharge: number;
  outsideDhakaDeliveryCharge: number;
  enableCod: boolean;
  enableBkash: boolean;
  enableNagad: boolean;
  codInstruction: string;
  bkashNumber: string;
  bkashAction: "Send Money" | "Cash Out";
  bkashInstruction: string;
  nagadNumber: string;
  nagadAction: "Send Money" | "Cash Out";
  nagadInstruction: string;
};

const DEFAULT_SETTINGS: ShopSettings = {
  freeShippingThreshold: 2000,
  dhakaDeliveryCharge: 60,
  outsideDhakaDeliveryCharge: 120,
  enableCod: true,
  enableBkash: false,
  enableNagad: false,
  codInstruction: "Pay the delivery person when your order arrives.",
  bkashNumber: "",
  bkashAction: "Send Money",
  bkashInstruction: "",
  nagadNumber: "",
  nagadAction: "Send Money",
  nagadInstruction: "",
};

export async function ensureShopSettingsTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS shop_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  // Keep this migration non-destructive; existing orders and data are preserved.
  await pool.query(`ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS delivery_area VARCHAR(30) NOT NULL DEFAULT 'dhaka',
    ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NOT NULL DEFAULT 'cod',
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(30) NULL,
    ADD COLUMN IF NOT EXISTS customer_address TEXT NULL,
    ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(120) NULL,
    ADD COLUMN IF NOT EXISTS payment_note TEXT NULL,
    ADD COLUMN IF NOT EXISTS payment_account VARCHAR(40) NULL,
    ADD COLUMN IF NOT EXISTS payment_action VARCHAR(30) NULL,
    ADD COLUMN IF NOT EXISTS payment_instruction TEXT NULL`);
}

function decode<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  try { return JSON.parse(String(value)) as T; } catch { return fallback; }
}

function nonNegativeNumber(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function walletAction(value: unknown): "Send Money" | "Cash Out" {
  return String(value).toLowerCase() === "cash out" ? "Cash Out" : "Send Money";
}

export async function getShopSettings(): Promise<ShopSettings> {
  await ensureShopSettingsTable();
  const [rows]: any = await pool.query("SELECT setting_key, setting_value FROM shop_settings");
  const values = Object.fromEntries((rows || []).map((row: any) => [row.setting_key, row.setting_value]));

  return {
    freeShippingThreshold: nonNegativeNumber(decode(values.freeShippingThreshold, DEFAULT_SETTINGS.freeShippingThreshold), DEFAULT_SETTINGS.freeShippingThreshold),
    dhakaDeliveryCharge: nonNegativeNumber(decode(values.dhakaDeliveryCharge, DEFAULT_SETTINGS.dhakaDeliveryCharge), DEFAULT_SETTINGS.dhakaDeliveryCharge),
    outsideDhakaDeliveryCharge: nonNegativeNumber(decode(values.outsideDhakaDeliveryCharge, DEFAULT_SETTINGS.outsideDhakaDeliveryCharge), DEFAULT_SETTINGS.outsideDhakaDeliveryCharge),
    enableCod: decode(values.enableCod, DEFAULT_SETTINGS.enableCod) === true,
    enableBkash: decode(values.enableBkash, DEFAULT_SETTINGS.enableBkash) === true,
    enableNagad: decode(values.enableNagad, DEFAULT_SETTINGS.enableNagad) === true,
    codInstruction: String(decode(values.codInstruction, DEFAULT_SETTINGS.codInstruction)),
    bkashNumber: String(decode(values.bkashNumber, DEFAULT_SETTINGS.bkashNumber)),
    bkashAction: walletAction(decode(values.bkashAction, DEFAULT_SETTINGS.bkashAction)),
    bkashInstruction: String(decode(values.bkashInstruction, DEFAULT_SETTINGS.bkashInstruction)),
    nagadNumber: String(decode(values.nagadNumber, DEFAULT_SETTINGS.nagadNumber)),
    nagadAction: walletAction(decode(values.nagadAction, DEFAULT_SETTINGS.nagadAction)),
    nagadInstruction: String(decode(values.nagadInstruction, DEFAULT_SETTINGS.nagadInstruction)),
  };
}

export async function saveShopSettings(input: ShopSettings) {
  await ensureShopSettingsTable();
  const entries = Object.entries(input);
  for (const [key, value] of entries) {
    await pool.query(`INSERT INTO shop_settings (setting_key, setting_value) VALUES (?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`, [key, JSON.stringify(value)]);
  }
  return input;
}

export function calculateDeliveryCharge(settings: ShopSettings, subtotal: number, area: "dhaka" | "outside_dhaka") {
  if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) return 0;
  return area === "dhaka" ? settings.dhakaDeliveryCharge : settings.outsideDhakaDeliveryCharge;
}

export function normalizePaymentMethod(value: unknown): "cod" | "bkash" | "nagad" | null {
  const method = String(value ?? "").trim().toLowerCase();
  return method === "cod" || method === "bkash" || method === "nagad" ? method : null;
}

export function normalizeDeliveryArea(value: unknown): "dhaka" | "outside_dhaka" | null {
  const area = String(value ?? "").trim().toLowerCase();
  return area === "dhaka" || area === "outside_dhaka" ? area : null;
}

export function paymentMethodLabel(method: string | null | undefined) {
  if (method === "bkash") return "bKash";
  if (method === "nagad") return "Nagad";
  return "Cash on Delivery";
}

export function paymentStatusLabel(status: string | null | undefined) {
  const normalized = String(status ?? "pending").toLowerCase();
  if (normalized === "paid") return "Paid";
  if (normalized === "confirmed") return "Confirmed";
  if (normalized === "rejected") return "Rejected";
  return "Pending verification";
}
