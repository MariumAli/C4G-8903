import styles from '@/styles/Home.module.css'
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { Button, Chip, CircularProgress, Textarea } from "@nextui-org/react";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { statusColorMap, dateOptions } from "@/data";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";


export default function ConfirmationPage({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const data = router.query;

    // will be used to populate the similar records HTML data below
    const [similarRecordsResponse, setSimilarRecordsResponse] = useState([]);
    const [householdMemberSimilarApplicationRecords, setHouseholdMemberSimilarApplicationRecords] = useState([]);
    const [householdMemberSimilarRecords, setHouseholdMemberSimilarRecords] = useState([]);
    const [memberSimilarRecords, setMemberSimilarRecords] = useState([]);

    const [confirmRejectPressed, setConfirmRejectPressed] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('');
    const [addRecordSuccess, setAddRecordSuccess] = useState(false);
    const [userRole, setUserRole] = useState("invalid");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApplicantHouseholdMembers, setSelectedApplicantHouseholdMembers] = useState([]);
    const [modalText, setModalText] = useState("");
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const [formData, setFormData] = useState({
        statusComments: "",
    });

    const [statusComments, setStatusComments] = useState("");

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

    React.useEffect(
        () => {
            async function getHouseHoldMembers() {
                if (Object.keys(data).length > 0) {
                    // console.log("Lets get household member info for applicant: ");
                    // console.log(data);
                    let res_household_members = await fetch(
                        `/api/getHouseHoldMembers?applicantId=${data.ApplicationId}`,
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
                }
            }
            getHouseHoldMembers();
        },
        [data]
    );
    // gather similar records from the database
    useEffect(
        () => {
            async function getSimilarRecords() {
                if (router.isReady && Object.keys(data).length > 0 && Object.keys(selectedApplicantHouseholdMembers).length > 0) {
                    let records_res = await fetch(
                        `/api/gatherSimilarRecords?dob=${data.DOB}&firstname=${data.FirstName}&lastname=${data.LastName}&applicationId=${data.ApplicationId}`,
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
                    setSimilarRecordsResponse(records.result.similarRecords);
                    setHouseholdMemberSimilarRecords(records.result.memberSimilarRecords)

                    // console.log("setSimilarRecordsResponse: ", similarRecordsResponse);
                    // console.log("setHouseholdMemberSimilarRecords: ", householdMemberSimilarRecords);

                    // parse out household members from query parameters

                    var newHouseholdMemberSimilarRecords = {};
                    var memberSimilarRecords = {};
                    for (let key in selectedApplicantHouseholdMembers) {
                        let member = selectedApplicantHouseholdMembers[key];
                        // console.log("MEMBER: ", member);
                        var member_records_res = await fetch(
                            `/api/gatherSimilarRecords?dob=${member.DOB}&firstname=${member.FirstName}&lastname=${member.LastName}&applicationId=${data.ApplicationId}`,
                            {
                                method: "GET",
                                headers: {
                                    "accept": "application/json",
                                },
                            },
                        );
                        var member_records = await member_records_res.json();

                        // console.log('member_records');
                        // console.log(member_records);
                        // console.log(member_records.result.similarRecords);
                        // console.log(member_records.result.memberSimilarRecords);

                        for (let [key, value] of Object.entries(member_records.result.similarRecords)) {
                            // console.log('similarRecords key: ', key);
                            // console.log('similarRecords value: ', value);
                            if (!newHouseholdMemberSimilarRecords.hasOwnProperty(key) && value.history[0].identity != data.ApplicationId) {
                                newHouseholdMemberSimilarRecords[key] = value;
                            }
                        }

                        for (let [key, value] of Object.entries(member_records.result.memberSimilarRecords)) {
                            // console.log('memberSimilarRecords key: ', key);
                            // console.log('memberSimilarRecords value: ', value);
                            // console.log('data.ApplicationId', data.ApplicationId);
                            // console.log('value.history.ApplicantId', value.history[0].ApplicantId);
                            if (!memberSimilarRecords.hasOwnProperty(key) && value.history[0].ApplicantId != data.ApplicationId) {
                                memberSimilarRecords[key] = value;
                            }
                        }

                        // newHouseholdMemberSimilarRecords = Object.assign(newHouseholdMemberSimilarRecords, member_records.result['similarRecords']);
                        // memberSimilarRecords = Object.assign(memberSimilarRecords, member_records.result['memberSimilarRecords']);

                    }

                    // console.log("Household Member Records: ", newHouseholdMemberSimilarRecords);
                    // console.log("Member Records: ", memberSimilarRecords);
                    setHouseholdMemberSimilarApplicationRecords(newHouseholdMemberSimilarRecords);
                    setMemberSimilarRecords(memberSimilarRecords);
                } else {
                    setSimilarRecordsResponse([]);
                    setHouseholdMemberSimilarApplicationRecords([]);
                    setHouseholdMemberSimilarRecords([]);
                    setMemberSimilarRecords([]);
                }
            }
            getSimilarRecords();
        },
        [router.isReady, data, selectedApplicantHouseholdMembers]
    );
    const onModalClose = () => {
        onClose()
        router.push('/');
        // window.location.reload();
    }
    const processApprove = () => {
        setConfirmRejectPressed(true);
        setApplicationStatus("Approved");
        console.log(applicationStatus);
        addApplication("Approved");
    }

    const processReject = () => {
        setConfirmRejectPressed(true);
        setApplicationStatus("Rejected");
        console.log(applicationStatus);
        addApplication("Rejected");
    }

    const processFurtherInfo = () => {
        setConfirmRejectPressed(true);
        setApplicationStatus("Pending - Agent Action");
        console.log(applicationStatus);
        addApplication("Pending - Agent Action");
    }

    const handleInput = (e) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        setFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue
        }));
    }

    async function addApplication(appStatus) {
        var addRecordSuccessValue = false;
        if (router.isReady) {
            let add_res = await fetch(
                `/api/updateApplicationStatus?`
                + `status=${appStatus}`
                + `&statusComments=${statusComments}`
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
            addRecordSuccessValue = records.result.success;
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
        onOpen();
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
    } else if (!["agent", "agent-admin", "admin"].includes(userRole)) {
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
    }
    else {
        return (
            <><Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} hideCloseButton={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Outcome</ModalHeader>
                            <ModalBody>
                                <p>
                                    {`Application Status: ${applicationStatus}`}
                                    {modalText}
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onModalClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
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
                            <Divider className="my-4" />
                            <div align="left"><b>Full Name:</b> {data.FirstName} {data.MiddleName} {data.LastName}</div>
                            <div align="left"><b>Date of Birth:</b> {new Date(data.DOB).toLocaleDateString('en-US', dateOptions)}</div>
                            <div align="left"><b>Address:</b> {data.StreetAddress}, {data.PostalCode}.{data.City}, {data.Country}.
                            </div>
                            <Divider className="my-4" />
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
                            <Divider className="my-4" />
                            <div align="left"><b>Funding Phase:</b> {data.FundingPhase}</div>
                            <div align="left"><b>Jurisdiction:</b> {data.Jurisdiction}</div>
                            <div align="left"><b>Payment Vendor:</b> {data.PaymentVendor}</div>
                            {selectedApplicantHouseholdMembers.length > 0 && <p className='flex justify-center font-mono uppercase text-black text-center font-bold text-xl'>
                                HouseHold Members
                            </p>}
                            {selectedApplicantHouseholdMembers.map(
                                (member) => {
                                    return (
                                        <div key={member.identity}>
                                            <Divider className="my-4" />

                                            <Card key={member.identity}>
                                                <CardBody>
                                                    <div align="left"><b>Full Name:</b> {member.FirstName} {member.MiddleName} {member.LastName}</div>
                                                    <div align="left"><b>Date of Birth:</b> {new Date(member.DOB).toLocaleDateString('en-US', dateOptions)}</div>
                                                </CardBody>
                                            </Card>
                                        </div>

                                    );
                                }
                            )}
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
                            return (
                                <div key={name} className="grid grid-cols-3 gap-3 px-10">
                                    {history.map(
                                        (application) => {
                                            return (
                                                <Card key={application.identity}>
                                                    <CardBody>
                                                        <div align="left"><b>Full Name:</b> {name}</div>
                                                        <div align="left"><b>Date of Birth:</b> {dob}</div>
                                                        <div align="left"><b>Request Date:</b> {data.date}</div>
                                                        <Divider />
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
                                                        <Divider />
                                                        <div align="left"><b>Funding Phase:</b> {application.fundingPhase}</div>
                                                        <div align="left"><b>Jurisdiction:</b> {application.jurisdiction}</div>
                                                        <div align="left"><b>Payment Vendor:</b> {application.paymentVendor}</div>
                                                    </CardBody>
                                                </Card>

                                            );
                                        }
                                    )}
                                </div>
                            );
                        }
                    )}

                    {Object.keys(householdMemberSimilarApplicationRecords).map(
                        (name) => {
                            let dob = householdMemberSimilarApplicationRecords[name].dob;
                            let history = householdMemberSimilarApplicationRecords[name].history;
                            return (
                                <div key={name} className="grid grid-cols-3 gap-3 px-10">
                                    {history.map(
                                        (application) => {
                                            return (
                                                <Card key={application.identity}>
                                                    <CardBody>
                                                        <div align="left"><b>Full Name:</b> {name}</div>
                                                        <div align="left"><b>Date of Birth:</b> {dob}</div>
                                                        <div align="left"><b>Request Date:</b> {data.date}</div>
                                                        <Divider />
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
                                                        <Divider />
                                                        <div align="left"><b>Funding Phase:</b> {application.fundingPhase}</div>
                                                        <div align="left"><b>Jurisdiction:</b> {application.jurisdiction}</div>
                                                        <div align="left"><b>Payment Vendor:</b> {application.paymentVendor}</div>
                                                    </CardBody>
                                                </Card>

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
                        Existing Similar HouseHold Member Records
                    </p>
                    <div className="grid grid-cols-3 gap-3 px-10">
                        {Object.keys(householdMemberSimilarRecords).map(
                            (name) => {
                                let dob = householdMemberSimilarRecords[name].dob;
                                let history = householdMemberSimilarRecords[name].history;
                                return (history.map(
                                    (member) => {
                                        return (
                                            <Card key={member.identity}>
                                                <CardBody>
                                                    <div align="left"><b>AppllicantId:</b> {member.ApplicantId}</div>
                                                    <Divider />
                                                    <div align="left"><b>Full Name:</b> {name}</div>
                                                    <div align="left"><b>Date of Birth:</b> {dob}</div>
                                                </CardBody>
                                            </Card>

                                        );
                                    }
                                )

                                );
                            }
                        )}

                        {Object.keys(memberSimilarRecords).map(
                            (name) => {
                                let dob = memberSimilarRecords[name].dob;
                                let history = memberSimilarRecords[name].history;
                                return (
                                    history.map(
                                        (member) => {
                                            return (
                                                <Card key={member.identity}>
                                                    <CardBody>
                                                        <div align="left"><b>ApplicantId:</b> {member.ApplicantId}</div>
                                                        <Divider />
                                                        <div align="left"><b>Full Name:</b> {name}</div>
                                                        <div align="left"><b>Date of Birth:</b> {dob}</div>
                                                    </CardBody>
                                                </Card>

                                            );
                                        }
                                    )

                                );
                            }
                        )}

                    </div>
                </div>

                <div className="flex flex-col flex-nowrap text-base mt-10">
                    <Textarea
                        label="Comments"
                        variant="bordered"
                        value={statusComments}
                        onValueChange={setStatusComments}
                        labelPlacement="outside"
                        placeholder="Enter comments in regards to status for future reference"
                        className="font-mono text-black text-left text-xl px" />

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

    }
}
