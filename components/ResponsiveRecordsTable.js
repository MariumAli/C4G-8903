import React from "react";
import { useRouter } from 'next/router';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
    Input,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Chip,
    Pagination,
} from "@nextui-org/react";
import { PlusIcon } from "@/components/PlusIcon";
import { EditIcon } from "@/components/EditIcon";
import { DeleteIcon } from "@/components/DeleteIcon";
import { EyeIcon } from "@/components/EyeIcon";
import { SearchIcon } from "@/components/SearchIcon";
import { ChevronDownIcon } from "@/components/ChevronDownIcon";
import { CheckIcon } from "@/components/CheckIcon";
import { columns, statusOptions, initialVisibleColumns, statusColorMap, dateOptions } from "@/data";
import { capitalize } from "@/utils";
import { Card, CardBody, Divider } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import Alert from '@mui/material/Alert';



export default function ResponsiveTable({ allRecords, onUpdate, onDelete, onEdit, userRole, householdMembers }) {
    const router = useRouter();
    const [filterValue, setFilterValue] = React.useState("");
    const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
    const [visibleColumns, setVisibleColumns] = React.useState(new Set(initialVisibleColumns));
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [openedRow, setOpenedRow] = React.useState(null);
    const [selectedApplicantHouseholdMembers, setSelectedApplicantHouseholdMembers] = React.useState([]);
    const [sortDescriptor, setSortDescriptor] = React.useState({
        column: "ApplicationID",
        direction: "ascending",
    });
    const [filterEmailValue, setFilterEmailValue] = React.useState("");
    const { isOpen, onOpen, onClose, } = useDisclosure();


    // console.log('inside responsive table');
    // console.log(allRecords);

    React.useEffect(
        () => {
            async function getHouseHoldMembers() {
                // console.log("Lets get household member info for applicant: ");
                // console.log(openedRow);
                if (openedRow && openedRow.ApplicationId) {
                    let res_household_members = await fetch(
                        `/api/getHouseHoldMembers?applicantId=${openedRow.ApplicationId}`,
                        {
                            method: "GET",
                            headers: {
                                "accept": "application/json",
                            },
                        },
                    );
                    let household_members = await res_household_members.json();

                    // console.log("Setting HouseHold Members for selected applicant");
                    // console.log(household_members);
                    setSelectedApplicantHouseholdMembers(household_members.result);
                    onOpen();
                }
            }
            getHouseHoldMembers();
        },
        [openedRow]
    );

    const handleOpen = React.useCallback((record) => {
        setOpenedRow(record);
    }, [onOpen]);

    const [page, setPage] = React.useState(1);

    const hasSearchFilter = Boolean(filterValue);
    const hasEmailSearchFilter = Boolean(filterEmailValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;

        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredData = [...allRecords];

        if (hasSearchFilter) {
            filteredData = filteredData.filter((record) => {
                let recordName = record["FirstName"] + record["MiddleName"] + record["LastName"];
                return recordName.toLowerCase().includes(filterValue.toLowerCase());
            });
        }

        if (hasEmailSearchFilter) {
            filteredData = filteredData.filter((record) => {
                return record["RequestorEmail"].toLowerCase().includes(filterEmailValue.toLowerCase());
            });
        }

        if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
            filteredData = filteredData.filter((record) =>
                Array.from(statusFilter).includes(record["Status"].toLowerCase()),
            );
        }


        return filteredData;
    }, [allRecords, filterValue, filterEmailValue, statusFilter, hasEmailSearchFilter, hasSearchFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        let isDate = sortDescriptor.column == "DecisionDate" || sortDescriptor.column == "DOB" || sortDescriptor.column == "RequestDate"
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);


    const renderCell = React.useCallback((record, columnKey) => {
        switch (columnKey) {
            case "FirstName":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize"> {record["FirstName"]} {record["MiddleName"]} {record["LastName"]}</p>
                    </div>
                );
            case "Country":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize">{record["StreetAddress"]}, {record["PostalCode"]}</p>
                        <p className="text-bold text-tiny capitalize text-default-400">{record["City"]}. {record["Country"]}</p>
                    </div>
                );
            case "Status":
                var date = record?.DecisionDate != undefined ? new Date(record["DecisionDate"]) : null;
                return (
                    <div className="flex flex-col">
                        <Chip className="capitalize" color={statusColorMap[record[columnKey]]} size="sm" variant="flat">
                            {record[columnKey]}
                        </Chip>
                        {date ? (<p className="text-bold text-tiny capitalize text-default-400">{date.toLocaleDateString('en-US', dateOptions)}</p>) : ""}
                    </div>
                );
            case "DOB":
                var date = new Date(record["DOB"]);
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize"> {date.toLocaleDateString('en-US', dateOptions)}</p>
                    </div>
                );
            case "RequestDate":
                var date = new Date(record["RequestDate"]);
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize"> {date.toLocaleDateString('en-US', dateOptions)}</p>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip color="success" content="View Record Details">
                            <Button className="text-lg text-default-400 cursor-pointer active:opacity-50" variant="outlined" onClick={() => handleOpen(record)}>
                                <EyeIcon />
                            </Button>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete Record">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                <Button className="text-lg text-default-400 cursor-pointer active:opacity-50" variant="outlined" onClick={() => onDelete(record)}>
                                    <DeleteIcon />
                                </Button>
                            </span>
                        </Tooltip>

                        {record["Status"] == "Pending" || record["Status"] == "Pending - Agent Action" || record["Status"] == "Pending - Admin Action" ?
                            (
                                <>
                                    <Tooltip color="primary" content="Edit Record">
                                        <span className="text-lg text-primary cursor-pointer active:opacity-50">
                                            <Button className="text-lg text-default-400 cursor-pointer active:opacity-50" variant="outlined" onClick={() => onEdit(record)}>
                                                <EditIcon />
                                            </Button>
                                        </span>
                                    </Tooltip>
                                    {userRole == "admin" ? (
                                        <Tooltip content="Approve Record">
                                            <Button className="text-lg text-default-400 cursor-pointer active:opacity-50" variant="outlined" onClick={() => onUpdate(record, "Approved")}>
                                                <CheckIcon />
                                            </Button>
                                        </Tooltip>
                                    ) : ''
                                    }
                                </>
                            ) : ""}
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col">
                        <p>{record[columnKey]}</p>
                    </div>
                );
        }
    }, [handleOpen, onDelete, onUpdate, onEdit]);

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

    const onSearchChange = React.useCallback((value) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);


    const onEmailSearchChange = React.useCallback((value) => {
        if (value) {
            setFilterEmailValue(value);
            setPage(1);
        } else {
            setFilterEmailValue("");
        }
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("")
        setPage(1)
    }, [])

    const onEmailClear = React.useCallback(() => {
        setFilterEmailValue("")
        setPage(1)
    }, [])

    const topContent = React.useMemo(() => {
        return (
            <><div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[40%]"
                        placeholder="Search by name..."
                        startContent={<SearchIcon />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange} />
                    <Input
                        isClearable
                        className="w-full sm:max-w-[40%]"
                        placeholder="Search by requestor email..."
                        startContent={<SearchIcon />}
                        value={filterEmailValue}
                        onClear={() => onEmailClear()}
                        onValueChange={onEmailSearchChange} />
                    <div className="flex gap-3">
                        <Dropdown>
                            <Tooltip showArrow={true} content="Use this Status Dropdown to Filter Pending Requests">
                                <div>
                                    <DropdownTrigger className="hidden sm:flex">
                                        <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                                            Status
                                        </Button>
                                    </DropdownTrigger>
                                </div>
                            </Tooltip>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={statusFilter}
                                selectionMode="multiple"
                                onSelectionChange={setStatusFilter}
                            >
                                {statusOptions.map((status) => (
                                    <DropdownItem key={status.uid} className="capitalize">
                                        {capitalize(status.name)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Dropdown>
                            <Tooltip showArrow={true} content="Use this Columns Dropdown too Add or Remove Columns From Table View">
                                <div>
                                    <DropdownTrigger className="hidden sm:flex">
                                        <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                                            Columns
                                        </Button>
                                    </DropdownTrigger>
                                </div>
                            </Tooltip>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns}
                            >
                                {columns.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize">
                                        {capitalize(column.name)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Button color="primary" endContent={<PlusIcon />} onClick={() => router.push('/form')}>
                            Add New
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {allRecords.length} records</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                        >
                            <option value="10">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">25</option>
                        </select>
                    </label>
                </div>
            </div>
                <div className="flex container w-full">
                    <Alert severity="info" className="flex w-full px-15">Please use the Status filter to filter <b>Pending</b> records</Alert>
                </div>
            </>
        );
    }, [
        filterValue,
        filterEmailValue,
        statusFilter,
        visibleColumns,
        onRowsPerPageChange,
        allRecords.length,
        onSearchChange,
        onClear,
        onEmailClear,
        onEmailSearchChange,
        router
    ]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} of ${filteredItems.length} selected`}
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
    }, [selectedKeys, page, pages, filteredItems.length, onNextPage, onPreviousPage]);

    return (
        <div className="min-w-full">

            <Table
                aria-label="All Records"
                isHeaderSticky
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[1200px] max-w-full	min-w-full",
                }}
                className="flex"
                // selectedKeys={selectedKeys}
                // selectionMode="multiple"
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSelectionChange={setSelectedKeys}
                onSortChange={setSortDescriptor}
            >
                <TableHeader classNames={{ description: "text-default-500", }} className="bg-white dark:bg-black" columns={headerColumns}>
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
                <TableBody className="text-lg bg-white dark:bg-black" emptyContent={"No records found"} items={sortedItems} >
                    {(item) => (
                        <TableRow key={item.ApplicationId}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>

                    )}
                </TableBody>
            </Table>

            {
                isOpen ? (
                    <Modal
                        backdrop={'blur'}
                        isOpen={isOpen}
                        onClose={onClose}
                        scrollBehavior={'outside'}
                        placement={'center'}
                        size={'5xl'}
                        className="py-4"
                    >
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1" fontSize={'20px'} id="customized-dialog-title">
                                        Record Details For Application ID: {openedRow.ApplicationId}
                                    </ModalHeader>
                                    <ModalBody>
                                        <Card className="flex">
                                            <CardBody>
                                                <div align="left"><b>Status:</b> {
                                                    <Chip className="capitalize" color={statusColorMap[openedRow.Status]} size="md" variant="flat">
                                                        {openedRow.Status}
                                                    </Chip>
                                                }
                                                </div>
                                                <div align="left"><b>Comments:</b> {openedRow.StatusComments}</div>
                                                <div align="left"><b>Requestor Email:</b> {openedRow.RequestorEmail}</div>
                                                <div align="left"><b>Request Date:</b> {new Date(openedRow.RequestDate).toLocaleDateString('en-US', dateOptions)}</div>
                                                <div align="left"><b>Decision Date:</b> {openedRow.DecisionDate ? new Date(openedRow.DecisionDate).toLocaleDateString('en-US', dateOptions) : ''}</div>
                                                <Divider className="my-4" />

                                                <div align="left"><b>Full Name:</b> {openedRow.FirstName} {openedRow.MiddleName} {openedRow.LastName}</div>
                                                <div align="left"><b>Date of Birth:</b> {new Date(openedRow.DOB).toLocaleDateString('en-US', dateOptions)}</div>
                                                <div align="left"><b>Address:</b> {openedRow.StreetAddress}, {openedRow.PostalCode}. {openedRow.City}, {openedRow.Country}.
                                                </div>
                                                <Divider className="my-4" />

                                                <div align="left"><b>LRO Number:</b> {openedRow.LRONumber}</div>
                                                <div align="left"><b>LRO Agency Name:</b> {openedRow.LROAgencyName}</div>
                                                <div align="left"><b>LRO Email:</b> {openedRow.LROEmail}</div>
                                                <div align="left"><b>Monthly Rent Amount:</b> ${openedRow.MonthlyRentAmt}</div>
                                                <div align="left"><b>LRO Monthly Rent Amount:</b> ${openedRow.MonthyRentAmt_LRO}</div>
                                                <div align="left"><b>Monthly Mortgage Amount:</b> ${openedRow.MonthlyMortgageAmt}</div>
                                                <div align="left"><b>LRO Monthly Mortgage Amount:</b> ${openedRow.MonthlyMortgageAmt_LRO}</div>
                                                <div align="left"><b>Lodging Cost/Night:</b> ${openedRow.LodgingCostPerNight}</div>
                                                <div align="left"><b>Lodging Night Count:</b> ${openedRow.LodgingNightCount}</div>
                                                <div align="left"><b>LRO Lodging Cost/Night:</b> ${openedRow.LodgingCostPerNight_LRO}</div>
                                                <div align="left"><b>Monthly Gas Amount:</b> ${openedRow.MonthlyGasAmt}</div>
                                                <div align="left"><b>LRO Monthly Gas Amount:</b> ${openedRow.MonthlyGasAmt_LRO}</div>
                                                <div align="left"><b>Monthly Electricity Amount:</b> ${openedRow.MonthlyElectricityAmt}</div>
                                                <div align="left"><b>LRO Monthly Electricity Amount</b> ${openedRow.MonthlyElectricityAmt_LRO}</div>
                                                <div align="left"><b>Monthly Water Amount:</b> ${openedRow.MonthlyWaterAmt}</div>
                                                <div align="left"><b>LRO Monthly Water Amount:</b> ${openedRow.MonthlyWaterAmt_LRO}</div>
                                                <Divider className="my-4" />

                                                <div align="left"><b>Funding Phase:</b> {openedRow.FundingPhase}</div>
                                                <div align="left"><b>Jurisdiction:</b> {openedRow.Jurisdiction}</div>
                                                <div align="left"><b>Payment Vendor:</b> {openedRow.PaymentVendor}</div>
                                            </CardBody>
                                        </Card>

                                        {
                                            selectedApplicantHouseholdMembers.length > 0 && <p className='flex justify-center font-mono uppercase text-black text-center font-bold text-xl'>
                                                HouseHold Members
                                            </p>
                                        }
                                        {selectedApplicantHouseholdMembers.map(
                                            (member) => {
                                                return (
                                                    <div key={member.identity}>
                                                        <Card key={member.identity} >
                                                            <CardBody>
                                                                <div align="left"><b>Full Name:</b> {member.FirstName} {member.MiddleName} {member.LastName}</div>
                                                                <div align="left"><b>Date of Birth:</b> {new Date(member.DOB).toLocaleDateString('en-US', dateOptions)}</div>
                                                            </CardBody>
                                                        </Card>
                                                    </div>

                                                );
                                            }
                                        )}

                                    </ModalBody>
                                    {openedRow.Status == "Pending" ? (
                                        <ModalFooter>
                                            <Button color="primary" variant="light" autoFocus onClick={() => onUpdate(openedRow, "Approved")}>
                                                Approve Record
                                            </Button>
                                            <Button color="danger" autoFocus onClick={() => onUpdate(openedRow, "Rejected")}>
                                                Reject Record
                                            </Button>
                                        </ModalFooter>
                                    ) : ''
                                    }
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                ) : ''
            }
        </div>
    );
}