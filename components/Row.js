import styles from '@/styles/Home.module.css';
import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
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
import { columns, statusOptions } from "@/data";
import { capitalize } from "@/utils";
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export function Row(props) {
    const { rowsChildren, rowDetail, isCollapsible } = props;
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                {isCollapsible ? (<TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>) : ""}
                {rowsChildren}
            </TableRow>
            <TableRow>
                {rowDetail}
            </TableRow>
        </React.Fragment>
    );
}
