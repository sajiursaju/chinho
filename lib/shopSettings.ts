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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shop_settings (
      setting_key VARCHAR(64) PRIMARY KEY,
      setting_value TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Non-destructive schema migration for existing orders.
  await pool.query(`
    ALTER TABLE orders
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
      ADD COLUMN IF NOT EXISTS payment_instruction TEXT NULL
  `);
}

function decodeValue<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(String(raw)) as T;
  } catch {
    return fallback;
  }
}

function safeNonNegativeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function normalizeAction(value: unknown): "Send Money" | "Cash Out" {
  return String(value).toLowerCase() === "cash out" ? "Cash Out" : "Send Money";
}

export async function getShopSettings(): Promise<ShopSettings> {
  await ensureShopSettingsTable();
  const [rows]: any = await pool.query("SELECT setting_key, setting_value FROM shop_settings");
  const saved = Object.fromEntries((rows || []).map((row: any) => [row.setting_key, row.setting_value]));

  return {
    freeShippingThreshold: safeNonNegativeNumber(decodeValue(saved.freeShippingThreshold, DEFAULT_SETTINGS.freeShippingThreshold), DEFAULT_SETTINGS.freeShippingThreshold),
    dhakaDeliveryCharge: safeNonNegativeNumber(decodeValue(saved.dhakaDeliveryCharge, DEFAULT_SETTINGS.dhakaDeliveryCharge), DEFAULT_SETTINGS.dhakaDeliveryCharge),
    outsideDhakaDeliveryCharge: safeNonNegativeNumber(decodeValue(saved.outsideDhakaDeliveryCharge, DEFAULT_SETTINGS.outsideDhakaDeliveryCharge), DEFAULT_SETTINGS.outsideDhakaDeliveryCharge),
    enableCod: decodeValue(saved.enableCod, DEFAULT_SETTINGS.enableCod) === true,
    enableBkash: decodeValue(saved.enableBkash, DEFAULT_SETTINGS.enableBkash) === true,
    enableNagad: decodeValue(saved.enableNagad, DEFAULT_SETTINGS.enableNagad) === true,
    codInstruction: String(decodeValue(saved.codInstruction, DEFAULT_SETTINGS.codInstruction)),
    bkashNumber: String(decodeValue(saved.bkashNumber, DEFAULT_SETTINGS.bkashNumber)),
    bkashAction: normalizeAction(decodeValue(saved.bkashAction, DEFAULT_SETTINGS.bkashAction)),
    bkashInstruction: String(decodeValue(saved.bkashInstruction, DEFAULT_SETTINGS.bkashInstruction)),
    nagadNumber: String(decodeValue(saved.nagadNumber, DEFAULT_SETTINGS.nagadNumber)),
    nagadAction: normalizeAction(decodeValue(saved.nagadAction, DEFAULT_SETTINGS.nagadAction)),
    nagadInstruction: String(decodeValue(saved.nagadInstruction, DEFAULT_SETTINGS.nagadInstruction)),
  };
}

export async function saveShopSettings(input: Partial<ShopSettings>) {
  await ensureShopSettingsTable();
  const current = await getShopSettings();
  const next: ShopSettings = { ...current, ...input };

  if (next.freeShippingThreshold < 0 || next.dhakaDeliveryCharge < 0 || next.outsideDhakaDeliveryCharge < 0) {
    throw new Error("Delivery fees and threshold must be zero or more");
  }
  if (next.bkashNumber.length > 40 || next.nagadNumber.length > 40) {
    throw new Error("Payment number is too long");
  }
  if (next.codInstruction.length > 1000 || next.bkashInstruction.length > 1000 || next.nagadInstruction.length > 1000) {
    throw new Error("Payment instruction is too long");
  }

  for (const [key, value] of Object.entries(next)) {
    await pool.query(
      `INSERT INTO shop_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, JSON.stringify(value)]
    );
  }
  return next;
}

export function calculateDeliveryCharge(settings: ShopSettings, subtotal: number, deliveryArea: "dhaka" | "outside_dhaka") {
  if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) return 0;
  return deliveryArea === "dhaka" ? settings.dhakaDeliveryCharge : settings.outsideDhakaDeliveryCharge;
}

export function normalizePaymentMethod(method: string | null | undefined) {
  const value = String(method ?? "").trim().toLowerCase();
  return value === "cod" || value === "bkash" || value === "nagad" ? value : null;
}

export function normalizeDeliveryArea(value: string | null | undefined) {
  const area = String(value ?? "").trim().toLowerCase();
  return area === "outside_dhaka" ? "outside_dhaka" : area === "dhaka" ? "dhaka" : null;
}

export function paymentMethodLabel(method: string | null | undefined) {
  const value = normalizePaymentMethod(method);
  if (value === "bkash") return "bKash";
  if (value === "nagad") return "Nagad";
  return "Cash on Delivery";
}

export function paymentStatusLabel(status: string | null | undefined) {
  const value = String(status ?? "pending").trim().toLowerCase();
  if (value === "paid") return "Paid";
  if (value === "rejected") return "Rejected";
  if (value === "confirmed") return "Confirmed";
  return "Awaiting verification";
}
