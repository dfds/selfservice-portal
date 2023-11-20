import { ButtonStack, Spinner } from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import AppContext from "AppContext";
import { useContext } from "react";
import styles from "./LatestNews.module.css";
import { intlFormatDistance } from "date-fns";

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
          <a
            href={link}
            target={"_blank"}
            rel={"noreferrer"}
            className={styles.newsitemlink}
          >
            Read More
          </a>
        </Text>
      </ButtonStack>
    </div>
  );
}

export default function LatestNews() {
  const { news } = useContext(AppContext);
  return (
    <div>
      {news.length === 0 && <Spinner />}
      {news.slice(0, 4).map((x) => (
        <NewsItem key={x.id} {...x} />
      ))}
    </div>
  );
}
