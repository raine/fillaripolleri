CREATE TABLE topic (
  guid         integer PRIMARY KEY,
  category_id  integer NOT NULL,
  date         timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
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

CREATE TABLE job (
  id          serial PRIMARY KEY,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
