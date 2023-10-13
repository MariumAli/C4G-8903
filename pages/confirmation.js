import styles from '@/styles/Home.module.css'
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';

export default function ConfirmationPage({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const data = router.query;

    // will be used to populate the similar records HTML data below
    const [similarRecordsResponse, setSimilarRecordsResponse] = useState([]);
    const [householdMemberSimilarRecords, setHouseholdMemberSimilarRecords] = useState([]);
    const [confirmRejectPressed, setConfirmRejectPressed] = useState(false);
    const [applicationStatus,  setApplicationStatus] = useState('');
    const [addRecordSuccess, setAddRecordSuccess] = useState(false);
    const [userRole, setUserRole] = useState("invalid");

    const [formData, setFormData] = useState({
        statusComments: "",
    });

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

    // gather similar records from the database
    useEffect(
        () => {
            async function getSimilarRecords() {
                if (router.isReady) {
                    let records_res = await fetch(
                        `/api/gatherSimilarRecords?dob=${data.DOB}&firstname=${data.FirstName}&lastname=${data.LastName}`,
                        {
                            method: "GET",
                            headers: {
                                "accept": "application/json",
                            },
                        },
                    );
                    let records = await records_res.json();

                    console.log("Setting Similar Records");
                    // console.log(records);
                    setSimilarRecordsResponse(records.result);

                    // parse out household members from query parameters
                    let members = {};
                    for (let key in data) {
                        if (key.startsWith("householdMember")) {
                            let elements = key.split("_");
                            if (elements.length != 3) {
                                continue;
                            }
                            let memberIndex = elements[1];
                            let fieldKey = elements[2];
                            let fieldVal = data[key];

                            if (!members.hasOwnProperty(memberIndex)) {
                                members[memberIndex] = {};
                            }
                            members[memberIndex][fieldKey] = fieldVal;
                        }
                    }

                    var newHouseholdMemberSimilarRecords = {};
                    for (let key in members) {
                        let member = members[key];
                        console.log("MEMBER: ", member);
                        var member_records_res = await fetch(
                            `/api/gatherSimilarRecords?dob=${member.dob}&firstname=${member.firstName}&lastname=${member.lastName}`,
                            {
                                method: "GET",
                                headers: {
                                    "accept": "application/json",
                                },
                            },
                        );
                        var member_records = await member_records_res.json();
                        for (let k in member_records.result) {
                            newHouseholdMemberSimilarRecords[k] = member_records.result[k];
                        }
                    }

                    console.log("Household Member Records: ", newHouseholdMemberSimilarRecords);
                    setHouseholdMemberSimilarRecords(newHouseholdMemberSimilarRecords);
                } else {
                    setSimilarRecordsResponse([]);
                    setHouseholdMemberSimilarRecords([]);
                }
            }
            getSimilarRecords();
        },
        [router.isReady, data]
    );

    const processApprove = () => {
        setConfirmRejectPressed(true);
        setApplicationStatus("Approved");
        addApplication("Approved");
    }

    const handleInput = (e) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        setFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue
        }));
    }

    // TODO: add an alert when a request is approved
    async function addApplication(appStatus) {
        var addRecordSuccessValue = false;
        if (router.isReady) {
            let add_res = await fetch(
                `/api/updateApplicationStatus?`
                + `status=Approved`
                + `&statusComments=${formData.statusComments}`
                + `&applicationId=${data.ApplicationId}`
                ,
                {
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                    },
                },
            );
            let records = await add_res.json();
            addRecordSuccessValue = records.result[0].success;
        }
        setAddRecordSuccess(addRecordSuccessValue);
        console.log(`Submitted, Success: ${addRecordSuccessValue}`);

        // trigger email notification
        let res = await fetch(
            `/api/mailAgent`,
            {
                method: "POST",
                query: data
            },
        );

        window.alert("Request has been processed, returning to home.");
        router.push('/');
    }

    async function processReject() {
        var addRecordSuccessValue = false;
        if (router.isReady) {
            let add_res = await fetch(
                `/api/updateApplicationStatus?`
                + `status=Rejected`
                + `&statusComments=${formData.statusComments}`
                + `&applicationId=${data.ApplicationId}`
                ,
                {
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                    },
                },
            );
            let records = await add_res.json();
            addRecordSuccessValue = records.result[0].success;
        }

        setConfirmRejectPressed(true);
        setApplicationStatus("Rejected");
        addApplication("Rejected");

        // trigger email notification
        let res = await fetch(
            `/api/mailAgent`,
            {
                method: "POST",
                query: data
            },
        );

        window.alert("Request has been processed, returning to home.");
        router.push('/');
    }

    async function processFurtherInfo() {
        var addRecordSuccessValue = false;
        if (router.isReady) {
            let add_res = await fetch(
                `/api/updateApplicationStatus?`
                + `status=Pending - Agent Action`
                + `&statusComments=${formData.statusComments}`
                + `&applicationId=${data.ApplicationId}`
                ,
                {
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                    },
                },
            );
            let records = await add_res.json();
            addRecordSuccessValue = records.result[0].success;
        }

        setConfirmRejectPressed(true);
        setApplicationStatus("Pending");
        addApplication("Pending - Agent Action");

        // trigger email notification
        let res = await fetch(
            `/api/mailAgent`,
            {
                method: "POST",
                query: data
            },
        );

        window.alert("Request has been processed, returning to home.");
        router.push('/');
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
    }
    if (!["agent", "agent-admin", "admin"].includes(userRole)) {
        return (
            <main className={styles.main}>
                <h1>Insufficient Privileges</h1>
                <br></br>
                <div className={styles.card}>
                    <p>This page requires agent-level or admin-level privileges to access, sign in with a different account with these privileges to use this page.</p>
                    <br></br>
                    <button className={styles.button} style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: "10px", marginBottom: "5px" }} onClick={() => router.push('/')}>
                        Return Home
                    </button>
                </div>
            </main>
        )
    }

    return (
        confirmRejectPressed ? (
            <main className={styles.main}>
                <h1>Form Confirmation</h1>
                <p style={{marginLeft: 'auto', marginRight: 'auto', marginTop: "10px", marginBottom: "5px"}}>
                    {`Application Status: ${applicationStatus}`}
                </p>
                <br></br>
                <button className={styles.button} style={{marginLeft: 'auto', marginRight: 'auto', marginTop: "10px", marginBottom: "5px"}} onClick={() => router.push('/')}>
                    Return Home
                </button>
            </main>
        ) : (
            <main className={styles.main}>
                <h1>Form Confirmation</h1>
                <p style={{marginLeft: 'auto', marginRight: 'auto', marginTop: "10px", marginBottom: "5px"}}>
                    Review the following application information before submitting.
                </p>

                <div className={styles.card}>
                    <h2>
                        {`Pending Request for "${data.FirstName} ${data.MiddleName} ${data.LastName}"`}
                    </h2>
                    <br></br>
                    <p>{`DOB: ${data.DOB}`}</p>
                    <p>{`Address: ${data.StreetAddress}, ${data.City} (${data.PostalCode})`}</p>
                    <p>{`Agency: ${data.LROAgencyName} (LRO #${data.LRONumber})`}</p>
                    <p>{`Jurisdiction: ${data.Jurisdiction}`}</p>
                    <p>{`Funding Phase: ${data.FundingPhase}`}</p>
                    <p>{`Payment Vendor: ${data.PaymentVendor}`}</p>
                    <p>{`Monthly Rent: $${data.MonthlyRentAmt}`}</p>
                    <p>{`Monthly Rent LRO: $${data.MonthyRentAmt_LRO}`}</p>
                    <p>{`Monthly Mortgage: $${data.MonthlyMortgageAmt}`}</p>
                    <p>{`Monthly Mortgage LRO: $${data.MonthlyMortgageAmt_LRO}`}</p>
                    <p>{`Lodging Night Count: $${data.LodgingNightCount}`}</p>
                    <p>{`Lodging Night Cost: $${data.LodgingCostPerNight}`}</p>
                    <p>{`Lodging Night Cost LRO: $${data.LodgingCostPerNight_LRO}`}</p>
                    <p>{`Monthly Gas: $${data.MonthlyGasAmt}`}</p>
                    <p>{`Monthly Gas LRO: $${data.MonthlyGasAmt_LRO}`}</p>
                    <p>{`Monthly Electric: $${data.MonthlyElectricityAmt}`}</p>
                    <p>{`Monthly Electric LRO: $${data.MonthlyElectricityAmt_LRO}`}</p>
                    <p>{`Monthly Water: $${data.MonthlyWaterAmt}`}</p>
                    <p>{`Monthly Water LRO: $${data.MonthlyWaterAmt_LRO}`}</p>
                </div>

                <div className={styles.card}>
                    <h2>Existing Similar Records</h2>
                    <br></br>
                    <p>
                        The following information shows previously approved funding records for applicants that have been detected to be similar to the current pending applicant. Take a look at these to ensure there is no duplication of information or resources before confirming the request.
                    </p>
                    {
                        Object.keys(similarRecordsResponse).map(
                            (name) => {
                                let dob = similarRecordsResponse[name].dob;
                                let history = similarRecordsResponse[name].history;
                                console.log(`Found Similar Applicant: ${name} (DOB: ${dob})`);
                                return (
                                    <div key={name}>
                                        <br></br>
                                        <h3>{`${name} (${dob})`}</h3>
                                        {
                                            history.map(
                                                (application) => {
                                                    return (
                                                        <div key={application.identity} className={styles.card}>
                                                            <p>{`Date: ${application.date}`}</p>
                                                            <p>{`Jurisdiction: ${application.jurisdiction}`}</p>
                                                            <p>{`Funding Phase: ${application.fundingPhase}`}</p>
                                                            <p>{`Agency: ${application.agency}`}</p>
                                                            <p>{`Payment Vendor: ${application.paymentVendor}`}</p>
                                                            <p>{`Monthly Rent: $${application.rent}`}</p>
                                                            <p>{`Monthly Rent LRO: $${application.rentLRO}`}</p>
                                                            <p>{`Monthly Mortgage: $${application.mortgage}`}</p>
                                                            <p>{`Monthly Mortgage LRO: $${application.mortgageLRO}`}</p>
                                                            <p>{`Lodging Night Count: ${application.lodgingCount}`}</p>
                                                            <p>{`Lodging Nightly Cost: $${application.lodgingCost}`}</p>
                                                            <p>{`Lodging Nightly Cost LRO: $${application.lodgingCostLRO}`}</p>
                                                            <p>{`Monthly Gas: $${application.gas}`}</p>
                                                            <p>{`Monthly Gas LRO: $${application.gasLRO}`}</p>
                                                            <p>{`Monthly Electric: $${application.electric}`}</p>
                                                            <p>{`Monthly Electric LRO: $${application.electricLRO}`}</p>
                                                            <p>{`Monthly Water: $${application.water}`}</p>
                                                            <p>{`Monthly Water LRO: $${application.waterLRO}`}</p>
                                                        </div>
                                                    )
                                                }
                                            )
                                        }
                                    </div>
                                )
                            }
                        )
                    }
                </div>
                <br></br>

                <div className={styles.card}>
                    <h2>Existing Similar Records of Household Members</h2>
                    <br></br>
                    <p>
                        The following information shows previously approved funding records for applicants that have been detected to be similar to household members of the current pending applicant. Take a look at these to ensure there is no duplication of information or resources before confirming the request.
                    </p>
                    {
                        Object.keys(householdMemberSimilarRecords).map(
                            (name) => {
                                let dob = householdMemberSimilarRecords[name].dob;
                                let history = householdMemberSimilarRecords[name].history;
                                console.log(`Found Similar Applicant: ${name} (DOB: ${dob})`);
                                return (
                                    <div key={name}>
                                        <br></br>
                                        <h3>{`${name} (${dob})`}</h3>
                                        {
                                            history.map(
                                                (application) => {
                                                    return (
                                                        <div key={application.identity} className={styles.card}>
                                                            <p>{`Date: ${application.date}`}</p>
                                                            <p>{`Jurisdiction: ${application.jurisdiction}`}</p>
                                                            <p>{`Funding Phase: ${application.fundingPhase}`}</p>
                                                            <p>{`Agency: ${application.agency}`}</p>
                                                            <p>{`Payment Vendor: ${application.paymentVendor}`}</p>
                                                            <p>{`Monthly Rent: $${application.rent}`}</p>
                                                            <p>{`Monthly Rent LRO: $${application.rentLRO}`}</p>
                                                            <p>{`Monthly Mortgage: $${application.mortgage}`}</p>
                                                            <p>{`Monthly Mortgage LRO: $${application.mortgageLRO}`}</p>
                                                            <p>{`Lodging Night Count: ${application.lodgingCount}`}</p>
                                                            <p>{`Lodging Nightly Cost: $${application.lodgingCost}`}</p>
                                                            <p>{`Lodging Nightly Cost LRO: $${application.lodgingCostLRO}`}</p>
                                                            <p>{`Monthly Gas: $${application.gas}`}</p>
                                                            <p>{`Monthly Gas LRO: $${application.gasLRO}`}</p>
                                                            <p>{`Monthly Electric: $${application.electric}`}</p>
                                                            <p>{`Monthly Electric LRO: $${application.electricLRO}`}</p>
                                                            <p>{`Monthly Water: $${application.water}`}</p>
                                                            <p>{`Monthly Water LRO: $${application.waterLRO}`}</p>
                                                        </div>
                                                    )
                                                }
                                            )
                                        }
                                    </div>
                                )
                            }
                        )
                    }
                </div>
                <br></br>
                <div className={styles.container}>
                	<label className={styles.required}>Comments: </label>
                	<span style={{overflow: "hidden", marginTop: "5px" }}>
                		<input type="text" required={true} name="statusComments" style={{ width: '100%' }} onChange={handleInput} value={formData.statusComments} />
                	</span>
                </div>
                <div style={{display: "flex"}}>
                    <button className={styles.button} style={{marginLeft: '5px', marginRight: '5px', marginTop: "15px", marginBottom: "5px"}} onClick={() => processApprove()}>
                        Accept
                    </button>
                    <button className={styles.button} style={{marginLeft: '5px', marginRight: '5px', marginTop: "15px", marginBottom: "5px"}} onClick={() => processReject()}>
                        Reject
                    </button>
                    <button className={styles.button} style={{marginLeft: '5px', marginRight: '5px', marginTop: "15px", marginBottom: "5px"}} onClick={() => processFurtherInfo()}>
                        Ask for further Information
                    </button>
                </div>
            </main>
        )
    )
}