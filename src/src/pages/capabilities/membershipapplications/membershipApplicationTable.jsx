import { Spinner } from "@/components/ui/spinner";
import { MaterialReactTable } from "material-react-table";
import { useMemo, useContext, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import AppContext from "@/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/PaginationControls";

const APP_CARD_PAGE_SIZE = 10;

function ApproveButtonWithRoles({ row, roleOptions, onApproveWithRole, label }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const POPUP_WIDTH = 144;

  const handleOpen = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;
    const popupHeight = (roleOptions?.length || 0) * 32 + 8;
    const vw = document.documentElement.clientWidth;

    // Document-relative coords: viewport position + scroll offset
    let top = rect.bottom + scrollTop + 4;
    let left = rect.right + scrollLeft - POPUP_WIDTH;

    // Clamp horizontally so it never goes off-screen
    left = Math.max(8, Math.min(left, vw + scrollLeft - POPUP_WIDTH - 8));

    // Flip above the button if it would go off the bottom of the viewport
    if (rect.bottom + 4 + popupHeight > window.innerHeight) {
      top = rect.top + scrollTop - popupHeight - 4;
    }

    setPos({ top, left });
    setOpen((o) => !o);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className="cursor-pointer rounded-[4px] bg-[#0e7cc1] px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#0b6aa5]"
      >
        {label ?? "Approve"}
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "absolute", top: pos.top, left: pos.left, width: POPUP_WIDTH, zIndex: 9999 }}
          className="rounded-[5px] border border-[#d9dcde] dark:border-[#334155] bg-white dark:bg-[#1e293b] shadow-lg py-1"
        >
          {(roleOptions || []).map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => {
                setOpen(false);
                onApproveWithRole(row, role.value);
              }}
              className="w-full text-left px-3 py-1.5 text-[12px] text-[#002b45] dark:text-[#e2e8f0] hover:bg-[#f2f2f2] dark:hover:bg-[#334155] transition-colors"
            >
              {role.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

function MembershipApplicationCard({
  row,
  truncateString,
  roleOptions,
  handleApproveClicked,
  approveButtonLabel,
  handleRejectClicked,
  rejectButtonLabel,
}) {
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <p className="text-sm font-medium text-primary mb-0.5">
          {truncateString(row.capabilityId, 80)}
        </p>
        <p className="font-mono text-xs text-secondary mb-2">{row.applicant}</p>
        <div className="flex gap-4 text-xs text-muted font-mono mb-3">
          <span>Submitted: {row.submittedAt}</span>
          <span>Expires: {row.expiresOn}</span>
        </div>
        {row.activeCrudOperation ? (
          <div className="flex justify-end">
            <Spinner size="sm" />
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            {handleApproveClicked != null && (
              <ApproveButtonWithRoles
                row={row}
                roleOptions={roleOptions}
                onApproveWithRole={handleApproveClicked}
                label={approveButtonLabel}
              />
            )}
            <button
              type="button"
              onClick={() => handleRejectClicked(row)}
              className="cursor-pointer rounded-[4px] bg-[#be1e2d] px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#a1192a]"
            >
              {rejectButtonLabel ?? "Reject"}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MembershipApplicationCardList({
  tableData,
  truncateString,
  roleOptions,
  handleApproveClicked,
  approveButtonLabel,
  handleRejectClicked,
  rejectButtonLabel,
}) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const visible = filter
    ? tableData.filter((row) => {
        const q = filter.toLowerCase();
        return (
          row.capabilityId?.toLowerCase().includes(q) ||
          row.applicant?.toLowerCase().includes(q)
        );
      })
    : tableData;

  const totalPages = Math.max(1, Math.ceil(visible.length / APP_CARD_PAGE_SIZE));
  const pageStart = (currentPage - 1) * APP_CARD_PAGE_SIZE;
  const pageItems = visible.slice(pageStart, pageStart + APP_CARD_PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [tableData, filter]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search applications..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full mb-4 px-3 py-2 text-base md:text-sm border border-divider rounded-[5px] bg-surface text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {pageItems.map((row) => (
        <MembershipApplicationCard
          key={row.id}
          row={row}
          truncateString={truncateString}
          roleOptions={roleOptions}
          handleApproveClicked={handleApproveClicked}
          approveButtonLabel={approveButtonLabel}
          handleRejectClicked={handleRejectClicked}
          rejectButtonLabel={rejectButtonLabel}
        />
      ))}
      {visible.length === 0 && (
        <p className="text-center text-sm text-muted italic py-8">
          No applications found.
        </p>
      )}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageStart={pageStart}
        pageSize={APP_CARD_PAGE_SIZE}
        total={visible.length}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}

export function MembershipApplicationTable({
  tableData,
  roleOptions,
  handleApproveClicked,
  approveButtonLabel,
  handleRejectClicked,
  rejectButtonLabel,
}) {
  const { truncateString } = useContext(AppContext);
  const { isDark } = useTheme();
  const isMobile = useIsMobile();

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
                <ApproveButtonWithRoles
                  row={row}
                  roleOptions={roleOptions}
                  onApproveWithRole={handleApproveClicked}
                  label={approveButtonLabel}
                />
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

  if (isMobile) {
    return (
      <MembershipApplicationCardList
        tableData={tableData}
        truncateString={truncateString}
        roleOptions={roleOptions}
        handleApproveClicked={handleApproveClicked}
        approveButtonLabel={approveButtonLabel}
        handleRejectClicked={handleRejectClicked}
        rejectButtonLabel={rejectButtonLabel}
      />
    );
  }

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
