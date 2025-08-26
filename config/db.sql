-- Active: 1755640910063@@127.0.0.1@3306@dars_6
CREATE DATABASE dars_6


USE dars_6

CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    role ENUM('admin', 'moderator', 'user') DEFAULT 'user',
    address VARCHAR(100)
)

CREATE TABLE district (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
)

CREATE TABLE shop (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    owner_id BIGINT NOT NULL,
    phone_number VARCHAR(50),
    district_id BIGINT NOT NULL,
    address VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    FOREIGN KEY (owner_id) REFERENCES user(id),
    FOREIGN KEY (district_id) REFERENCES district(id)
)

CREATE TABLE tool (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    tool_price DECIMAL(10, 2)
)


CREATE TABLE shop_tool (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    rent_price DECIMAL(10, 2),
    FOREIGN KEY (shop_id) REFERENCES shop(id),
    FOREIGN KEY (tool_id) REFERENCES tool(id)
)


CREATE TABLE client_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    shop_tool_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    period BIGINT NOT NULL,
    total_price DECIMAL(10, 2),
    FOREIGN KEY (client_id) REFERENCES user(id),
    FOREIGN KEY (shop_tool_id) REFERENCES shop_tool(id)
)

CREATE TABLE admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_creator BOOLEAN DEFAULT false
)

DROP TABLE admin

SHOW TABLES
