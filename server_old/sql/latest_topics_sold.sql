WITH sold_topics AS (
  SELECT DISTINCT ON (t.guid) t.*
    FROM topic t
    JOIN topic_snapshot ts
      ON ts.guid = t.guid
     AND ts.subject ILIKE '%MYYTY%'
   WHERE t.guid = 133321
  )
SELECT t.guid,
       min(t.date) AS date,
       min(tc.name) AS category,
       jsonb_agg(ts.*) AS snapshots
  FROM sold_topics t
  JOIN topic_category tc
    ON tc.id = t.category_id
  JOIN topic_snapshot ts
    ON ts.guid = t.guid
 GROUP BY t.guid
 ORDER BY guid DESC
 LIMIT 1000;
