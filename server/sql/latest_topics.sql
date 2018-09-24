WITH new_topics AS (
  SELECT t.*
    FROM topic_snapshot ts
    JOIN topic t
      ON t.guid = ts.guid
   WHERE ts.created_at >= (now() - '1h'::INTERVAL)
)
SELECT t.guid,
       min(t.date) AS date,
       min(tc.name) AS category,
       min(tc.id) AS category_id,
       jsonb_agg(ts.*) AS snapshots
  FROM new_topics t
  JOIN topic_category tc
    ON tc.id = t.category_id
  JOIN topic_snapshot ts
    ON ts.guid = t.guid
 GROUP BY t.guid
 ORDER BY guid DESC;
