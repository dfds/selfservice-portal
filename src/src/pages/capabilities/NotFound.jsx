import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/Text";
import styles from "./NotFound.module.css";

export default function NotFound() {
  // TODO: currently not being used because of the new error/notFound banner
  return (
    <>
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="w-full">
          <Card className="bg-white">
            <div className={styles.notfound}>
              <br />

              <img
                src="https://media3.giphy.com/media/H54feNXf6i4eAQubud/giphy.gif"
                alt="angry chicken gif"
              />

              <br />
              <br />
              <Text as={"div"} styledAs="heroHeadline">
                404 - Capability not found!
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
