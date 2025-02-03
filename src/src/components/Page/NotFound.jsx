import { Container, Column } from "@/dfds-ui/react-components/src";
import styles from "./NotFound.module.css";
import { Text } from "@/dfds-ui/typography/src";
import image from "./404.gif";

export default function NotFound() {
  return (
    <>
      <br />
      <br />
      <Container>
        <Column m={12} l={12} xl={12} xxl={12}>
          <div className={styles.notfound}>
            <div className={styles.column}>
              <Text
                as={"div"}
                style={{ fontSize: "10rem" }}
                styledAs="heroHeadline"
              >
                404
              </Text>
              <Text as={"div"} styledAs="subHeadline">
                Page Not Found!
              </Text>
            </div>
            <div className={styles.column}>
              <img src={image} alt={""} />
            </div>
          </div>
        </Column>
      </Container>
    </>
  );
}
