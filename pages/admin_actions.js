import React, { useEffect, useState, useMemo } from "react";
import { CSVLink } from "react-csv";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import SliderColumnFilter from '@/components/SliderColumnFilter';
import SelectColumnFilter from '@/components/SelectColumnFilter';
import filterGreaterThan from '@/components/filterGreaterThan';
import Table from '@/components/Table';
import styles from '@/styles/Home.module.css'
import styled from 'styled-components';


const Styles = styled.div`
  padding: 1rem;
  flex-direction: left;

  div {
    button {
        font-size:10 rem;
        padding: 0.5rem;
        margin-bottom: 2rem;
        align-items: right;
    }
  }
  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`

export default function AdminActions({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [allRecords, setAllRecords] = useState([]);
    const [formData, setFormData] = useState({ "applicationID": 0 });
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

    const columns = useMemo(
        () => [
            {
                Header: 'ID',
                columns: [
                    {
                        Header: 'Application ID',
                        accessor: 'ApplicationId',
                        Filter: SliderColumnFilter,
                        filter: filterGreaterThan,
                    },
                ],
            },
            {
                Header: 'Name',
                columns: [
                    {
                        Header: 'First Name',
                        accessor: 'FirstName',
                    },
                    {
                        Header: 'Middle Name',
                        accessor: 'MiddleName',
                    },
                    {
                        Header: 'Last Name',
                        accessor: 'LastName',
                    },
                ],
            },
            {
                Header: 'Additional Information',
                columns: [
                    {
                        Header: 'Date Of Birth',
                        accessor: 'DOB',
                    },
                    {
                        Header: 'Street Address',
                        accessor: 'StreetAddress',
                    },
                    {
                        Header: 'City',
                        accessor: 'City',
                        Filter: SelectColumnFilter,
                        filter: 'includes',
                    },
                    {
                        Header: 'Country',
                        accessor: 'Country',
                        Filter: SelectColumnFilter,
                        filter: 'includes',
                    },
                    {
                        Header: 'Postal Code',
                        accessor: 'PostalCode',
                    },
                    {
                        Header: 'Application Date',
                        accessor: 'RequestDate',
                    },
                ],
            },
            {
                Header: 'Agency Information',
                columns: [
                    {
                        Header: 'LRO Number',
                        accessor: 'LRONumber',
                    },
                    {
                        Header: 'Agency Name',
                        accessor: 'LROAgencyName',
                    },
                    {
                        Header: 'Agency Email',
                        accessor: 'LROEmail',
                    },
                    {
                        Header: 'Jurisdiction',
                        accessor: 'Jurisdiction',
                    },
                ],
            },
            {
                Header: 'Funding Information',
                columns: [
                    {
                        Header: 'Payment Vendor',
                        accessor: 'PaymentVendor',
                    },
                    {
                        Header: 'Funding Phase',
                        accessor: 'FundingPhase',
                    },
                    {
                        Header: 'Monthly Rent ($)',
                        accessor: 'MonthlyRentAmt',
                    },
                    {
                        Header: 'LRO Monthly Rent ($)',
                        accessor: 'MonthyRentAmt_LRO',
                    },
                    {
                        Header: 'Monthly Mortgage ($)',
                        accessor: 'MonthlyMortgageAmt',
                    },
                    {
                        Header: 'LRO Monthly Mortgage ($)',
                        accessor: 'MonthlyMortgageAmt_LRO',
                    },
                    {
                        Header: 'Lodging Night Count',
                        accessor: 'LodgingNightCount',
                    },
                    {
                        Header: 'Lodging Nightly Cost ($)',
                        accessor: 'LodgingCostPerNight',
                    },
                    {
                        Header: 'LRO Lodging Nightly Cost ($)',
                        accessor: 'LodgingCostPerNight_LRO',
                    },
                    {
                        Header: 'Monthly Gas ($)',
                        accessor: 'MonthlyGasAmt',
                    },
                    {
                        Header: 'LRO Monthly Gas ($)',
                        accessor: 'MonthlyGasAmt_LRO',
                    },
                    {
                        Header: 'Monthly Electric ($)',
                        accessor: 'MonthlyElectricityAmt',
                    },
                    {
                        Header: 'LRO Monthly Electric ($)',
                        accessor: 'MonthlyElectricityAmt_LRO',
                    },
                    {
                        Header: 'Monthly Water ($)',
                        accessor: 'MonthlyWaterAmt',
                    },
                    {
                        Header: 'LRO Monthly Water ($)',
                        accessor: 'MonthlyWaterAmt_LRO',
                    },
                ],
            },
        ],
        []
    )

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
                        `/api/gatherAllRecords`,
                        {
                            method: "GET",
                            headers: {
                                "accept": "application/json",
                            },
                        },
                    );
                    let records = await records_res.json();

                    console.log("Setting All Applicant Records");
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

    const handleInput = (e) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        setFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue
        }));
    }

    const submitApplicationRemoveForm = async (e) => {
        // We don't want the page to refresh
        e.preventDefault();

        if (formData.hasOwnProperty("applicationID")) {
            let res = await fetch(
                `/api/removeRecord?identity=${formData.applicationID}`,
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
        } else {
            alert("An error has occurred in parsing this form, please refresh the page.");
        }

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
                    <h1>Admin - Pending Applications</h1>
                    <div className={styles.container} style={{ width: '30%', minWidth: "250px" }}>
                        <h2 style={{ marginTop: '10px', marginBottom: "10px" }}>Remove Record</h2>
                        <p style={{ marginTop: '10px', marginBottom: "10px" }}>
                            {"Remove a record (equivalent to a row in the table below) by it's \"ApplicationID\" field."}
                        </p>
                        <form id="remove-record-form" onSubmit={submitApplicationRemoveForm} style={{ overflow: 'hidden' }}>
                            <div className={styles.container}>
                                <label className={styles.required}>Application ID: </label>
                                <span style={{ display: "block", overflow: "hidden", marginTop: "5px" }}>
                                    <input type="number" required={true} name="applicationID" style={{ width: '100%' }} onChange={handleInput} value={formData.applicationID} />
                                </span>
                            </div>
                            <button className={styles.button} style={{ marginTop: '10px', marginBottom: "10px" }} type="submit">Submit</button>
                        </form>
                    </div>
                    <h2 style={{ marginTop: '10px', marginBottom: "10px" }}>Explore Records</h2>
                    <Styles>
                        <Table columns={columns} data={allRecords} />
                    </Styles>
                    <div className={styles.container}>
                        <h2 style={{ marginTop: '10px', marginBottom: "10px" }}>Download Records</h2>
                        <p style={{ marginTop: '10px', marginBottom: "10px" }}>
                            {"Download all Records to an Excel file"}
                        </p>
                        {/* Export Button Start */}
                        <CSVLink id="download-records-form" filename="records.csv"
                            data={allRecords}
                            className={styles.button}
                            style={{ marginTop: '10px', marginBottom: "10px" }}>
                            Export Records to CSV
                        </CSVLink>

                    </div>
                    <div className={styles.container}>
                        <h2 style={{ marginTop: '10px', marginBottom: "10px" }}>Delete All Records</h2>
                        <p style={{ marginTop: '10px', marginBottom: "10px" }}>
                            {"Deletes all Records and resets the Database"}
                        </p>
                        <button
                            className={styles.button}
                            style={{ marginTop: '10px', marginBottom: "10px" }}
                            onClick={e => submitDeleteAllRecords(e)}
                        >
                            Delete All Records
                        </button>


                    </div>
                </main>
            );
        }
    }
}
