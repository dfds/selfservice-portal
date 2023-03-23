import { Text } from '@dfds-ui/typography';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { useState } from "react";
import { useContext } from "react";
import PageSection from "components/PageSection";
import AppContext from "app-context";
import { format, intlFormatDistance,} from "date-fns";

export function MembershipApplications(id){
    const { selectedCapability } = useContext(AppContext);

   return <>
    <Text styledAs='sectionHeadline'>Membership applications</Text>
    <PageSection>
    <Table isHeaderSticky isInteractive width={"100%"}>
        <TableHead>
                <TableRow>
                    <TableHeaderCell>Applicant</TableHeaderCell>
                    <TableHeaderCell>Application date</TableHeaderCell>
                    <TableHeaderCell>Expires</TableHeaderCell>
                    <TableHeaderCell>status</TableHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {selectedCapability.membershipApplications.map(x =>
            <TableRow key={x.applicant}>
                {/* <TableDataCell  onClick={() => clickHandler(x.capabilityId)}>{x.capabilityId}</TableDataCell> */}
                <TableDataCell>{x.applicant}</TableDataCell>
                <TableDataCell>{format(new Date(x.submittedAt), 'MMMM do yyyy, h:mm:ss')}</TableDataCell> {/*TODO [pausegh]: human-readable datetime format*/}
                <TableDataCell>{intlFormatDistance(new Date(x.expiresOn), new Date())}</TableDataCell> {/*TODO [pausegh]: human readable time delta*/}
                <TableDataCell>{x.status}</TableDataCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
</PageSection>
</>
}

export default MembershipApplications;