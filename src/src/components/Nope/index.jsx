import { Container, Column } from "@dfds-ui/react-components";
import styles from "./Nope.module.css";
import { Text } from "@dfds-ui/typography";
import image from "./404.gif";

export default function Nope() {
  return (
    <>
      <br />
      <br />
      <Container>
        <Column m={12} l={12} xl={12} xxl={12}>
          <div className={styles.nope}>
            <div className={styles.column}>
              <Text
                as={"div"}
                style={{ fontSize: "10rem" }}
                styledAs="heroHeadline"
              >
                Nope!
              </Text>
              <Text as={"div"} styledAs="subHeadline">
                Not for you
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
