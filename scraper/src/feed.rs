use crate::http::HttpClient;
use eyre::Result;
use feed_rs::model::Feed;

pub fn fetch_feed(http: &mut HttpClient, url: &str) -> Result<Feed> {
    let reader = http.get_as_reader(url)?;
    let feed = feed_rs::parser::parse(reader)?;
    Ok(feed)
}

// Hardcoded feed urls to scrape. These cannot be easily retrieved at runtime.
pub const FEED_URLS: &[&str] = &[
    "https://www.fillaritori.com/forum/10-keulat-ja-iskunvaimentimet.xml",
    "https://www.fillaritori.com/forum/11-voimansiirto.xml",
    "https://www.fillaritori.com/forum/12-jarrut.xml",
    "https://www.fillaritori.com/forum/13-kiekot.xml",
    "https://www.fillaritori.com/forum/14-vaatteet.xml",
    "https://www.fillaritori.com/forum/15-kyp%C3%A4r%C3%A4t-ja-suojat.xml",
    "https://www.fillaritori.com/forum/16-keng%C3%A4t.xml",
    "https://www.fillaritori.com/forum/17-muut.xml",
    "https://www.fillaritori.com/forum/23-satulat-ja-tolpat.xml",
    "https://www.fillaritori.com/forum/27-tangot-ja-stemmit.xml",
    "https://www.fillaritori.com/forum/44-elektroniikka.xml",
    "https://www.fillaritori.com/forum/5-lasten.xml",
    "https://www.fillaritori.com/forum/50-renkaat.xml",
    "https://www.fillaritori.com/forum/51-bmx.xml",
    "https://www.fillaritori.com/forum/52-fiksit.xml",
    "https://www.fillaritori.com/forum/53-muille-osastoille-sopimattomat.xml",
    "https://www.fillaritori.com/forum/54-maantie.xml",
    "https://www.fillaritori.com/forum/55-cyclocross.xml",
    "https://www.fillaritori.com/forum/56-hybridit.xml",
    "https://www.fillaritori.com/forum/57-joustamattomat.xml",
    "https://www.fillaritori.com/forum/58-etujousitetut.xml",
    "https://www.fillaritori.com/forum/60-vintageretro.xml",
    "https://www.fillaritori.com/forum/61-napavaihteiset.xml",
    "https://www.fillaritori.com/forum/62-ketjuvaihteiset.xml",
    "https://www.fillaritori.com/forum/63-yksivaihteiset.xml",
    "https://www.fillaritori.com/forum/69-triathlonaika-ajo.xml",
    "https://www.fillaritori.com/forum/70-fatbiket.xml",
    "https://www.fillaritori.com/forum/72-t%C3%A4ysjousitetut-80-125mm.xml",
    "https://www.fillaritori.com/forum/74-t%C3%A4ysjousitetut-130-155mm.xml",
    "https://www.fillaritori.com/forum/75-t%C3%A4ysjousitetut-160-210mm.xml",
    "https://www.fillaritori.com/forum/77-tavarapy%C3%B6r%C3%A4t.xml",
    "https://www.fillaritori.com/forum/79-dirtstreet.xml",
    "https://www.fillaritori.com/forum/8-rungot.xml",
    "https://www.fillaritori.com/forum/82-s%C3%A4hk%C3%B6istys.xml",
    "https://www.fillaritori.com/forum/84-tasamaa.xml",
    "https://www.fillaritori.com/forum/85-maasto.xml",
    "https://www.fillaritori.com/forum/86-muut.xml",
];
