import { useContext } from "react"
import AppContext from "./../../app-context";
import styles from "./ProfileName.module.css";
import { Text } from "@dfds-ui/typography";

export default function ProfileName() {
    const { user } = useContext(AppContext);
    return <div className={styles.container}>
        <Text styledAs="bodyInterfaceBold" as="div">{user.name}</Text>
        <Text styledAs="bodyInterface"  as="div">{user.title}</Text>
    </div>
}