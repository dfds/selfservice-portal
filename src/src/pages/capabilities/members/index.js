import React, { useContext, useEffect, useState } from "react";
import styles from "./members.module.css";
import { Text } from "@dfds-ui/typography";
import ProfilePicture from "./profilepicture";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { Invitations } from "../invitations";

export default function Members() {
  const { members, links, addNewInvitees, isInviteesCreated } = useContext(
    SelectedCapabilityContext,
  );
  const [showInvitations, setShowInvitations] = useState(true);

  useEffect(() => {
    if (
      (links?.invitations?.allow || []).includes("GET") &&
      (links?.invitations?.allow || []).includes("POST")
    ) {
      setShowInvitations(true);
    }
  }, [links]);

  return (
    <>
      <Text styledAs="sectionHeadline">Members ({(members || []).length})</Text>
      <div className={styles.members}>
        {(members || []).map((member) => (
          <ProfilePicture
            key={member.email}
            name={member.name ?? member.email}
            pictureUrl={member.pictureUrl}
          />
        ))}
      </div>
      {showInvitations && (
        <div style={{ width: "70%" }}>
          <Text styledAs="smallHeadline">Invitations</Text>
          <Invitations
            addNewInvitees={addNewInvitees}
            inProgress={isInviteesCreated}
          />
        </div>
      )}
    </>
  );
}
