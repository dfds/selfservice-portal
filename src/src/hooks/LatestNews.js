import { useEffect } from "react";
import { useState } from "react";

export function useLatestNews() {
  const [news, setNews] = useState([]);

  const loadNews = async () => {
    const response = await fetch("https://dfdsit.statuspage.io/history.rss");
    const rssContent = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(rssContent, 'application/xml');
    const items = doc.querySelectorAll('item');

    const newsItems = Array.from(items).map(item => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const text = item.querySelector('description').textContent;
        const date = item.querySelector('pubDate').textContent;
        
        return {
            id: `${date}-${title}`,
            date: Date.parse(date),
            title: title,
            text: text,
            link: link
        };
    });

    setNews(newsItems);
  };

  useEffect(() => {
    loadNews();
    const handle = setTimeout(loadNews, 1000*60*5);
    return () => { clearTimeout(handle); }
  }, []);

  return news;
}
