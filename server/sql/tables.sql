CREATE TABLE topic_category (
  id   integer PRIMARY KEY,
  name text NOT NULL
)

CREATE TYPE tshirt_size AS ENUM (
  '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'
);

CREATE TABLE item (
  id                integer PRIMARY KEY,
  timestamp         timestamptz NOT NULL,
  category_id       integer REFERENCES topic_category(id),
  title             text NOT NULL,
  link              text NOT NULL,
  frame_size_cm     smallint,
  frame_size_tshirt tshirt_size,
  sold              boolean DEFAULT false,
  price             integer,
  location          text,
  title_tsvector    tsvector NOT NULL
);

CREATE FUNCTION notify() RETURNS TRIGGER AS $$
DECLARE
BEGIN
  PERFORM pg_notify(TG_ARGV[0], TG_ARGV[1]);
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_completed
 AFTER UPDATE ON job
   FOR EACH STATEMENT EXECUTE PROCEDURE notify('job_completed', '');
