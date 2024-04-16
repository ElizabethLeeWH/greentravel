drop schema if exists thetravelcompanion;

create database thetravelcompanion;

use thetravelcompanion;

CREATE TABLE `trip_headers` (
    `trip_id` VARCHAR(255) PRIMARY KEY,
    `user_id` VARCHAR(255) NOT NULL,  -- This corresponds to the MongoDB ObjectId
    `destination_country` VARCHAR(255),
    `latitude` DOUBLE,
    `longitude` DOUBLE,
    `trip_cover_photo` VARCHAR(255),
    `trip_name` VARCHAR(255),
    `start_date` DATE,
    `end_date` DATE
);

CREATE TABLE `itineraries` (
    `itinerary_id`  INT AUTO_INCREMENT PRIMARY KEY,
    `trip_id` VARCHAR(255),
    FOREIGN KEY (`trip_id`) REFERENCES `trip_headers`(`trip_id`)
);

CREATE TABLE `itinerary_dates` (
    itinerary_date_id INT AUTO_INCREMENT PRIMARY KEY,
    itinerary_id INT NOT NULL,
    `date` DATE,
    FOREIGN KEY (`itinerary_id`) REFERENCES `itineraries`(`itinerary_id`)
);

CREATE TABLE `itinerary_destinations` (
    `itinerary_destination_id` INT AUTO_INCREMENT PRIMARY KEY,
    `itinerary_date_id` INT,
    `destination` VARCHAR(255),
    `latitude` DOUBLE,
    `longitude` DOUBLE,
    FOREIGN KEY (`itinerary_date_id`) REFERENCES `itinerary_dates`(`itinerary_date_id`)
);

CREATE TABLE `trip_lists` (
    `list_id` VARCHAR(255) PRIMARY KEY,
    `trip_id` VARCHAR(255),
    FOREIGN KEY (`trip_id`) REFERENCES `trip_headers`(`trip_id`)
);

CREATE TABLE `trip_items` (
    `item_id` VARCHAR(255) PRIMARY KEY,
    `list_id` VARCHAR(255),
    `type` ENUM('place', 'note'),
    FOREIGN KEY (`list_id`) REFERENCES `trip_lists`(`list_id`)
);

CREATE TABLE `trip_items_places` (
    `place_id` INT AUTO_INCREMENT PRIMARY KEY,
    `item_id` VARCHAR(255),  -- Link to the trip_items table
    `name` VARCHAR(255),
    `description` TEXT,
    FOREIGN KEY (`item_id`) REFERENCES `trip_items`(`item_id`)
);

CREATE TABLE `trip_items_notes` (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    `item_id` VARCHAR(255),  -- Link to the trip_items table
    `text` TEXT,
    FOREIGN KEY (`item_id`) REFERENCES `trip_items`(`item_id`)
);


CREATE TABLE `budgets` (
    `budget_id` INT AUTO_INCREMENT PRIMARY KEY,
    `trip_id` VARCHAR(255),
    `currency` VARCHAR(255),
    `total_budget` DOUBLE,
    FOREIGN KEY (`trip_id`) REFERENCES `trip_headers`(`trip_id`)
);

CREATE TABLE `expenses` (
    `expense_id` VARCHAR(255) PRIMARY KEY,
    `budget_id` VARCHAR(255),
    `category` VARCHAR(255),
    `currency` VARCHAR(255),
    `amount` DOUBLE,
    `date` DATE,
    `paid_by` VARCHAR(255),
    FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`budget_id`)
);

