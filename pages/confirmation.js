import styles from '@/styles/Home.module.css'
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { Button, Chip, CircularProgress, Textarea } from "@nextui-org/react";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { statusColorMap, dateOptions } from "@/data";


export default function ConfirmationPage({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const data = router.query;

    // will be used to populate the similar records HTML data below
    const [similarRecordsResponse, setSimilarRecordsResponse] = useState([]);
    const [householdMemberSimilarRecords, setHouseholdMemberSimilarRecords] = useState([]);
    const [confirmRejectPressed, setConfirmRejectPressed] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('');
    const [addRecordSuccess, setAddRecordSuccess] = useState(false);
    const [userRole, setUserRole] = useState("invalid");
    const [isLoading, setIsLoading] = useState(true);

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
                    setIsLoading(false);
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
                + `&statusComments=${data.statusComments}`
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
                + `&statusComments=${data.statusComments}`
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
                + `&statusComments=${data.statusComments}`
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
            <Card>
                <CardHeader>
                    Page Requires Authentication
                </CardHeader>
                <CardBody className="flex gap-3">
                    <p>Navigate to the home page and sign-in first.</p>
                    <Button className="text-lg" color="danger" onClick={() => router.push('/')}>
                        Return Home
                    </Button>

                </CardBody>
            </Card>
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
    } else if (!["agent", "agent-admin", "admin"].includes(userRole)) {
        return (
            <Card>
                <CardHeader>
                    <p className="flex font-mono font-medium text-6xl mt-10">
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

        )
    }
    else {
        return (
            confirmRejectPressed ? (
                <main className={styles.main}>
                    <h1>Form Confirmation</h1>
                    <p style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: "10px", marginBottom: "5px" }}>
                        {`Application Status: ${applicationStatus}`}
                    </p>
                    <br></br>
                    <button className={styles.button} style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: "10px", marginBottom: "5px" }} onClick={() => router.push('/')}>
                        Return Home
                    </button>
                </main>
            ) : (
                <>
                    <div className="flex flex-col flex-nowrap text-base mt-10">
                        <p className="flex font-mono justify-center uppercase text-black text-center font-bold items-center text-5xl">
                            Form Confirmation
                        </p>
                        <p className="flex font-mono text-black justify-center text-center items-center text-xl mt-7 mb-7">
                            Review the following application information before submitting.
                        </p>
                        <Card className="md:container md:mx-auto">
                            <CardHeader className="flex justify-center">
                                <p className='flex font-mono uppercase text-black text-center underline font-extrabold text-2xl'>
                                    {`Pending Request for "${data.FirstName} ${data.MiddleName} ${data.LastName}"`}
                                </p>
                            </CardHeader>

                            <CardBody>
                                <div align="left"><b>Status:</b>
                                    {<Chip className="capitalize" color={statusColorMap[data.Status]} size="md" variant="flat">
                                        {data.Status}
                                    </Chip>}
                                </div>
                                <div align="left"><b>Status Comments:</b> {data.StatusComments}</div>
                                <div align="left"><b>Requestor Email:</b> {data.RequestorEmail}</div>
                                <div align="left"><b>Request Date:</b> {new Date(data.RequestDate).toLocaleDateString('en-US', dateOptions)}</div>


                            </CardBody>
                            <Divider />

                            <CardBody>
                                <div align="left"><b>Full Name:</b> {data.FirstName} {data.MiddleName} {data.LastName}</div>
                                <div align="left"><b>Date of Birth:</b> {new Date(data.DOB).toLocaleDateString('en-US', dateOptions)}</div>
                                <div align="left"><b>Address:</b> {data.StreetAddress}, {data.PostalCode}.{data.City}, {data.Country}.
                                </div>
                            </CardBody>
                            <Divider />

                            <CardBody fontSize={'1.15rem'}>
                                <div align="left"><b>LRO Number:</b> {data.LRONumber}</div>
                                <div align="left"><b>LRO Agency Name:</b> {data.LROAgencyName}</div>
                                <div align="left"><b>LRO Email:</b> {data.LROEmail}</div>
                                <div align="left"><b>Monthly Rent Amount:</b> ${data.MonthlyRentAmt}</div>
                                <div align="left"><b>LRO Monthly Rent Amount:</b> ${data.MonthyRentAmt_LRO}</div>
                                <div align="left"><b>Monthly Mortgage Amount:</b> ${data.MonthlyMortgageAmt}</div>
                                <div align="left"><b>LRO Monthly Mortgage Amount:</b> ${data.MonthlyMortgageAmt_LRO}</div>
                                <div align="left"><b>Lodging Cost/Night:</b> ${data.LodgingCostPerNight}</div>
                                <div align="left"><b>Lodging Night Count:</b> ${data.LodgingNightCount}</div>
                                <div align="left"><b>LRO Lodging Cost/Night:</b> ${data.LodgingCostPerNight_LRO}</div>
                                <div align="left"><b>Monthly Gas Amount:</b> ${data.MonthlyGasAmt}</div>
                                <div align="left"><b>LRO Monthly Gas Amount:</b> ${data.MonthlyGasAmt_LRO}</div>
                                <div align="left"><b>Monthly Electricity Amount:</b> ${data.MonthlyElectricityAmt}</div>
                                <div align="left"><b>LRO Monthly Electricity Amount</b> ${data.MonthlyElectricityAmt_LRO}</div>
                                <div align="left"><b>Monthly Water Amount:</b> ${data.MonthlyWaterAmt}</div>
                                <div align="left"><b>LRO Monthly Water Amount:</b> ${data.MonthlyWaterAmt_LRO}</div>
                            </CardBody>
                            <Divider />

                            <CardBody>
                                <div align="left"><b>Funding Phase:</b> {data.FundingPhase}</div>
                                <div align="left"><b>Jurisdiction:</b> {data.Jurisdiction}</div>
                                <div align="left"><b>Payment Vendor:</b> {data.PaymentVendor}</div>
                            </CardBody>
                        </Card>
                    </div>


                    <div className="flex flex-col flex-nowrap text-base mt-10">
                        <p className="flex font-mono justify-center uppercase text-black text-center font-bold items-center text-4xl">
                            Existing Similar Records
                        </p>
                        <p className="flex font-mono text-black justify-center text-center items-center text-xl mt-7 mb-7">
                            The following information shows previously approved funding records for applicants that have been detected to be similar to the current pending applicant. Take a look at these to ensure there is no duplication of information or resources before confirming the request.
                        </p>
                        {Object.keys(similarRecordsResponse).map(
                            (name) => {
                                let dob = similarRecordsResponse[name].dob;
                                let history = similarRecordsResponse[name].history;
                                console.log(`Found Similar Applicant: ${name} (DOB: ${dob})`);
                                return (
                                    <div key={name} className="grid grid-cols-3 gap-3 px-10">
                                        {history.map(
                                            (application) => {
                                                return (
                                                    <div key={application.identity}>
                                                        <Card key={application.identity} >
                                                            <CardBody>
                                                                <div align="left"><b>Full Name:</b> {name}</div>
                                                                <div align="left"><b>Date of Birth:</b> {dob}</div>
                                                                <div align="left"><b>Request Date:</b> {data.date}</div>

                                                            </CardBody>
                                                            <Divider />

                                                            <CardBody fontSize={'1.15rem'}>
                                                                <div align="left"><b>LRO Number:</b> {application.lroNumber}</div>
                                                                <div align="left"><b>LRO Agency Name:</b> {application.agency}</div>
                                                                <div align="left"><b>LRO Email:</b> {application.lroEmail}</div>
                                                                <div align="left"><b>Monthly Rent Amount:</b> ${application.rent}</div>
                                                                <div align="left"><b>LRO Monthly Rent Amount:</b> ${application.rentLRO}</div>
                                                                <div align="left"><b>Monthly Mortgage Amount:</b> ${application.mortgage}</div>
                                                                <div align="left"><b>LRO Monthly Mortgage Amount:</b> ${application.mortgageLRO}</div>
                                                                <div align="left"><b>Lodging Cost/Night:</b> ${application.lodgingCost}</div>
                                                                <div align="left"><b>Lodging Night Count:</b> ${application.lodgingCount}</div>
                                                                <div align="left"><b>LRO Lodging Cost/Night:</b> ${application.lodgingCostLRO}</div>
                                                                <div align="left"><b>Monthly Gas Amount:</b> ${application.gas}</div>
                                                                <div align="left"><b>LRO Monthly Gas Amount:</b> ${application.gasLRO}</div>
                                                                <div align="left"><b>Monthly Electricity Amount:</b> ${application.electric}</div>
                                                                <div align="left"><b>LRO Monthly Electricity Amount</b> ${application.electricLRO}</div>
                                                                <div align="left"><b>Monthly Water Amount:</b> ${application.water}</div>
                                                                <div align="left"><b>LRO Monthly Water Amount:</b> ${application.waterLRO}</div>
                                                            </CardBody>
                                                            <Divider />

                                                            <CardBody>
                                                                <div align="left"><b>Funding Phase:</b> {formData.fundingPhase}</div>
                                                                <div align="left"><b>Jurisdiction:</b> {formData.jurisdiction}</div>
                                                                <div align="left"><b>Payment Vendor:</b> {formData.paymentVendor}</div>
                                                            </CardBody>
                                                        </Card>
                                                    </div>

                                                );
                                            }
                                        )}
                                    </div>
                                );
                            }
                        )}

                    </div>

                    <div className="flex flex-col flex-nowrap text-base mt-10">
                        <p className="flex font-mono justify-center uppercase text-black text-center font-bold items-center text-4xl">
                            Existing Similar Records of Household Members
                        </p>
                        <p className="flex font-mono text-black justify-center text-center items-center text-xl mt-7 mb-7">
                            The following information shows previously approved funding records for applicants that have been detected to be similar to household members of the current pending applicant. Take a look at these to ensure there is no duplication of information or resources before confirming the request.
                        </p>


                        {Object.keys(householdMemberSimilarRecords).map(
                            (name) => {
                                let dob = householdMemberSimilarRecords[name].dob;
                                let history = householdMemberSimilarRecords[name].history;
                                console.log(`Found Similar Applicant: ${name} (DOB: ${dob})`);
                                return (
                                    <div key={name} className="grid grid-cols-3 gap-3 px-10">
                                        {history.map(
                                            (application) => {
                                                return (
                                                    <div key={application.identity}>
                                                        <Card key={application.identity} >
                                                            <CardBody>
                                                                <div align="left"><b>Full Name:</b> {name}</div>
                                                                <div align="left"><b>Date of Birth:</b> {dob}</div>
                                                                <div align="left"><b>Request Date:</b> {data.date}</div>

                                                            </CardBody>
                                                            <Divider />

                                                            <CardBody fontSize={'1.15rem'}>
                                                                <div align="left"><b>LRO Number:</b> {application.lroNumber}</div>
                                                                <div align="left"><b>LRO Agency Name:</b> {application.agency}</div>
                                                                <div align="left"><b>LRO Email:</b> {application.lroEmail}</div>
                                                                <div align="left"><b>Monthly Rent Amount:</b> ${application.rent}</div>
                                                                <div align="left"><b>LRO Monthly Rent Amount:</b> ${application.rentLRO}</div>
                                                                <div align="left"><b>Monthly Mortgage Amount:</b> ${application.mortgage}</div>
                                                                <div align="left"><b>LRO Monthly Mortgage Amount:</b> ${application.mortgageLRO}</div>
                                                                <div align="left"><b>Lodging Cost/Night:</b> ${application.lodgingCost}</div>
                                                                <div align="left"><b>Lodging Night Count:</b> ${application.lodgingCount}</div>
                                                                <div align="left"><b>LRO Lodging Cost/Night:</b> ${application.lodgingCostLRO}</div>
                                                                <div align="left"><b>Monthly Gas Amount:</b> ${application.gas}</div>
                                                                <div align="left"><b>LRO Monthly Gas Amount:</b> ${application.gasLRO}</div>
                                                                <div align="left"><b>Monthly Electricity Amount:</b> ${application.electric}</div>
                                                                <div align="left"><b>LRO Monthly Electricity Amount</b> ${application.electricLRO}</div>
                                                                <div align="left"><b>Monthly Water Amount:</b> ${application.water}</div>
                                                                <div align="left"><b>LRO Monthly Water Amount:</b> ${application.waterLRO}</div>
                                                            </CardBody>
                                                            <Divider />

                                                            <CardBody>
                                                                <div align="left"><b>Funding Phase:</b> {application.fundingPhase}</div>
                                                                <div align="left"><b>Jurisdiction:</b> {application.jurisdiction}</div>
                                                                <div align="left"><b>Payment Vendor:</b> {application.paymentVendor}</div>
                                                            </CardBody>
                                                        </Card>
                                                    </div>

                                                );
                                            }
                                        )}
                                    </div>
                                );
                            }
                        )}

                        <Textarea
                            label="Comments"
                            variant="bordered"
                            value={data.statusComments}
                            onChange={handleInput}
                            labelPlacement="outside"
                            placeholder="Enter comments in regards to status for future reference"
                            className="font-mono text-black text-left text-xl px"
                        />

                        <div className="flex flex-row w-full space-y-4 flex-nowrap items-center mt-15">
                            <div className="flex text-base w-full space-y-4 flex-wrap flex-col items-center mt-10 pb-10">

                                <Button color="primary" onClick={() => processApprove()}>
                                    Accept
                                </Button>
                            </div>

                            <div className="flex text-base w-full space-y-4 flex-wrap flex-col items-center mt-10 pb-10">

                                <Button color="danger" onClick={() => processReject()}>
                                    Reject
                                </Button>

                            </div>

                            <div className="flex text-base w-full space-y-4 flex-wrap flex-col items-center mt-10 pb-10">

                                <Button color="warning" onClick={() => processFurtherInfo()}>
                                    Ask for further Information
                                </Button>

                            </div>

                        </div>

                    </div>
                </>
            )
        )
    }
}