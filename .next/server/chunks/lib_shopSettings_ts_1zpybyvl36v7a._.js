module.exports=[55505,e=>{"use strict";var t=e.i(62294);async function n(){await t.f.query(`CREATE TABLE IF NOT EXISTS shop_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`),await t.f.query(`ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100) NULL,
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
    ADD COLUMN IF NOT EXISTS payment_instruction TEXT NULL`)}function r(e,t){if(null==e)return t;try{return JSON.parse(String(e))}catch{return t}}function a(e,t){let n=Number(e);return Number.isFinite(n)&&n>=0?n:t}function i(e){return"cash out"===String(e).toLowerCase()?"Cash Out":"Send Money"}async function s(){await n();let[e]=await t.f.query("SELECT setting_key, setting_value FROM shop_settings"),s=Object.fromEntries((e||[]).map(e=>[e.setting_key,e.setting_value]));return{freeShippingThreshold:a(r(s.freeShippingThreshold,2e3),2e3),dhakaDeliveryCharge:a(r(s.dhakaDeliveryCharge,60),60),outsideDhakaDeliveryCharge:a(r(s.outsideDhakaDeliveryCharge,120),120),enableCod:!0===r(s.enableCod,!0),enableBkash:!0===r(s.enableBkash,!1),enableNagad:!0===r(s.enableNagad,!1),codInstruction:String(r(s.codInstruction,"Pay the delivery person when your order arrives.")??""),bkashNumber:String(r(s.bkashNumber,"")??""),bkashAction:i(r(s.bkashAction,"Send Money")),bkashInstruction:String(r(s.bkashInstruction,"")??""),nagadNumber:String(r(s.nagadNumber,"")??""),nagadAction:i(r(s.nagadAction,"Send Money")),nagadInstruction:String(r(s.nagadInstruction,"")??""),announcementText:String(r(s.announcementText,"")??""),storeOfferTitle:String(r(s.storeOfferTitle,"")??""),storeOfferSubtitle:String(r(s.storeOfferSubtitle,"")??"")}}async function o(e){for(let[r,a]of(await n(),Object.entries(e)))await t.f.query(`INSERT INTO shop_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,[r,JSON.stringify(a)]);return e}e.s(["W",0,function(e,t,n){return e.freeShippingThreshold>0&&t>=e.freeShippingThreshold?0:"dhaka"===n?e.dhakaDeliveryCharge:e.outsideDhakaDeliveryCharge},"R",0,s,"g",0,function(e){let t=String(e??"").trim().toLowerCase();return"dhaka"===t||"outside_dhaka"===t?t:null},"C",0,function(e){let t=String(e??"").trim().toLowerCase();return"cod"===t||"bkash"===t||"nagad"===t?t:null},"s",0,o])}];

//# sourceMappingURL=lib_shopSettings_ts_1zpybyvl36v7a._.js.map