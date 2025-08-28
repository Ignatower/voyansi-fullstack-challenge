import { useEffect, useState, type ChangeEvent } from "react";
import { getCSVData } from "../api/csvApi";
import type { CSVRow } from "../types/CSVRow";

function Cell({ value }: { value: string }) {
  return <div className="border p-1">{value}</div>;
}

function Row({ values }: { values: string[] }) {
  return (
    <div className="grid grid-cols-[3rem_1fr_2fr_4rem_1fr] gap-2 border-b p-1">
      {values.map((v, i) => (
        <Cell key={i} value={v} />
      ))}
    </div>
  );
}

function Table() {
  const [data, setData] = useState<CSVRow[]>([]);
  const [allData, setAllData] = useState<CSVRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof CSVRow | null>(null);
  const [ascending, setAscending] = useState(true);
  const columns: (keyof CSVRow)[] = ["ID", "Name", "Email", "Age", "City"];
  const [searchColumn, setSearchColumn] = useState<keyof CSVRow>("Name");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Set rowsPerPage based on screen size
  useEffect(() => {
    const handleResize = () => {
      setRowsPerPage(window.innerWidth < 640 ? 5 : 10); // sm breakpoint = 640px
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch CSV data from backend
  const fetchData = async () => {
    const result = await getCSVData();
    if (result.error) {
      console.error("Error fetching CSV:", result.error);
    } else if (result.data) {
      setData(result.data);
      setAllData(result.data); // store original dataset
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and sort
  const filteredSortedData = allData
    .filter((row) =>
      row[searchColumn].toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortColumn) return 0;

      let valA = a[sortColumn] ?? "";
      let valB = b[sortColumn] ?? "";

      // Numeric sorting for ID and Age
      if (sortColumn === "ID" || sortColumn === "Age") {
        valA = Number(valA);
        valB = Number(valB);
        return ascending
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }

      // Default string sorting
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredSortedData.length / rowsPerPage);
  const paginatedData = filteredSortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (column: keyof CSVRow) => {
    if (sortColumn === column) {
      setAscending(!ascending);
    } else {
      setSortColumn(column);
      setAscending(true);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 p-4 items-center">
      <h3 className="text-center mb-4 text-lg font-bold">CSV Data Table</h3>

      {/* Search */}
      <div className="flex gap-2 items-center w-full max-w-4xl mb-4">
        <select
          value={searchColumn}
          onChange={(e) => setSearchColumn(e.target.value as keyof CSVRow)}
          className="border border-blue-300 focus:border-blue-500 p-2 rounded outline-none"
        >
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>

        <input
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1); // reset page when searching
          }}
          placeholder={`Search by ${searchColumn}...`}
          className="border border-blue-300 focus:border-blue-500 p-2 rounded flex-1 outline-none"
        />
      </div>

      {/* Table */}
      <div className="w-full max-w-4xl">
        {/* Table Header */}
        <div className="grid grid-cols-[3rem_1fr_2fr_4rem_1fr] gap-2 border-b font-bold p-2 cursor-pointer">
          {columns.map((col) => (
            <div
              key={col}
              className="text-left"
              onClick={() => handleSort(col)}
            >
              {col} {sortColumn === col ? (ascending ? "▲" : "▼") : ""}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {paginatedData.map((row, i) => (
          <Row
            key={i}
            values={[row.ID, row.Name, row.Email, row.Age, row.City]}
          />
        ))}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <div>
            <button
              className="bg-gray-200 px-3 py-1 rounded mr-2"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="bg-gray-200 px-3 py-1 rounded"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;
