import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  CardTitle,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Spinner, 
} from "@dfds-ui/react-components"; 
import Page from "components/Page";
import PageSection from "components/PageSection";
import ECRContext from "./ECRContext";
import AppContext from "AppContext";
import { ECRProvider } from "./ECRContext";
import NewRepositoryDialog from "./NewRepositoryDialog";
import styles from "./ecr.module.css";


function Repositories() {
  const { repositories } = useContext(ECRContext);
  const { truncateString } = useContext(AppContext);

  useEffect(() => {
    console.log("Repositories updated: ", repositories.length);
  }, [repositories]);

  /*
  {repositories.map((repository) => (
    <Card key={repository.id}>{repository.id} [{repository.status}] -- {repository.name}</Card>
  ), repositories)}
*/
  const rowClass = (status) => status === "pending" ? styles.pendingRow : '';

  return (
    <>
      <PageSection headline={`Repositories`}>
      {((repositories || []).length === 0) && (<Spinner />)}
      {(repositories.length > 0) && (
          <>
            <Table isInteractive width={"100%"}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell align="center">URI</TableHeaderCell>
                  <TableHeaderCell align="center">Note</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {repositories.map((repository) => (
                  <TableRow key={repository.id} className={rowClass(repository.status)}>
                    <TableDataCell>
                      <Text styledAs="action" as={"div"}>
                        {truncateString(repository.name)}
                      </Text>
                      <Text styledAs="caption" as={"div"}>
                        {truncateString(repository.description)}
                      </Text>
                    </TableDataCell>
                    <TableDataCell>
                        <Text styledAs="action" as={"div"}>
                            {repository.uri}
                        </Text>
                    </TableDataCell>
                    <TableDataCell>
                      {(repository.status === "pending") && (
                        <Text styledAs="caption" as={"div"}>
                          Pending creation
                        </Text>
                      )}
                    </TableDataCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </PageSection>
    </>
  );
}


export default function ECRPage() {
  const [showNewRepositoryDialog, setShowNewRepositoryDialog] = useState(false);

  return (
    <>
      <ECRProvider>
        <Page title="ECR Repositories">
          {showNewRepositoryDialog && (<NewRepositoryDialog
            onClose={() => setShowNewRepositoryDialog(false)}
          />)}
          <Card
            variant="fill"
            surface="main"
            size="xl"
            reverse={true}
          >
            <CardTitle largeTitle>Information</CardTitle>
            <CardContent>
              <p>
                This is a long text about ECR Repositories. We have no idea what
                goes here and it is just a placeholder. However, if it is too short
                then the layout will be all wrong. Long live Lorem Ipsum and all that.
              </p>
            </CardContent>
            <CardActions>
            <Button
              size="small"
              onClick={() => setShowNewRepositoryDialog(true)}
            >
              New repository
            </Button>
          </CardActions>
          </Card>
          <Repositories />
        </Page>
      </ECRProvider>
    </>
  );
}
