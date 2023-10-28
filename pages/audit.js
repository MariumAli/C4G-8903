import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import ResponsiveRecordsTable from '@/components/ResponsiveRecordsTable';
import { columns, initialVisibleColumns } from "@/data";
import { Button, CircularProgress } from "@nextui-org/react";
import { CSVLink } from "react-csv";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import Alert from '@mui/material/Alert';


export default function Audit({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [allRecords, setAllRecords] = useState([]);
    const [allRecordsWithHouseholdMembers, setAllRecordsWithHouseholdMembers] = useState([]);
    const [userRole, setUserRole] = useState("invalid");
    const [isLoading, setIsLoading] = useState(true);


    useEffect(
        () => {
            async function fetchUserRole() {
                if ((router.isReady) && session && session.user && session.user.email && (status === "authenticated")) {
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
                }
            }
            fetchUserRole();
        },
        [router.isReady, status, session]
    );


    useEffect(
        () => {
            async function getAllRecords() {
                if (router.isReady && session && session.user && session.user.email && userRole) {

                    if (userRole != "admin") {
                        let records_res = await fetch(
                            `/api/gatherAllRecordsForEmail?requestorEmail=${session.user.email}`,
                            {
                                method: "GET",
                                headers: {
                                    "accept": "application/json",
                                },
                            },
                        );
                        let records = await records_res.json();

                        console.log("Setting All Applicant Records for email");
                        console.log(records.result);
                        setAllRecords(records.result);
                        setIsLoading(false);
                    } else {
                        let records_res = await fetch(
                            `/api/gatherAllRecords`,
                            {
                                method: "GET",
                                headers: {
                                    "accept": "application/json",
                                },
                            },
                        );
                        let records = await records_res.json();

                        console.log("Setting All Applicant Records for admin");
                        setAllRecords(records.result);
                        setIsLoading(false);
                    }
                } else {
                    setAllRecords([]);
                    setIsLoading(false);
                }
            }

            getAllRecords();
        },
        [router.isReady, status, session, userRole]
    );



    useEffect(
        () => {
            async function getAllRecordsWithHouseholdMembers() {
                if (router.isReady && session && session.user && session.user.email && userRole) {

                    if (userRole == "admin") {
                        let records_res = await fetch(
                            `/api/gatherAllRecordsWithHouseholdMembers`,
                            {
                                method: "GET",
                                headers: {
                                    "accept": "application/json",
                                },
                            },
                        );
                        let records = await records_res.json();

                        console.log("Setting All Applicant Records for email");
                        console.log(records.result);
                        setAllRecordsWithHouseholdMembers(records.result);
                    }
                }
            }

            getAllRecordsWithHouseholdMembers();
        },
        [router.isReady, status, session, userRole]
    );

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
    if (status != "authenticated") {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                textAlign: "center",
                minHeight: "100vh",
            }}>
                <Card>
                    <CardHeader>
                        <p className="flex font-mono font-medium text-xl mt-10">
                            Page Requires Authentication
                        </p>
                    </CardHeader>
                    <CardBody className="flex gap-3">
                        <p>Navigate to the home page and sign-in first.</p>
                        <Button className="text-lg" color="danger" onClick={() => router.push('/')}>
                            Return Home
                        </Button>

                    </CardBody>
                </Card>
            </div>
        )
    } else if (isLoading) {
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
    } else if (!["agent", "admin-agent", "admin"].includes(userRole)) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                textAlign: "center",
                minHeight: "100vh",
            }}>
                <Card>
                    <CardHeader>
                        <p className="flex font-mono font-medium text-xl mt-10">
                            Insufficient Privileges
                        </p>
                    </CardHeader>
                    <CardBody className="flex gap-3">
                        <p>This page requires agent-level or admin-level privileges to access, sign in with a different account with these privileges to use this page.</p>
                        <br></br>
                        <Button className="text-lg" color="danger" onClick={() => router.push('/')}>
                            Return Home
                        </Button>

                    </CardBody>
                </Card>
            </div>
        )
    } else {
        return (userRole ? (
            <div className="flex w-full flex-col flex-nowrap items-center text-base ">
                <p className="flex font-mono font-medium text-6xl mt-10 mb-12"></p>

                <div className="flex flex-col flex-nowrap mt-15 items-center">
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
                                    data={allRecordsWithHouseholdMembers}>
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
        ) : ''
        );
    }
}

