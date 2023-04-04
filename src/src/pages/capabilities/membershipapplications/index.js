import { Button, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell, Badge } from '@dfds-ui/react-components'
import { useContext } from "react";
import PageSection from "components/PageSection";
import AppContext from "app-context";
import { format, intlFormatDistance, differenceInCalendarDays } from "date-fns";
import ProfilePicture from './ProfilePicture';

function ExpirationDate({date}) {
    const daysUntil = differenceInCalendarDays(new Date(date), new Date());
    const label = intlFormatDistance(new Date(date), new Date());

    return daysUntil < 3
        ? <Badge intent="critical">{label}</Badge>
        : <span>{label}</span>
}

export default function MembershipApplications() {
    const { selectedCapability } = useContext(AppContext);
    const hasPendingApplications = selectedCapability.membershipApplications.length > 0;

    if (!hasPendingApplications) {
        return <></>;
    }

    const applications = selectedCapability.membershipApplications.map(x => {
        const copy = {...x};

        const approvalLink = copy?._links?.approvals;
        copy.canApprove = false;
        copy.showApprove = true;

        if (approvalLink) {
            copy.canApprove = (approvalLink.allow || []).includes("POST");
            copy.showApprove = (approvalLink.allow || []).includes("GET");
        }

        return copy;
    });

    return <>
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
                    {applications.map(x =>
                        <TableRow key={x.applicant}>
                            <TableDataCell>
                                <ProfilePicture 
                                    name={x.applicant} 
                                    pictureUrl={x.applicantProfilePictureUrl} 
                                />
                            </TableDataCell>
                            <TableDataCell>
                                {x.applicant}
                            </TableDataCell>
                            <TableDataCell>{format(new Date(x.submittedAt), 'MMMM do yyyy')}</TableDataCell>
                            <TableDataCell>
                                <ExpirationDate date={x.expiresOn} />
                            </TableDataCell>
                            <TableDataCell>{x.status}</TableDataCell>
                            <TableDataCell align='right'>
                                {x.showApprove && 
                                    <Button 
                                        size='small' 
                                        disabled={!x.canApprove} 
                                        title={x.canApprove 
                                            ? "Submit your approval of this membership" 
                                            : "You have already submitted your approval for this membership. Waiting for other members to approve."
                                        }
                                    >Approve</Button>
                                }
                            </TableDataCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </PageSection>
    </>
}