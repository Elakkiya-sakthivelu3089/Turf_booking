import { useMemo, useState } from "react";

const defaultPageSizeOptions = [5, 10, 20, 50];

const normalize = (value) => String(value ?? "").toLowerCase();

export const useTableControls = ({
  rows = [],
  searchFields = [],
  filterField,
  filterOptions,
  initialPageSize = 10,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const resolvedFilterOptions = useMemo(() => {
    if (filterOptions) return filterOptions;
    if (!filterField) return [];

    return Array.from(
      new Set(rows.map((row) => row?.[filterField]).filter(Boolean))
    ).sort();
  }, [filterField, filterOptions, rows]);

  const filteredRows = useMemo(() => {
    const searchText = normalize(search).trim();

    return rows.filter((row) => {
      const matchesSearch =
        !searchText ||
        searchFields.some((field) => normalize(field(row)).includes(searchText));

      const matchesFilter =
        !filterField || filter === "ALL" || String(row?.[filterField]) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [filter, filterField, rows, search, searchFields]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = filteredRows.slice(start, start + pageSize);

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const updateFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  const updatePageSize = (value) => {
    setPageSize(value);
    setPage(1);
  };

  return {
    search,
    setSearch: updateSearch,
    filter,
    setFilter: updateFilter,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: updatePageSize,
    pageRows,
    filteredRows,
    totalPages,
    totalRows: rows.length,
    pageSizeOptions: defaultPageSizeOptions,
    filterOptions: resolvedFilterOptions,
  };
};
