-- chinho store database setup
-- ----------------------------------------------------------------------------
-- Run this in phpMyAdmin: open the SQL tab at the top of the page,
-- paste this whole file, and click Go.
--
-- WARNING: this REPLACES the store tables (users, products, orders, order_items).
-- Their current data is deleted. To keep a copy first, use phpMyAdmin > Export
-- on chinho_db.
--
-- The columns below match exactly what the code reads and writes. Don't rename them.
-- ----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS chinho_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE chinho_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Customers and admins. role = 'admin' opens the admin panel.
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  avatar LONGBLOB NULL,
  avatar_type VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products. category and subcategory must match config/categories.ts.
-- image, image_2 and image_3 hold paths like /uploads/file.jpg.
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50) NULL,
  description TEXT NULL,
  image VARCHAR(255) NULL,
  image_2 VARCHAR(255) NULL,
  image_3 VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- One row per order.
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  tracking_number VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- The products inside each order. name and price are copied at purchase time,
-- so old orders stay correct if a product is renamed or repriced later.
-- product_id has no ON DELETE rule on purpose: a product that is already in an
-- order cannot be deleted (the admin panel shows a message for this).
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);

-- 28 sample products (14 Men, 14 Women). Each uses one of the photos in
-- public/uploads. Edit or delete them in the admin panel as you like.
INSERT INTO products (name, price, category, subcategory, image) VALUES
  ('Men Formal Shirt', 1190.00, 'men', 'shirts', '/uploads/04ff1f81719d79823c8b96ba.webp'),
  ('Men Casual Check Shirt', 990.00, 'men', 'shirts', '/uploads/119b3eea0d6889160641290b.jpg'),
  ('Men Classic Polo', 650.00, 'men', 'polos', '/uploads/1663aea0760e15f24ac5601d.webp'),
  ('Men Striped Polo', 690.00, 'men', 'polos', '/uploads/1dbf0119f670e9b7e8b6a212.jpg'),
  ('Men Round Neck Tee', 450.00, 'men', 'tees', '/uploads/29c9b17aeed5597a2c8443b5.jpg'),
  ('Men Graphic Tee', 520.00, 'men', 'tees', '/uploads/3ee3af941c2edcca318e5a41.jpg'),
  ('Men Cotton Panjabi', 1290.00, 'men', 'panjabi', '/uploads/44722fa5e97e575569b0a626.webp'),
  ('Men Embroidered Panjabi', 1590.00, 'men', 'panjabi', '/uploads/4b08605c62e6b06758de3296.jpg'),
  ('Men Chino Pants', 1350.00, 'men', 'bottoms', '/uploads/4c7f201428bdb91856282761.webp'),
  ('Men Slim Fit Jeans', 1450.00, 'men', 'bottoms', '/uploads/509b6a75c81d60ac5783bb98.jpg'),
  ('Men Denim Jacket', 1850.00, 'men', 'outerwear', '/uploads/523a00c9084036deddd5add7.jpg'),
  ('Men Hooded Sweatshirt', 1100.00, 'men', 'outerwear', '/uploads/56f98c89ab935a94898318e9.jpg'),
  ('Men Leather Belt', 550.00, 'men', 'accessories', '/uploads/65d11bedd6dc6725c29d4101.jpg'),
  ('Men Cotton Socks Pack', 380.00, 'men', 'accessories', '/uploads/676ead2768f5a10a4aebeb2a.webp'),
  ('Women Cotton Sharee', 1690.00, 'women', 'sharee', '/uploads/696bbc2071b38a2c849657bd.jpg'),
  ('Women Printed Georgette Sharee', 2490.00, 'women', 'sharee', '/uploads/7d690aafb5973aacfc56686b.jpg'),
  ('Women Cotton 3-Piece', 1990.00, 'women', '3-piece', '/uploads/7ed3fd220adb3bbf67bc3bb2.jpg'),
  ('Women Embroidered 3-Piece', 2790.00, 'women', '3-piece', '/uploads/874ae522a45b3094a11ec353.jpg'),
  ('Women Printed Top', 590.00, 'women', 'tops', '/uploads/87f52af2d06051fa35793df5.jpg'),
  ('Women Casual Blouse', 790.00, 'women', 'tops', '/uploads/8a287a690b583fa3e3b414be.jpg'),
  ('Women Palazzo Pants', 720.00, 'women', 'bottoms', '/uploads/8b7c36cc4f947a75d473290d.jpg'),
  ('Women Churidar Leggings', 490.00, 'women', 'bottoms', '/uploads/8d21c619a21a9f8c20daa1ed.jpg'),
  ('Women Maxi Dress', 1490.00, 'women', 'dresses', '/uploads/901e76350af51d8b920ff4fe.jpg'),
  ('Women Midi Dress', 1290.00, 'women', 'dresses', '/uploads/a9baff9065d6fd7f3418973b.jpg'),
  ('Women Denim Jacket', 1750.00, 'women', 'outerwear', '/uploads/ae66ef3d31512b0318df4130.jpg'),
  ('Women Shawl Cardigan', 1150.00, 'women', 'outerwear', '/uploads/ba36f6510fdbd30fbbb43817.webp'),
  ('Women Handbag', 950.00, 'women', 'accessories', '/uploads/c512d0e1c9312c6e9b3b4159.jpg'),
  ('Women Printed Scarf', 420.00, 'women', 'accessories', '/uploads/c8364f19a1e7af4d4262c4fc.jpg');

-- Next step: register an account on the website, then make it the admin:
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
