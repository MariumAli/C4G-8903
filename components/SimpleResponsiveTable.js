import React from "react";
import { useRouter } from 'next/router';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Pagination,
} from "@nextui-org/react";
import { SearchIcon } from "@/components/SearchIcon";
import { userColumns } from "@/data";

export default function SimpleResponsiveTable({ allRecords }) {
    const router = useRouter();
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [sortDescriptor, setSortDescriptor] = React.useState({
        column: "email",
        direction: "ascending",
    });
    const [filterEmailValue, setFilterEmailValue] = React.useState("");

    const [page, setPage] = React.useState(1);

    const hasEmailSearchFilter = Boolean(filterEmailValue);

    const filteredItems = React.useMemo(() => {
        let filteredData = [...allRecords];

        if (hasEmailSearchFilter) {
            filteredData = filteredData.filter((record) => {
                return record["email"].toLowerCase().includes(filterEmailValue.toLowerCase());
            });
        }


        return filteredData;
    }, [allRecords, filterEmailValue]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);


    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);


    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onRowsPerPageChange = React.useCallback((e) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);


    const onEmailSearchChange = React.useCallback((value) => {
        if (value) {
            setFilterEmailValue(value);
            setPage(1);
        } else {
            setFilterEmailValue("");
        }
    }, []);

    const onEmailClear = React.useCallback(() => {
        setFilterEmailValue("")
        setPage(1)
    }, [])

    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[40%]"
                        placeholder="Search by requestor email..."
                        startContent={<SearchIcon />}
                        value={filterEmailValue}
                        onClear={() => onEmailClear()}
                        onValueChange={onEmailSearchChange}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {allRecords.length} records</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                        >
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">25</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [
        filterEmailValue,
        onRowsPerPageChange,
        allRecords.length,
        onEmailSearchChange,
        hasEmailSearchFilter,
    ]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
            <span className="w-[30%] text-small text-default-400">
                {`${allRecords.length} User records available`}
            </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                        Previous
                    </Button>
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [items.length, page, pages, hasEmailSearchFilter]);



    return (

        <Table
            aria-label="All Records"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
                wrapper: "max-h-[1200px]",
            }}
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSortChange={setSortDescriptor}
        >
            <TableHeader classNames={{ description: "text-default-500", }} className="bg-white dark:bg-black" columns={userColumns}>
                {(column) => (
                    <TableColumn
                        key={column.uid}
                        align={column.uid === "actions" ? "center" : "start"}
                        allowsSorting={column.sortable}
                    >
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody className="text-lg bg-white dark:bg-black" emptyContent={"No records found"}>
                {sortedItems.map((item, idx) => {
                    return (
                        <TableRow key={idx}>
                            {
                                Object.values(item).map((value) => {
                                    return (<TableCell>{value}</TableCell>)
                                })
                            }
                        </TableRow>
                    )
                })
                }
            </TableBody>
        </Table>


    );
}