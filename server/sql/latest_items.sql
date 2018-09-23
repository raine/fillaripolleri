SELECT i.*,
       tc.name AS category
  FROM item i
  JOIN topic_category tc
    ON tc.id = i.category_id
 ${where:raw}
 ORDER BY id DESC
 LIMIT ${limit};
