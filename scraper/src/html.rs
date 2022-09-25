use select::document::Document;
use select::node::Data::Text;

pub fn strip_html(html: &str) -> String {
    Document::from(html)
        .nodes
        .iter()
        .filter_map(|node| {
            if let Text(text) = &node.data {
                Some(text.as_ref())
            } else {
                None
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strip_html_test() {
        assert_eq!(strip_html("<strong>foo</strong><p></p>"), "foo");
    }
}
