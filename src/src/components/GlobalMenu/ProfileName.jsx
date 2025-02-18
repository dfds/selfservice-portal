import { useContext } from "react";
import AppContext from "AppContext";
import styles from "./ProfileName.module.css";
import { Text } from "@/components/dfds-ui/typography";

export default function ProfileName() {
  const { user } = useContext(AppContext);
  const name = user ? user.name : "";
  const title = user ? user.title : "";

  return (
    <div className={styles.container}>
      <Text styledAs="bodyInterfaceBold" as="div">
        {name}
      </Text>
      <Text styledAs="bodyInterface" as="div">
        {title}
      </Text>
    </div>
  );
}
