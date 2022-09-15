BEGIN;

CREATE TYPE topic_tag AS ENUM (
  'ForSale',
  'Reserved',
  'Sold',
  'WantToBuy',
  'Invalid',
  'GivingAway',
  'Renting',
  'Bought'
);

ALTER TABLE topic ADD COLUMN tag topic_tag;

COMMIT;
