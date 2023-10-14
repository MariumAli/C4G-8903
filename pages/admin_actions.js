import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import ResponsiveRecordsTable from '@/components/ResponsiveRecordsTable';
import styles from '@/styles/Home.module.css'
import { Button, CircularProgress } from "@nextui-org/react";
import { columns, initialVisibleColumns } from "@/data";


export default function AdminActions({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [allRecords, setAllRecords] = useState([]);
    const [userRole, setUserRole] = useState("invalid");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(
        () => {
            async function fetchUserRole() {
                if ((router.isReady) && (status === "authenticated")) {
                    let res = await fetch(
                        `/api/getUserRole?email=${session.user.email}`,
                        {
                            method: "GET",
                            headers: {
                                "accept": "application/json",
                            },
                        },
                    );
                    let res_json = await res.json();

                    console.log(`Role for ${session.user.email}: `, res_json);

                    if (res_json.hasOwnProperty('result')) {
                        setUserRole(res_json["result"]);
                    }
                    setIsLoading(false);
                }
            }
            fetchUserRole();
        },
        [router.isReady, status, session]
    );


    useEffect(
        () => {
            async function onStatusChange() {
                console.log(`status is: ${status}`);
            }
            onStatusChange();
        },
        [status]
    )

    useEffect(
        () => {
            async function getAllRecords() {
                if (router.isReady) {

                    let records_res = await fetch(
                        `/api/gatherPendingRecordsForAdmin`,
                        {
                            method: "GET",
                            headers: {
                                "accept": "application/json",
                            },
                        },
                    );
                    let records = await records_res.json();

                    console.log("Setting Pending Applicant Records for Admin");
                    console.log(records);
                    setAllRecords(records.result);
                } else {
                    setAllRecords([]);
                }
            }
            getAllRecords();
        },
        [router.isReady]
    );

    const submitDeleteAllRecords = async (e) => {
        // We don't want the page to refresh
        e.preventDefault();

        let res = await fetch(
            `/api/removeAllRecords`,
            {
                method: "DELETE",
                headers: {
                    "accept": "application/json",
                },
                body: { id: '*' }
            },
        );
        let res_json = await res.json();
        console.log(`Remove all record call response status: ${res.status}`);
        alert(res_json.result);

        window.location.reload();
    }

    async function updateApplication(record, status) {
        if (record) {
            let res = await fetch(
                `/api/updateApplication?identity=${record.ApplicationId}&status=${status}`,
                {
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                    },
                },
            );
            let res_json = await res.json();
            console.log(`update record call response status: ${res.status}`);
            alert(res_json.result);
        } else {
            alert("An error has occurred in parsing this form, please refresh the page.");
        }
        window.location.reload();

    }

    async function updateApplicationStatus(record) {

        let res = await fetch(
            `/api/getRecord?identity=${record.ApplicationId}`,
            {
                method: "GET",
                headers: {
                    "accept": "application/json",
                },
            },
        );
        let res_json = await res.json();
        console.log(`update record call response status: ${res.status}`);

        router.push(
            {
                pathname: "/confirmation",
                query: res_json.result[0]
            }
        );

    }

    async function deleteApplication(record) {

        let res = await fetch(
            `/api/removeRecord?identity=${record.ApplicationId}`,
            {
                method: "GET",
                headers: {
                    "accept": "application/json",
                },
            },
        );
        let res_json = await res.json();
        console.log(`remove record call response status: ${res.status}`);
        alert(res_json.result);

        window.location.reload();
    }

    async function editApplication(record) {

        let res = await fetch(
            `/api/getRecord?identity=${record.ApplicationId}`,
            {
                method: "GET",
                headers: {
                    "accept": "application/json",
                },
            },
        );
        let res_json = await res.json();
        console.log(`edit record call response status: ${res.status}`);

        router.push(
            {
                pathname: "/formEdit",
                query: res_json.result[0]
            }
        );

    }

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                }}
            >
                <CircularProgress
                    classNames={{
                        svg: "w-36 h-36 drop-shadow-md",
                        positions: "center"
                    }}
                    strokeWidth={4}
                    label={'Loading ...'}
                    size="lg"
                    color="warning"

                />
            </div>
        );
    } else {

        if (status != "authenticated") {
            return (
                <main className={styles.main}>
                    <h1>Page Requires Authentication</h1>
                    <br></br>
                    <div className={styles.card}>
                        <p>Navigate to the home page and sign-in first.</p>
                        <br></br>
                        <button className={styles.button} style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: "10px", marginBottom: "5px" }} onClick={() => router.push('/')}>
                            Return Home
                        </button>
                    </div>
                </main>
            )
        } else {
            if (userRole != "admin") {
                return (
                    <main className={styles.main}>
                        <h1>Insufficient Privileges {`(${userRole})`}</h1>
                        <br></br>
                        <div className={styles.card}>
                            <p>This page requires admin-level privileges to access, sign in with a different account with these privileges to use this page.</p>
                            <br></br>
                            <button className={styles.button} style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: "10px", marginBottom: "5px" }} onClick={() => router.push('/')}>
                                Return Home
                            </button>
                        </div>
                    </main>
                )
            } else {
                return (
                    <div className="flex flex-col flex-nowrap items-center text-base pb-10">
                        <p className="flex font-mono font-medium text-6xl mt-10 mb-12"></p>
                        <div className="flex flex-colflex-nowrap mt-15 items-center">
                            <ResponsiveRecordsTable allRecords={allRecords}
                                onUpdate={updateApplicationStatus}
                                onDelete={deleteApplication}
                                onEdit={editApplication}
                                columns={columns}
                                initialVisibleColumns={initialVisibleColumns}
                                userRole={userRole} />

                        </div>
                        {userRole == "admin" ? (
                            <div className="flex flex-row w-full space-y-4 flex-nowrap items-center mt-15">
                                <div className="flex text-base w-full space-y-4 flex-wrap flex-col items-center mt-10 pb-10">
                                    <p className="flex font-mono font-medium text-base">Export Records</p>
                                    <p className="flex font-mono font-medium text-sm">
                                        {"Exports all Records to an Excel file"}
                                    </p>
                                    {/* Export Button Start */}
                                    <Button color="primary">
                                        <CSVLink id="download-records-form" filename={`records-${new Date().toDateString()}.csv`}
                                            data={allRecords}>
                                            Export Records to CSV
                                        </CSVLink>
                                    </Button>
                                </div>

                                <div className="flex text-base w-full space-y-4 flex-wrap flex-col items-center mt-10 pb-10">
                                    <p className="flex font-mono font-medium text-base">Delete All Records</p>
                                    <p className="flex font-mono font-medium text-sm">
                                        {"Deletes all Records and resets the Database"}
                                    </p>
                                    <Button color="danger" onClick={(e) => submitDeleteAllRecords(e)}>
                                        Delete All Records
                                    </Button>

                                </div>

                            </div>
                        )
                            : ''
                        }
                    </div>
                )
            }
        }
    }
}
