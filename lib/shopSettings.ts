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
  bkashInstruction: string;
  nagadNumber: string;
  nagadInstruction: string;
};

const DEFAULT_SETTINGS: ShopSettings = {
  freeShippingThreshold: 2000,
  dhakaDeliveryCharge: 60,
  outsideDhakaDeliveryCharge: 120,
  enableCod: true,
  enableBkash: true,
  enableNagad: true,
  codInstruction: "Cash on delivery is available for selected areas. Pay the delivery person when the order arrives.",
  bkashNumber: "01700000000",
  bkashInstruction: "Send Money to this number and write your order ID in the reference.",
  nagadNumber: "01700000000",
  nagadInstruction: "Send Money or Cash Out to this number and write your order ID in the reference.",
};

export async function ensureShopSettingsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shop_settings (
      setting_key VARCHAR(64) PRIMARY KEY,
      setting_value TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

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
      ADD COLUMN IF NOT EXISTS payment_note TEXT NULL
  `);
}

function parseNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
}

export async function getShopSettings(): Promise<ShopSettings> {
  await ensureShopSettingsTable();

  const [rows]: any = await pool.query(
    "SELECT setting_key, setting_value FROM shop_settings"
  );

  const saved = Object.fromEntries(
    (rows || []).map((row: any) => [row.setting_key, row.setting_value])
  );

  const settings: ShopSettings = {
    ...DEFAULT_SETTINGS,
  };

  for (const key of Object.keys(DEFAULT_SETTINGS) as Array<keyof ShopSettings>) {
    const raw = saved[key];
    if (raw == null) continue;

    const parsed = JSON.parse(raw);

    if (typeof parsed === "number") {
      (settings as any)[key] = parsed;
      continue;
    }

    if (typeof parsed === "string") {
      (settings as any)[key] = parsed;
      continue;
    }

    if (typeof parsed === "boolean") {
      (settings as any)[key] = parsed;
      continue;
    }
  }

  settings.freeShippingThreshold = parseNumber(saved.freeShippingThreshold, DEFAULT_SETTINGS.freeShippingThreshold);
  settings.dhakaDeliveryCharge = parseNumber(saved.dhakaDeliveryCharge, DEFAULT_SETTINGS.dhakaDeliveryCharge);
  settings.outsideDhakaDeliveryCharge = parseNumber(
    saved.outsideDhakaDeliveryCharge,
    DEFAULT_SETTINGS.outsideDhakaDeliveryCharge
  );
  settings.enableCod = parseBoolean(saved.enableCod, DEFAULT_SETTINGS.enableCod);
  settings.enableBkash = parseBoolean(saved.enableBkash, DEFAULT_SETTINGS.enableBkash);
  settings.enableNagad = parseBoolean(saved.enableNagad, DEFAULT_SETTINGS.enableNagad);
  settings.codInstruction = String(saved.codInstruction ?? DEFAULT_SETTINGS.codInstruction);
  settings.bkashNumber = String(saved.bkashNumber ?? DEFAULT_SETTINGS.bkashNumber);
  settings.bkashInstruction = String(saved.bkashInstruction ?? DEFAULT_SETTINGS.bkashInstruction);
  settings.nagadNumber = String(saved.nagadNumber ?? DEFAULT_SETTINGS.nagadNumber);
  settings.nagadInstruction = String(saved.nagadInstruction ?? DEFAULT_SETTINGS.nagadInstruction);

  return settings;
}

export async function saveShopSettings(input: Partial<ShopSettings>) {
  await ensureShopSettingsTable();

  const current = await getShopSettings();
  const next: ShopSettings = {
    ...current,
    ...input,
  };

  const entries = Object.entries(next) as [keyof ShopSettings, any][];

  for (const [key, value] of entries) {
    const serializedValue = JSON.stringify(value);
    await pool.query(
      `INSERT INTO shop_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, serializedValue]
    );
  }

  return next;
}

export function calculateDeliveryCharge(
  settings: ShopSettings,
  subtotal: number,
  deliveryArea: "dhaka" | "outside_dhaka"
) {
  if (subtotal >= settings.freeShippingThreshold) return 0;
  return deliveryArea === "dhaka"
    ? Number(settings.dhakaDeliveryCharge)
    : Number(settings.outsideDhakaDeliveryCharge);
}

export function normalizePaymentMethod(method: string | null | undefined) {
  const value = String(method ?? "cod").trim().toLowerCase();
  if (value === "bkash") return "bkash";
  if (value === "nagad") return "nagad";
  return "cod";
}

export function normalizeDeliveryArea(value: string | null | undefined) {
  const area = String(value ?? "dhaka").trim().toLowerCase();
  return area === "outside_dhaka" || area === "outside-dhaka" ? "outside_dhaka" : "dhaka";
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
  if (value === "pending") return "Pending";
  if (value === "rejected") return "Rejected";
  if (value === "confirmed") return "Confirmed";
  return "Pending";
}
