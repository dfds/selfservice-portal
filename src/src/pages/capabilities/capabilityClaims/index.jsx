import React, { useContext, useEffect } from "react";
import PageSection from "components/PageSection";
import styles from "./capabilityClaims.module.css";
import { StatusSuccess } from "@dfds-ui/icons/system";
import { Card, CardContent, Button } from "@dfds-ui/react-components";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { useState } from "react";
import { useSelfServiceRequest } from "../../../hooks/SelfServiceApi";
import {
  useAddCapabilityClaim,
  useCapabilityClaims,
} from "@/state/remote/queries/capabilities";
import { useQueryClient } from "@tanstack/react-query";

function ClaimRow({ description, link, claimedAt, claimFunction }) {
  return (
    <div className={styles.claimRow}>
      {claimedAt && (
        <div>
          <StatusSuccess className={styles.claimedIcon} />
        </div>
      )}
      {!claimedAt && (
        <Button
          className={styles.claimButton}
          onClick={() => claimFunction(link)}
        >
          Claim
        </Button>
      )}
      <div>{description}</div>
    </div>
  );
}

export default function CapabilityClaims() {
  const queryClient = useQueryClient();
  const { data: responseData } = useCapabilityClaims();
  const addCapabilityClaim = useAddCapabilityClaim();
  const [claims, setClaims] = useState([]);
  const [showClaimsSection, setShowClaimsSection] = useState(false);

  const sendClaimRequest = (link) => {
    if (link?.href) {
      addCapabilityClaim.mutate(
        {
          link: link,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["capabilities", "claims"],
            });
          },
        },
      );
    }
  };

  useEffect(() => {
    if (responseData?.claims && responseData?.claims.length >= 0) {
      setClaims(responseData?.claims || []);
    }
  }, [responseData]);

  useEffect(() => {
    if (claims.length > 0) {
      setShowClaimsSection(true);
    }
  }, [claims]);

  return (
    <>
      {showClaimsSection && (
        <PageSection headline="Capability Claims">
          <Card>
            <CardContent>
              <p>
                Some external dependencies and integrations for capabilities are
                monitored automatically and others are not. In order to still
                indicate such integrations or even just adherance to company
                rules, capability owners can say that they live up to these
                standards. Thus, a Capability Claim is nothing more than
                capability members indicating (claiming) such adherance.
              </p>

              {(claims || []).map((claim) => (
                <ClaimRow
                  key={claim.claim}
                  description={claim.claimDescription}
                  link={claim._links.claim}
                  claimedAt={claim.claimedAt}
                  claimFunction={sendClaimRequest}
                ></ClaimRow>
              ))}
            </CardContent>
          </Card>
        </PageSection>
      )}
    </>
  );
}
