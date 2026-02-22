import { ButtonStack, Spinner } from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import styles from "./LatestNews.module.css";
import { intlFormatDistance } from "date-fns";
import { TrackedLink } from "@/components/Tracking";
import { useLatestNews } from "hooks/LatestNews";

function NewsItem({ date, title, text, link }) {
  const temp = intlFormatDistance(date, new Date());
  return (
    <div className={styles.newsitemcontainer}>
      <Text styledAs="caption">{temp}</Text>
      <Text as={"div"} styledAs="bodyInterfaceSmallBold">
        {title}
      </Text>
      <ButtonStack align="right">
        <Text styledAs="labelSmall">
          <TrackedLink
            trackName={`NewsItem-${title}`}
            href={link}
            target="_blank"
            rel="noreferrer"
            className={styles.newsitemlink}
          >
            Read More
          </TrackedLink>
        </Text>
      </ButtonStack>
    </div>
  );
}

export default function LatestNews() {
  const news = useLatestNews();
  return (
    <div>
      {news.length === 0 && <Spinner />}
      {news.slice(0, 4).map((x) => (
        <NewsItem key={x.id} {...x} />
      ))}
    </div>
  );
}
