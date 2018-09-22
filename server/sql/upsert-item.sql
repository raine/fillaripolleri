INSERT INTO item (
  id,
  timestamp,
  category_id,
  title,
  link,
  frame_size_cm,
  frame_size_tshirt,
  sold,
  price,
  location
) VALUES (
  ${id},
  ${timestamp},
  ${categoryId},
  ${title},
  ${link},
  ${frameSizeCm},
  ${frameSizeTshirt},
  ${sold},
  ${price},
  ${location}
)
ON CONFLICT (id)
DO UPDATE SET (title, link, frame_size_cm, frame_size_tshirt, sold, price, location) = (
  EXCLUDED.title,
  EXCLUDED.link,
  EXCLUDED.frame_size_cm,
  EXCLUDED.frame_size_tshirt,
  EXCLUDED.sold,
  EXCLUDED.price,
  EXCLUDED.location
)
