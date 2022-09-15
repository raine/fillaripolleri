        SELECT t.guid,
               t.category_id,
               t.date,
               t.created_at,
               jsonb_agg(ts.guid) AS snapshots
          FROM topic t
          JOIN topic_snapshot ts
            ON ts.guid = t.guid
         WHERE t.guid = 270736
         GROUP BY t.guid
         ORDER BY guid DESC
