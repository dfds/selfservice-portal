import {
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableDataCell,
  Badge,
  Banner,
  BannerHeadline,
  BannerParagraph,
} from "@dfds-ui/react-components";
import { useState, useContext, useEffect, useCallback } from "react";
import PageSection from "components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { format, intlFormatDistance, differenceInCalendarDays } from "date-fns";
import ProfilePicture from "./ProfilePicture";
import AppContext from "AppContext";
import { StatusSuccess } from "@dfds-ui/icons/system";
import PreAppContext from "../../../preAppContext";

export function MyMembershipApplication() {
  const { membershipApplications } = useContext(SelectedCapabilityContext);
  const { myProfile } = useContext(AppContext);

  const application = (membershipApplications || []).find(
    (x) => x.applicant === myProfile?.id,
  );
  if (!application) {
    return null;
  }

  return (
    <div>
      <Banner variant={"lowEmphasis"} icon={StatusSuccess}>
        <BannerHeadline>Membership Application Received</BannerHeadline>
        <BannerParagraph>
          Your request to join this capability has been received and it's
          waiting approval from existing members.
          <br />
          <br />
          <strong>Please note:</strong> that it expire{" "}
          <ExpirationDate date={application.expiresOn} />!
        </BannerParagraph>
      </Banner>
    </div>
  );
}

function ExpirationDate({ date }) {
  const daysUntil = differenceInCalendarDays(new Date(date), new Date());
  const label = intlFormatDistance(new Date(date), new Date());

  return daysUntil < 3 ? (
    <Badge intent="critical">{label}</Badge>
  ) : (
    <span>{label}</span>
  );
}

export default function MembershipApplications() {
  const {
    membershipApplications,
    approveMembershipApplication,
    deleteMembershipApplication,
  } = useContext(SelectedCapabilityContext);
  const { myProfile, checkIfCloudEngineer, user } = useContext(AppContext);
  const [applications, setApplications] = useState([]);
  const [isCloudEngineer, setIsCloudEngineer] = useState(false);
  const { isEnabledCloudEngineer } = useContext(PreAppContext);

  useEffect(() => {
    if (user && user.isAuthenticated) {
      setIsCloudEngineer(checkIfCloudEngineer(user.roles));
    }
  }, [user]);

  useEffect(() => {
    const list = (membershipApplications || [])
      .filter((x) => x.applicant !== myProfile?.id)
      .map((x) => {
        const copy = { ...x };

        copy.canApprove = false;
        copy.showApprove = true;
        copy.isApproving = false;

        const approvalLink = copy?.approvals?._links?.self;
        if (approvalLink) {
          copy.canApprove = (approvalLink.allow || []).includes("POST");
          copy.showApprove = (approvalLink.allow || []).includes("GET");
        }

        return copy;
      });

    setApplications(list);
  }, [membershipApplications, myProfile]);

  const handleApproveClicked = useCallback(
    (membershipApplicationId) => {
      setApplications((prev) => {
        const copy = [...prev];
        const found = copy.find((x) => x.id === membershipApplicationId);

        if (found) {
          found.isApproving = true;
        }

        return copy;
      });
      approveMembershipApplication(membershipApplicationId);
    },
    [membershipApplications],
  );

  const handleDeleteClicked = useCallback(
    (membershipApplicationId) => {
      setApplications((prev) => {
        const copy = [...prev];
        const found = copy.find((x) => x.id === membershipApplicationId);

        if (found) {
          found.isApproving = true;
        }

        return copy;
      });
      deleteMembershipApplication(membershipApplicationId);
    },
    [membershipApplications],
  );

  const hasPendingApplications = applications.length > 0;
  if (!hasPendingApplications) {
    return null;
  }

  return (
    <>
      <PageSection headline="Membership Applications">
        <Table isInteractive width={"100%"}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>&nbsp;</TableHeaderCell>
              <TableHeaderCell>Applicant</TableHeaderCell>
              <TableHeaderCell>Application date</TableHeaderCell>
              <TableHeaderCell>Expires</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell></TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((x) => (
              <TableRow key={x.applicant}>
                <TableDataCell>
                  <ProfilePicture
                    name={x.applicant}
                    pictureUrl={x.applicantProfilePictureUrl}
                  />
                </TableDataCell>
                <TableDataCell>{x.applicant}</TableDataCell>
                <TableDataCell>
                  {format(new Date(x.submittedAt), "MMMM do yyyy")}
                </TableDataCell>
                <TableDataCell>
                  <ExpirationDate date={x.expiresOn} />
                </TableDataCell>
                <TableDataCell>{x.status}</TableDataCell>
                <TableDataCell align="right">
                  {x.showApprove && (
                    <Button
                      size="small"
                      disabled={!x.canApprove}
                      submitting={x.isApproving}
                      title={
                        x.canApprove
                          ? "Submit your approval of this membership"
                          : "You have already submitted your approval for this membership. Waiting for other members to approve."
                      }
                      onClick={() => handleApproveClicked(x.id)}
                    >
                      Approve
                    </Button>
                  )}
                </TableDataCell>
                {isCloudEngineer && isEnabledCloudEngineer ? (
                  <TableDataCell style={{ minWidth: "6rem" }}>
                    <Button
                      variation="danger"
                      disabled={!x.canApprove}
                      submitting={x.isApproving}
                      title={
                        x.canApprove
                          ? "Submit your approval of this membership"
                          : "You have already submitted your approval for this membership. Waiting for other members to approve."
                      }
                      onClick={() => handleDeleteClicked(x.id)}
                    >
                      Delete
                    </Button>
                  </TableDataCell>
                ) : (
                  <></>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageSection>
    </>
  );
}
