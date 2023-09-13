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
        accessorKey: 'repositoryName',
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
      }
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
    </>
  );
}
