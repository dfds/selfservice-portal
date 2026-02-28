import { Spinner } from "@/components/ui/spinner";
import { MaterialReactTable } from "material-react-table";
import { useMemo, useContext } from "react";
import AppContext from "@/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export function MembershipApplicationTable({
  tableData,
  handleApproveClicked,
  approveButtonLabel,
  handleRejectClicked,
  rejectButtonLabel,
}) {
  const { truncateString } = useContext(AppContext);
  const { isDark } = useTheme();
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: { mode: isDark ? "dark" : "light" },
        components: {
          MuiTableSortLabel: {
            styleOverrides: {
              icon: { opacity: 0.5 },
              root: {
                "&:hover .MuiTableSortLabel-icon": { opacity: 1 },
                "&.Mui-active .MuiTableSortLabel-icon": { opacity: 1 },
              },
            },
          },
        },
      }),
    [isDark],
  );

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.capabilityId,
        header: "Capability",
        size: 30,
        enableClickToCopy: true,
        Cell: ({ cell }) => (
          <span className="text-[13px] font-medium text-[#002b45] dark:text-[#e2e8f0]">
            {truncateString(cell.getValue(), 70)}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.applicant,
        header: "Applicant",
        size: 50,
        Cell: ({ cell }) => (
          <span className="font-mono text-[11px] text-[#666666] dark:text-slate-400">
            {cell.getValue()}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.submittedAt,
        header: "Submitted",
        size: 50,
        Cell: ({ cell }) => (
          <span className="tabular-nums text-[12px] text-[#666666] dark:text-slate-400">
            {cell.getValue()}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.expiresOn,
        header: "Expires",
        size: 50,
        Cell: ({ cell }) => (
          <span className="tabular-nums text-[12px] text-[#666666] dark:text-slate-400">
            {cell.getValue()}
          </span>
        ),
      },
      {
        accessorFn: (row) => row,
        header: "",
        id: "actions",
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ cell }) => {
          const row = cell.getValue();
          return row.activeCrudOperation ? (
            <div className="flex justify-end">
              <Spinner size="sm" />
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              {handleApproveClicked != null && (
                <button
                  type="button"
                  onClick={() => handleApproveClicked(row)}
                  className="cursor-pointer rounded-[4px] bg-[#0e7cc1] px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#0b6aa5]"
                >
                  {approveButtonLabel ?? "Approve"}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRejectClicked(row)}
                className="cursor-pointer rounded-[4px] bg-[#be1e2d] px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#a1192a]"
              >
                {rejectButtonLabel ?? "Reject"}
              </button>
            </div>
          );
        },
        Header: <div />,
      },
    ],
    [],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <MaterialReactTable
        columns={columns}
        data={tableData}
        initialState={{
          pagination: { pageSize: 5 },
          showGlobalFilter: true,
        }}
        muiTableHeadCellProps={{
          sx: {
            fontFamily: '"SFMono-Regular", "Fira Code", "Consolas", monospace',
            fontSize: "10px",
            fontWeight: "600",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: isDark ? "#64748b" : "#afafaf",
            borderBottom: isDark ? "1px solid #1e2d3d" : "1px solid #eeeeee",
            background: "transparent",
            paddingLeft: "0",
            paddingRight: "16px",
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            fontSize: "13px",
            color: isDark ? "#e2e8f0" : "#002b45",
            borderBottom: isDark ? "1px solid #1e2d3d" : "1px solid #eeeeee",
            background: "transparent",
            padding: "10px 16px 10px 0",
          },
        }}
        muiTablePaperProps={{
          elevation: 0,
          sx: { borderRadius: "0", background: "transparent" },
        }}
        muiTableContainerProps={{
          sx: { background: "transparent" },
        }}
        muiTopToolbarProps={{
          sx: { background: "transparent", minHeight: "40px", paddingLeft: 0 },
        }}
        muiBottomToolbarProps={{
          sx: { background: "transparent" },
        }}
        muiSearchTextFieldProps={{
          placeholder: "Search applications...",
          sx: { minWidth: "260px", fontSize: "13px" },
          size: "small",
          variant: "outlined",
        }}
        muiTableHeadRowProps={{
          sx: { background: "transparent" },
        }}
        muiTableBodyRowProps={{
          sx: {
            background: "transparent",
            "&:hover td": { backgroundColor: isDark ? "#334155" : "#f2f2f2" },
          },
        }}
        enableGlobalFilter={true}
        enableGlobalFilterModes={true}
        positionGlobalFilter="left"
        globalFilterFn="contains"
        enableFilterMatchHighlighting={true}
        enableFilters={true}
        enableColumnActions={false}
        enableDensityToggle={false}
        enableHiding={false}
        enableFullScreenToggle={false}
        enableTopToolbar={true}
        enableBottomToolbar={true}
        enablePagination={true}
      />
    </ThemeProvider>
  );
}
