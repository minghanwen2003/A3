DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE charityevents_db;

CREATE TABLE organizations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  mission TEXT NOT NULL,
  phone VARCHAR(40),
  email VARCHAR(120),
  website VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  short_desc VARCHAR(300),
  full_desc TEXT,
  city VARCHAR(100) NOT NULL,
  venue VARCHAR(150) NOT NULL,
  address VARCHAR(200),
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  hero_image_url VARCHAR(500),
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  goal_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  raised_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  capacity INT UNSIGNED NOT NULL DEFAULT 100,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_event_times CHECK (end_time > start_time),
  CONSTRAINT chk_event_money CHECK (goal_amount >= 0 AND raised_amount >= 0)
);

CREATE INDEX idx_events_start ON events(start_time);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_status ON events(status);

CREATE TABLE registrations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40),
  tickets INT UNSIGNED NOT NULL DEFAULT 1,
  registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT,
  CONSTRAINT uq_registration_event_email UNIQUE (event_id, email),
  CONSTRAINT chk_registration_tickets CHECK (tickets BETWEEN 1 AND 20)
);

INSERT INTO organizations (name, mission, phone, email, website) VALUES
('Harbour Hope Community Foundation', 'Connecting local people with practical community support.', '+61 2 5550 1000', 'hello@harbourhope.example', 'https://harbourhope.example');

INSERT INTO categories (slug, name) VALUES
('gala', 'Gala Dinner'),
('fun-run', 'Fun Run'),
('auction', 'Silent Auction'),
('concert', 'Charity Concert'),
('workshop', 'Community Workshop');

INSERT INTO events
(organization_id, category_id, title, short_desc, full_desc, city, venue, address, start_time, end_time, hero_image_url, status, goal_amount, raised_amount, capacity, latitude, longitude)
VALUES
(1, 1, 'Harbour Hope Gala', 'An evening supporting youth education.', 'A community dinner with local speakers and a scholarship fundraiser.', 'Sydney', 'Harbourview Hall', '1 Harbour Street, Sydney', '2026-11-20 18:30:00', '2026-11-20 22:00:00', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', 'active', 50000, 18000, 180, -33.8688, 151.2093),
(1, 2, 'Run for Young Minds', 'A family friendly 5K and 10K.', 'Every entry funds youth mental health programs.', 'Sydney', 'Barangaroo Reserve', 'Hickson Road, Barangaroo', '2026-12-05 08:00:00', '2026-12-05 12:00:00', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5', 'active', 20000, 7200, 500, -33.8650, 151.2010),
(1, 3, 'Art for Trees Auction', 'Local art supporting urban greening.', 'Bid on donated art and help plant trees near schools.', 'Sydney', 'Community Arts Centre', '10 Park Lane, Sydney', '2026-10-30 17:00:00', '2026-10-30 20:30:00', 'https://images.unsplash.com/photo-1549490349-8643362247b5', 'active', 15000, 6200, 120, -33.8731, 151.2065),
(1, 4, 'Sounds of the City', 'Live music for greener streets.', 'An outdoor concert funding pocket parks and bike lanes.', 'Sydney', 'Riverside Stage', '2 River Road, Sydney', '2027-01-16 16:00:00', '2027-01-16 21:00:00', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a', 'active', 30000, 5400, 600, -33.8568, 151.2153),
(1, 5, 'Repair and Reuse Workshop', 'Learn practical low waste skills.', 'A hands on workshop led by local repair volunteers.', 'Newcastle', 'Makers Library', '5 Civic Way, Newcastle', '2026-11-28 10:00:00', '2026-11-28 13:00:00', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', 'active', 8000, 2100, 60, -32.9283, 151.7817),
(1, 1, 'Hope Spring Gala Archive', 'A completed community fundraiser.', 'Past event retained for administration and reporting.', 'Sydney', 'Town Hall', '483 George Street, Sydney', '2026-03-14 18:00:00', '2026-03-14 22:00:00', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'active', 45000, 45000, 160, -33.8731, 151.2065),
(1, 3, 'Vintage Vinyl Auction', 'Rare records for community gardens.', 'Collectors donated records to fund local food gardens.', 'Wollongong', 'Civic Gallery', '12 Crown Street, Wollongong', '2026-08-22 18:00:00', '2026-08-22 21:30:00', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 'active', 12000, 11200, 100, -34.4278, 150.8931),
(1, 4, 'Rooftop Jazz Night', 'Suspended pending venue review.', 'The event remains visible to staff while its permit is reviewed.', 'Sydney', 'Central Rooftop', '80 Pitt Street, Sydney', '2026-12-12 19:00:00', '2026-12-12 22:00:00', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629', 'suspended', 10000, 0, 90, -33.8651, 151.2053);

INSERT INTO registrations (event_id, full_name, email, phone, tickets, registration_date) VALUES
(1, 'Alex Morgan', 'alex.morgan@example.com', '+61 400 000 101', 2, '2026-10-01 09:15:00'),
(1, 'Priya Shah', 'priya.shah@example.com', '+61 400 000 102', 1, '2026-10-03 14:20:00'),
(1, 'Jordan Lee', 'jordan.lee@example.com', '+61 400 000 103', 3, '2026-10-05 11:05:00'),
(2, 'Taylor Smith', 'taylor.smith@example.com', '+61 400 000 104', 2, '2026-09-28 16:40:00'),
(2, 'Casey Brown', 'casey.brown@example.com', '+61 400 000 105', 1, '2026-10-04 10:12:00'),
(3, 'Morgan Chen', 'morgan.chen@example.com', '+61 400 000 106', 1, '2026-10-02 08:45:00'),
(4, 'Sam Wilson', 'sam.wilson@example.com', '+61 400 000 107', 4, '2026-10-06 18:30:00'),
(5, 'Riley Green', 'riley.green@example.com', '+61 400 000 108', 1, '2026-10-07 12:00:00'),
(6, 'Jamie King', 'jamie.king@example.com', '+61 400 000 109', 2, '2026-02-20 09:00:00'),
(7, 'Avery Taylor', 'avery.taylor@example.com', '+61 400 000 110', 1, '2026-08-01 15:10:00');
