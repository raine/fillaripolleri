CREATE TYPE topic_tag AS ENUM ('for_sale', 'sold', 'want_to_buy', 'invalid', 'giving_away');

CREATE TABLE topic (
  guid         integer PRIMARY KEY,
  category_id  integer NOT NULL,
  date         timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
  tag          topic_tag,
);

CREATE TABLE topic_snapshot (
  id         serial PRIMARY KEY,
  guid       integer REFERENCES topic(guid),
  link       text NOT NULL,
  subject    text NOT NULL,
  message    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX topic_snapshot_checksum 
    ON topic_snapshot(md5(guid || subject || message));

CREATE INDEX topic_snapshot_guid_id ON topic_snapshot (guid, id);
CREATE INDEX topic_snapshot_guid ON topic_snapshot (guid);
CREATE INDEX topic_snapshot_created_at ON topic_snapshot (created_at);

-- Currently the main purpose of the job table is to enable the node.js to
-- listen for job_completed notifications that are triggered when the table is
-- updato listen for job_completed notifications that are triggered when the
-- table is updated at the end of this program.
CREATE TABLE job (
  id          serial PRIMARY KEY,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE TABLE topic_category (
  id   integer PRIMARY KEY,
  name text NOT NULL
)

CREATE TYPE tshirt_size AS ENUM (
  '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'
);

CREATE TABLE item (
  guid              integer PRIMARY KEY,
  -- Read this from topic table instead?
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

CREATE INDEX item_title_tsvector_idx
ON item USING gin (title_tsvector);

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
