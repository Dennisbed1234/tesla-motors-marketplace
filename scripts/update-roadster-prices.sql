-- Run in Neon SQL editor to update live Roadster prices (25% deposits)
UPDATE "Vehicle"
SET price = 253800.00, "depositAmount" = 63450.00
WHERE slug = 'roadster-performance';

UPDATE "Vehicle"
SET price = 325000.00, "depositAmount" = 81250.00
WHERE slug = 'roadster-thrust';

UPDATE "Vehicle"
SET price = 379999.00, "depositAmount" = 95000.00
WHERE slug = 'roadster-rocket';
