SELECT t.guid AS id,
       nts.created_at,
       nts.subject AS title
  FROM topic t
  JOIN topic_category
    ON topic_category.id = t.category_id,
       LATERAL (
        SELECT *
          FROM topic_snapshot ts
         WHERE ts.guid = t.guid
         ORDER BY ts.id DESC
       ) nts
 ORDER BY t.guid DESC
 LIMIT 2000;
