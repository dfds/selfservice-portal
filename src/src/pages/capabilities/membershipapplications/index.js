import { Button, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { useContext } from "react";
import PageSection from "components/PageSection";
import AppContext from "app-context";
import { format, intlFormatDistance, } from "date-fns";

export function MembershipApplications(id, userEmail) {
    const { selectedCapability } = useContext(AppContext);
    const hasPendingApplications = selectedCapability.membershipApplications.length > 0;

    return <>
        { hasPendingApplications && 
            <PageSection headline="Membership Applications">
                <Table isInteractive width={"100%"}>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Applicant</TableHeaderCell>
                            <TableHeaderCell>Application date</TableHeaderCell>
                            <TableHeaderCell>Expires</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell></TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedCapability.membershipApplications.map(x =>
                            <TableRow key={x.applicant}>
                                <TableDataCell>{x.applicant}</TableDataCell>
                                <TableDataCell>{format(new Date(x.submittedAt), 'MMMM do yyyy, h:mm:ss')}</TableDataCell>
                                <TableDataCell>{intlFormatDistance(new Date(x.expiresOn), new Date())}</TableDataCell>
                                <TableDataCell>{x.status}</TableDataCell>
                                <TableDataCell align='right'>
                                    <Button size='small' >Approve</Button>
                                </TableDataCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </PageSection>
        }
    </>
}

export default MembershipApplications;