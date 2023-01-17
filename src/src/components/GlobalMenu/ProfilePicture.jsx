import { useMsal } from "@azure/msal-react";
import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../app-context";
import styles from "./ProfilePicture.module.css";

import { callMsGraph } from "../../graph";
import { loginRequest } from "../../authConfig";


export default function ProfilePicture({}) {
    const { user } = useContext(AppContext);


    // const { instance, accounts } = useMsal();
    // const [graphData, setGraphData] = useState(null);

    // const name = accounts[0] && accounts[0].name;

    // useEffect(() => {


    //     const request = {
    //         ...loginRequest,
    //         account: accounts[0]
    //     };

    //     // Silently acquires an access token which is then attached to a request for Microsoft Graph data
    //     instance.acquireTokenSilent(request).then((response) => {
    //         callMsGraph(response.accessToken).then(response => {
    //             setGraphData(response);
    //             console.log("graph data: ", response);
    //             console.log("accounts: ", accounts);
    //         });
    //     })        


    // }, []);

    return <div className={styles.container}>
        <div className={styles.background} title={user.name}>
            <img className={styles.picture} src={user.profilePictureUrl} alt={user.name}/>
        </div>
    </div>
}