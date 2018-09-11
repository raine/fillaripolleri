SELECT t.guid,
       min(t.date) AS date,
       min(tc.name) AS category,
       jsonb_agg(ts.*) AS snapshots
  FROM topic t
  JOIN topic_category tc
    ON tc.id = t.category_id
  JOIN topic_snapshot ts
    ON ts.guid = t.guid
 ${where:raw}
 GROUP BY t.guid
 ORDER BY guid DESC
 LIMIT 50;
