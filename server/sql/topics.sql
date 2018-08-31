SELECT t.guid AS id,
       t.date AS timestamp,
       topic_category.name AS category,
       nts.subject AS title,
       nts.link AS link,
       nts.message AS description
  FROM topic t
  JOIN topic_category
    ON topic_category.id = t.category_id,
       LATERAL (
        SELECT *
          FROM topic_snapshot ts
         WHERE ts.guid = t.guid
         ORDER BY ts.id
         LIMIT 1
       ) nts
 ORDER BY t.guid DESC
 LIMIT 50;
