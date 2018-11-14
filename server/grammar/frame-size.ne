@{% function nuller() { return null; } %}
@{% function joiner(d) { return d.join(''); } %}
@{% const R = require('ramda'); %}
@{% const wrapWithType = (type) => (value) => ({ type, value }); %}

main -> any frame_size_candidate _ any {% R.nth(1) %}

frame_size_candidate ->
    frame_size_prefix sep1 _ frame_size         {% R.last %}
  | frame_size_tshirt "-size"i                  {% R.head %}
  | frame_size_tshirt sep2 "koko"i              {% R.head %}
  | frame_size_number "cm"i _ frame_size_suffix {% R.head %}
# | frame_size_number _ "cm"i                   {% R.head %}

sep1 -> (_ ":") | __
sep2 -> __ | "-"

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
    frame_size_number {% R.head %}

frame_size_number -> (
    "4" [0-9]
  | "5" [0-9]
  | "6" [0-5]
) {% R.pipe(R.head, R.join(''), parseInt, wrapWithType('cm')) %}

frame_size_tshirt -> (
    "3XL"i {% R.head %}
  | "2XL"i {% R.head %}
  | "XXL"i {% () => '2XL' %}
  | "XL"i {% R.head %}
  | "L"i {% R.head %}
  | "M"i {% R.head %}
  | "S"i {% R.head %}
  | "XS"i {% R.head %}
  | "XXS"i {% () => '2XS' %}
  | "2XS"i {% R.head %}
  | "3XS"i {% R.head %}
) .:? {% (d, l, rej) => {
  console.log(d)
  if (d[1] != null) return rej;

  return R.pipe(
    R.head,
    R.toUpper,
    wrapWithType('t-shirt')
  )(d)
}
%}

any -> [^]:* {% nuller %}
 
_ -> [\s]:* {% () => null %}

__ -> " " {% () => null %}
