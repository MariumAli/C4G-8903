import styles from '@/styles/Home.module.css';
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import ResponsiveRecordsTable from '@/components/ResponsiveRecordsTable';
import { columns, initialVisibleColumns } from "@/data";


export default function Audit({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [allRecords, setAllRecords] = useState([]);
    const [userRole, setUserRole] = useState("invalid");


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
                }
            }
            fetchUserRole();
        },
        [router.isReady, status, session]
    );


    useEffect(
        () => {
            async function getAllRecords() {
                if (router.isReady && session && session.user) {

                    if (userRole != "admin"){
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
                        setAllRecords(records.result);
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
                    }
                } else {
                    setAllRecords([]);
                }
            }

            getAllRecords();
        },
        [router.isReady, status, session]
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
                <main className={styles.auditmain}>
                    <h2 style={{ marginTop: '10px', marginBottom: "10px" }}>Historical Requests</h2>
                    <ResponsiveRecordsTable allRecords={allRecords} 
                    onUpdate={updateApplicationStatus} 
                    onDelete={deleteApplication}
                    onEdit={editApplication} 
                    columns={columns}
                    initialVisibleColumns={initialVisibleColumns}
                    />
                </main>
            );
        }
    }
}
