@{% function nuller() { return null; } %}
@{% function joiner(d) { return d.join(''); } %}
@{% const R = require('ramda'); %}

main -> any frame_size_candidate _ any {% R.nth(1) %}

frame_size_candidate ->
    frame_size_prefix sep _ frame_size         {% R.last %}
  | frame_size_tshirt "-size"i                 {% R.head %}
  | frame_size_tshirt _ "koko"i                {% R.head %}
  | frame_size_number "cm" _ frame_size_suffix {% R.pipe(R.take(2), R.join('')) %}
# | frame_size_number _ "cm"i

sep -> (_ ":") | __

frame_size_prefix ->
    "Rungon koko"i
  | "Rungon koko (lisää myös otsikkoon)"i
  | "Runkokoko"i
  | "Rungonkoko"i _ "on"i | "Runkokoko"i _ "on"i
  | "Runko"i
  | "Koko"i "a":?
  | "Frame size"i
  | "Size"i

frame_size_suffix ->
    "Rungolla"i
  | "Runko"i

frame_size ->
    frame_size_cm     {% R.head %}
  | frame_size_tshirt {% R.head %}

frame_size_cm ->
    frame_size_number {% R.pipe(R.head, x => x + 'cm') %}

frame_size_number -> (
    "4" [0-9]
  | "5" [0-9]
  | "6" [0-5]
) {% R.pipe(R.head, R.join('')) %}

frame_size_tshirt -> (
    "3XL"i
  | "XXL"i
  | "2XL"i
  | "XL"i
  | "L"i
  | "M"i
  | "S"i
  | "XS"i
  | "XXS"i
  | "2XS"i
  | "3XS"i
) {% R.pipe(R.flatten, R.head, R.toUpper) %}

any -> (. | "\n"):* {% nuller %}
 
_ -> [\s]:* {% (d) => null %}

__ -> " " {% (d) => null %}
