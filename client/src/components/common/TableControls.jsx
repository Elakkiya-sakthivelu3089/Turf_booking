const TableControls = ({
  table,
  searchPlaceholder = "Search",
  filterLabel = "Filter",
  filterOptions = [],
  showFilter = true,
  extraFilters = null,
  actions = null,
}) => {
  return (
    <div className="table-controls">
      <div className="table-tools">
        <input
          value={table.search}
          placeholder={searchPlaceholder}
          onChange={(event) => table.setSearch(event.target.value)}
        />

        {showFilter && filterOptions.length > 0 && (
          <select
            value={table.filter}
            onChange={(event) => table.setFilter(event.target.value)}
            aria-label={filterLabel}
          >
            <option value="ALL">All {filterLabel}</option>
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {extraFilters}

        <select
          value={table.pageSize}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
          aria-label="Rows per page"
        >
          {table.pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} rows
            </option>
          ))}
        </select>

        {actions}
      </div>

      <div className="table-pagination">
        <span>
          {table.filteredRows.length} of {table.totalRows}
        </span>
        <button
          className="secondary-btn"
          type="button"
          disabled={table.page <= 1}
          onClick={() => table.setPage(table.page - 1)}
        >
          Prev
        </button>
        <strong>
          {table.page} / {table.totalPages}
        </strong>
        <button
          className="secondary-btn"
          type="button"
          disabled={table.page >= table.totalPages}
          onClick={() => table.setPage(table.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableControls;
