module.exports=[16064,a=>{"use strict";var b=a.i(66879);async function c(){await b.f.query(`CREATE TABLE IF NOT EXISTS shop_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`),await b.f.query(`ALTER TABLE orders
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
    ADD COLUMN IF NOT EXISTS payment_instruction TEXT NULL`)}function d(a,b){if(null==a)return b;try{return JSON.parse(String(a))}catch{return b}}function e(a,b){let c=Number(a);return Number.isFinite(c)&&c>=0?c:b}function f(a){return"cash out"===String(a).toLowerCase()?"Cash Out":"Send Money"}async function g(){await c();let[a]=await b.f.query("SELECT setting_key, setting_value FROM shop_settings"),g=Object.fromEntries((a||[]).map(a=>[a.setting_key,a.setting_value]));return{freeShippingThreshold:e(d(g.freeShippingThreshold,2e3),2e3),dhakaDeliveryCharge:e(d(g.dhakaDeliveryCharge,60),60),outsideDhakaDeliveryCharge:e(d(g.outsideDhakaDeliveryCharge,120),120),enableCod:!0===d(g.enableCod,!0),enableBkash:!0===d(g.enableBkash,!1),enableNagad:!0===d(g.enableNagad,!1),codInstruction:String(d(g.codInstruction,"Pay the delivery person when your order arrives.")??""),bkashNumber:String(d(g.bkashNumber,"")??""),bkashAction:f(d(g.bkashAction,"Send Money")),bkashInstruction:String(d(g.bkashInstruction,"")??""),nagadNumber:String(d(g.nagadNumber,"")??""),nagadAction:f(d(g.nagadAction,"Send Money")),nagadInstruction:String(d(g.nagadInstruction,"")??""),announcementText:String(d(g.announcementText,"")??""),storeOfferTitle:String(d(g.storeOfferTitle,"")??""),storeOfferSubtitle:String(d(g.storeOfferSubtitle,"")??"")}}a.s(["R",0,g,"T",0,function(a){return"bkash"===a?"bKash":"nagad"===a?"Nagad":"Cash on Delivery"},"z",0,function(a){let b=String(a??"pending").toLowerCase();return"paid"===b?"Paid":"confirmed"===b?"Confirmed":"rejected"===b?"Rejected":"Pending verification"}])}];

//# sourceMappingURL=lib_shopSettings_ts_0h3_f3_f1imf-._.js.map