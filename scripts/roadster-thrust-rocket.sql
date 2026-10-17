-- Roadster Thrust + Rocket (run in Neon SQL editor)

-- THRUST
INSERT INTO "Vehicle" (
  id, model, "modelYear", trim, slug, description, category, condition,
  "exteriorColor", "interiorColor", price, currency, "depositAmount",
  "inventoryStatus", featured, published, "driveType", "accel060",
  seating, market, "createdAt", "updatedAt"
)
SELECT
  'rdstr_thrust_' || substr(md5(random()::text), 1, 12),
  'Roadster', 2026, 'Thrust', 'roadster-thrust',
  'Electric performance sports car with auxiliary cold-gas thrusters and experimental acceleration technology. Target under 1 second 0–60 mph.',
  'PASSENGER', 'NEW', 'Silver', 'Black',
  200000, 'USD', 50000, 'AVAILABLE', true, true,
  'All-Electric with Auxiliary Cold-Gas Thrusters',
  'Under 1 sec (0–60 mph, reported target)',
  2, 'US', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Vehicle" WHERE slug = 'roadster-thrust');

UPDATE "Vehicle" SET
  model = 'Roadster',
  "modelYear" = 2026,
  trim = 'Thrust',
  description = 'Electric performance sports car with auxiliary cold-gas thrusters and experimental acceleration technology. Target under 1 second 0–60 mph.',
  category = 'PASSENGER',
  condition = 'NEW',
  price = 200000,
  "depositAmount" = 50000,
  "inventoryStatus" = 'AVAILABLE',
  featured = true,
  published = true,
  "driveType" = 'All-Electric with Auxiliary Cold-Gas Thrusters',
  "accel060" = 'Under 1 sec (0–60 mph, reported target)',
  seating = 2,
  "updatedAt" = NOW()
WHERE slug = 'roadster-thrust';

-- ROCKET
INSERT INTO "Vehicle" (
  id, model, "modelYear", trim, slug, description, category, condition,
  "exteriorColor", "interiorColor", price, currency, "depositAmount",
  "inventoryStatus", featured, published, "driveType", "accel060",
  seating, market, "createdAt", "updatedAt"
)
SELECT
  'rdstr_rocket_' || substr(md5(random()::text), 1, 12),
  'Roadster', 2026, 'Rocket', 'roadster-rocket',
  'Experimental electric sports car with cold-gas thruster system and advanced vehicle-control concepts. 0–60 mph in 0.37 seconds.',
  'PASSENGER', 'NEW', 'Silver', 'Black',
  300000, 'USD', 75000, 'AVAILABLE', true, true,
  'Electric with Experimental Thruster Technology',
  '0.37 sec (0–60 mph)',
  1, 'US', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Vehicle" WHERE slug = 'roadster-rocket');

UPDATE "Vehicle" SET
  model = 'Roadster',
  "modelYear" = 2026,
  trim = 'Rocket',
  description = 'Experimental electric sports car with cold-gas thruster system and advanced vehicle-control concepts. 0–60 mph in 0.37 seconds.',
  category = 'PASSENGER',
  condition = 'NEW',
  price = 300000,
  "depositAmount" = 75000,
  "inventoryStatus" = 'AVAILABLE',
  featured = true,
  published = true,
  "driveType" = 'Electric with Experimental Thruster Technology',
  "accel060" = '0.37 sec (0–60 mph)',
  seating = 1,
  "updatedAt" = NOW()
WHERE slug = 'roadster-rocket';

-- Images for Thrust
INSERT INTO "VehicleImage" (id, "vehicleId", url, "altText", "displayOrder")
SELECT 'img_rt_' || substr(md5(random()::text), 1, 12), v.id, '/images/roadster_thrust.png', 'Tesla Roadster Thrust', 0
FROM "Vehicle" v
WHERE v.slug = 'roadster-thrust'
  AND NOT EXISTS (SELECT 1 FROM "VehicleImage" vi WHERE vi."vehicleId" = v.id);

UPDATE "VehicleImage" vi
SET url = '/images/roadster_thrust.png', "altText" = 'Tesla Roadster Thrust'
FROM "Vehicle" v
WHERE vi."vehicleId" = v.id AND v.slug = 'roadster-thrust';

-- Images for Rocket
INSERT INTO "VehicleImage" (id, "vehicleId", url, "altText", "displayOrder")
SELECT 'img_rr_' || substr(md5(random()::text), 1, 12), v.id, '/images/roadster_rocket.png', 'Tesla Roadster Rocket', 0
FROM "Vehicle" v
WHERE v.slug = 'roadster-rocket'
  AND NOT EXISTS (SELECT 1 FROM "VehicleImage" vi WHERE vi."vehicleId" = v.id);

UPDATE "VehicleImage" vi
SET url = '/images/roadster_rocket.png', "altText" = 'Tesla Roadster Rocket'
FROM "Vehicle" v
WHERE vi."vehicleId" = v.id AND v.slug = 'roadster-rocket';

-- Verify
SELECT slug, trim, price, "inventoryStatus", published
FROM "Vehicle"
WHERE model = 'Roadster'
ORDER BY price;
