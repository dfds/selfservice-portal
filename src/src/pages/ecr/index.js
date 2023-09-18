import React, { useEffect, useState, useMemo } from "react";
import { MaterialReactTable } from 'material-react-table';
import {
  Card,
  CardTitle,
  CardContent,
  CardActions,
  Button,
  Text,
  Spinner, 
} from "@dfds-ui/react-components"; 
import Page from "components/Page";
import PageSection from "components/PageSection";
import NewRepositoryDialog from "./NewRepositoryDialog";
import { useECRRepositories } from "hooks/ECRRepositories";

function Repositories() {  
  const { repositories } = useECRRepositories();

  useEffect(() => {
    console.log("Repositories updated: ", repositories.length);
  }, [repositories]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 250,
        Cell: ({ renderedCellValue }) => {
          return (
            <Text styledAs="action" as={"div"}>
                {renderedCellValue}
            </Text>
          )
        }
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 250,
        Cell: ({ renderedCellValue }) => {
          return (
            <Text styledAs="action" as={"div"}>
                {renderedCellValue}
            </Text>
          )
        }
      },
      {
        accessorKey: 'repositoryName',
        header: 'Repository Name',
        size: 250,
        Cell: ({ renderedCellValue }) => {
          return (
            <Text styledAs="action" as={"div"}>
                {renderedCellValue}
            </Text>
          )
        }
      },
    ],
    [],
  )


  return (
    <>
      <PageSection headline={`Repositories`}>
      {((repositories || []).length === 0) && (<Spinner />)}
      {(repositories.length > 0) && (
        <MaterialReactTable columns={columns} data={repositories}
          muiTableHeadCellProps={{
            sx: {
              fontWeight: '700',
              fontSize: '16px',
              fontFamily: 'DFDS',
              color: '#002b45',
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              fontWeight: '400',
              fontSize: '16px',
              fontFamily: 'DFDS',
              color: '#4d4e4c',
              padding: '5px',
            },
          }}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              borderRadius: '0',
            }
          }}
          enableTopToolbar={true}
          enableBottomToolbar={false}
          enableColumnActions={true}
          enableColumnFilters={true}
       />
      )}
      </PageSection>
    </>
  );
}


export default function ECRPage() {
  const [showNewRepositoryDialog, setShowNewRepositoryDialog] = useState(false);

  return (
    <>
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
                  This a comprehensive list of all AWS ECR Repositories that
                  have been created by DFDS development teams.
                  All users with access to this portal can request new repositories.
              </p>
              <p>
                  When creating new repositories, please be mindful of the naming conventions.
                  Normally the repository name should consist of the team name and the application name.
                  For example: <b>cloudengineering/selfservice-portal</b>.
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
    </>
  );
}
