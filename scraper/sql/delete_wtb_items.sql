with wtb_topics as (
  select guid
    from topic_snapshot
   where subject ~* '\yostetaan\y'
      or subject ~* '\yostettu\y'
      or subject ~* '^ostan\y'
      or subject ~* '^o:\y'
   group by guid
)
delete from item
using wtb_topics
where item.id = wtb_topics.guid;
