import styles from '@/styles/Home.module.css'
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { MailIcon } from "components/MailIcon";
import { Select, SelectItem } from "@nextui-org/react";
import { RadioGroup, Radio } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { statusColorMap, dateOptions } from "@/data";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import {
    Input,
    Button,
    Chip,
    CircularProgress,
} from "@nextui-org/react";

export default function Contact() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState({
        applicantFirstName: '',
        applicantMiddleName: '',
        applicantLastName: '',
        applicantDOB: '',
        applicantStreetAddress: '',
        applicantCity: "Atlanta",
        applicantPostalCode: '',
        applicantCountry: "United States of America",
        lroNumber: 0,
        lroEmail: '',
        agencyName: '',
        jurisdiction: '',
        fundingPhase: '',
        paymentVendor: '',
        monthlyRent: 0.0,
        monthlyRentLRO: 0.0,
        monthlyMortgage: 0.0,
        monthlyMortgageLRO: 0.0,
        lodgingNightCount: 0,
        lodgingNightCost: 0.0,
        lodgingNightCostLRO: 0.0,
        monthlyGas: 0.0,
        monthlyGasLRO: 0.0,
        monthlyElectric: 0.0,
        monthlyElectricLRO: 0.0,
        monthlyWater: 0.0,
        monthlyWaterLRO: 0.0,
        directIndirect: null,
    });

    const [formSuccess, setFormSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formSuccessMessage, setFormSuccessMessage] = useState("");
    const [householdMembers, setHouseholdMembers] = useState([]);
    const [userRole, setUserRole] = useState("invalid");
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleOpen = React.useCallback(() => {
        onOpen();
    }, [onOpen]);

    const [addRecordSuccess, setAddRecordSuccess] = useState(false);

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

    async function addMember() {
        setHouseholdMembers([...householdMembers, { firstName: "", middleName: "", lastName: "", dob: "" }]);
    }

    const handleInput = (e) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        setFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue
        }));
    }

    const handleMemberInput = (i, e) => {
        let newHouseholdMembers = [...householdMembers];
        newHouseholdMembers[i][e.target.name] = e.target.value;
        setHouseholdMembers(newHouseholdMembers);
    }

    const isFormInvalid = () => {
        let mainFormInvalid =
            (isStringFieldInvalid(formData.applicantFirstName) ||
                isStringFieldInvalid(formData.applicantLastName) ||
                isDOBFieldInvalid(formData.applicantDOB) ||
                isStringFieldInvalid(formData.applicantStreetAddress) ||
                isLRONumberFieldInvalid(formData.lroNumber) ||
                isStringFieldInvalid(formData.lroEmail));

        if (mainFormInvalid) {
            return true;
        }

        let membersFormInvalid = false;

        for (let i = 0; i < householdMembers.length; i++) {
            membersFormInvalid = (membersFormInvalid ||
                isStringFieldInvalid(householdMembers[i].firstName) ||
                isStringFieldInvalid(householdMembers[i].lastName) ||
                isDOBFieldInvalid(householdMembers[i].dob))
        }
        if (membersFormInvalid) {
            return true;
        }
        return false
    }

    const isStringFieldInvalid = (fieldValue) => {
        return (!fieldValue || fieldValue == null || fieldValue.trim() == '')
    }

    const isLRONumberFieldInvalid = (fieldValue) => {
        return (!fieldValue || parseInt(fieldValue) <= 0)
    }

    const isDOBFieldInvalid = (fieldValue) => {
        return (!fieldValue || fieldValue == null || isNaN(new Date(fieldValue)))
    }

    const submitForm = async () => {
        let data = { ...formData };
        for (let i = 0; i < householdMembers.length; i++) {
            for (let k in householdMembers[i]) {
                let fieldkey = `householdMember_${i}_${k}`;
                let fieldVal = householdMembers[i][k];
                data[fieldkey] = fieldVal;
            }
        }

        // trigger email notification
        let admin_res = await fetch(
            `/api/getAdmin`
            ,
            {
                method: "GET",
                headers: {
                    "accept": "application/json",
                },
            },
        );
        let admin_data = await admin_res.json();
        let res = await fetch(
            `/api/mailAdmin`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(admin_data)
            },
        );

        var addRecordSuccessValue = false;
        if (router.isReady) {
            let add_res = await fetch(
                `/api/addApplication?applicantDOB=${formData.applicantDOB}`
                + `&applicantFirstName=${formData.applicantFirstName}`
                + `&applicantLastName=${formData.applicantLastName}`
                + `&applicantMiddleName=${formData.applicantMiddleName}`
                + `&applicantStreetAddress=${formData.applicantStreetAddress}`
                + `&applicantCity=${formData.applicantCity}`
                + `&applicantPostalCode=${formData.applicantPostalCode}`
                + `&applicantCountry=${formData.applicantCountry}`
                + `&lroNumber=${formData.lroNumber}`
                + `&agencyName=${formData.agencyName}`
                + `&lroEmail=${formData.lroEmail}`
                + `&fundingPhase=${formData.fundingPhase}`
                + `&jurisdiction=${formData.jurisdiction}`
                + `&paymentVendor=${formData.paymentVendor}`
                + `&monthlyRent=${formData.monthlyRent}`
                + `&monthlyRentLRO=${formData.monthlyRentLRO}`
                + `&monthlyMortgage=${formData.monthlyMortgage}`
                + `&monthlyMortgageLRO=${formData.monthlyMortgageLRO}`
                + `&lodgingNightCost=${formData.lodgingNightCost}`
                + `&lodgingNightCount=${formData.lodgingNightCount}`
                + `&lodgingNightCostLRO=${formData.lodgingNightCostLRO}`
                + `&monthlyGas=${formData.monthlyGas}`
                + `&monthlyGasLRO=${formData.monthlyGasLRO}`
                + `&monthlyElectric=${formData.monthlyElectric}`
                + `&monthlyElectricLRO=${formData.monthlyElectricLRO}`
                + `&monthlyWater=${formData.monthlyWater}`
                + `&monthlyWaterLRO=${formData.monthlyWaterLRO}`
                + `&RequestorEmail=${session.user.email}`
                + `&Status=Pending - Admin Action`
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
            let addRecordInsertIdValue = records.result[0].insertId;
            console.log(` Adding household members: ${householdMembers}`);
            for (let i = 0; i < householdMembers.length; i++) {

                let household_add_res = await fetch(
                    `/api/addHouseHoldMember?householdMemberApplicantId=${addRecordInsertIdValue}`
                    + `&householdMemberDOB=${householdMembers[i].dob}`
                    + `&householdMemberFirstName=${householdMembers[i].firstName}`
                    + `&householdMemberLastName=${householdMembers[i].lastName}`
                    + `&householdMemberMiddleName=${householdMembers[i].middleName}`
                    ,
                    {
                        method: "POST",
                        headers: {
                            "accept": "application/json",
                        },
                    },
                );
                records = await household_add_res.json();
                addRecordSuccessValue = addRecordSuccessValue && records.result[0].success;
            }

        }
        setAddRecordSuccess(addRecordSuccessValue);
        handleOpen();
        console.log(`Submitted, Success: ${addRecordSuccessValue}`);

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
                        <p className="flex font-mono font-medium text-lg mt-10">
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
    }
    else if (isLoading) {
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
            </div>
        )
    } else {
        return (
            session ? (
                <>
                    <div className="flex flex-col flex-nowrap items-center text-base">
                        <p className="flex font-mono font-medium text-6xl mt-10">Application Form</p>
                        {formSuccess ?
                            <div className="flex flex-colflex-nowrap items-center">{formSuccessMessage}</div>
                            : (
                                <div className="flex w-full flex-col gap-4 px-20 mt-10">
                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="text"
                                            label="Applicant First Name:"
                                            placeholder="Enter First Name"
                                            labelPlacement="outside"
                                            isRequired={true}
                                            isClearable
                                            isInvalid={isStringFieldInvalid(formData.applicantFirstName)}
                                            errorMessage={isStringFieldInvalid(formData.applicantFirstName) && 'First Name is Required'}
                                            value={formData.applicantFirstName}
                                            name="applicantFirstName"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['applicantFirstName']: null
                                            }))}
                                            onChange={handleInput} />
                                        <Input
                                            type="text"
                                            label="Applicant Middle Name:"
                                            placeholder="Enter Middle Name"
                                            labelPlacement="outside"
                                            isClearable
                                            name="applicantMiddleName"
                                            value={formData.applicantMiddleName}
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['applicantMiddleName']: ''
                                            }))}
                                            onChange={handleInput} />
                                        <Input
                                            type="text"
                                            label="Applicant Last Name:"
                                            placeholder="Enter Last Name"
                                            labelPlacement="outside"
                                            isRequired={true}
                                            isClearable
                                            isInvalid={isStringFieldInvalid(formData.applicantLastName)}
                                            errorMessage={isStringFieldInvalid(formData.applicantLastName) && 'Last Name is Required'}
                                            name="applicantLastName"
                                            value={formData.applicantLastName}
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['applicantLastName']: null
                                            }))}
                                            onChange={handleInput} />
                                        <Input
                                            type="date"
                                            label="Applicant Date of Birth:"
                                            placeholder="Enter Valid DOB"
                                            labelPlacement="outside"
                                            isRequired={true}
                                            isClearable
                                            name="applicantDOB"
                                            value={formData.applicantDOB}
                                            isInvalid={isDOBFieldInvalid(formData.applicantDOB)}
                                            errorMessage={isDOBFieldInvalid(formData.applicantDOB) && 'Valid DOB is Required'}
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['applicantDOB']: null
                                            }))}
                                            onChange={handleInput} />
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="text"
                                            label="Applicant Street Address:"
                                            placeholder="Enter Street Address"
                                            labelPlacement="outside"
                                            isRequired={true}
                                            isClearable
                                            isInvalid={isStringFieldInvalid(formData.applicantStreetAddress)}
                                            errorMessage={isStringFieldInvalid(formData.applicantStreetAddress) && 'Street Address is Required'}
                                            value={formData.applicantStreetAddress}
                                            name="applicantStreetAddress"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['applicantStreetAddress']: null
                                            }))}
                                            onChange={handleInput} />
                                        <Input
                                            type="text"
                                            label="Applicant City:"
                                            placeholder="Enter a Valid City"
                                            labelPlacement="outside"
                                            isRequired={true}
                                            value={formData.applicantCity}
                                            isReadOnly
                                            onChange={handleInput}
                                            name="applicantCity" />
                                        <Input
                                            type="text"
                                            label="Applicant Postal Code:"
                                            placeholder="75300 - 5 digit"
                                            labelPlacement="outside"
                                            isRequired={true}
                                            isClearable
                                            isInvalid={isStringFieldInvalid(formData.applicantPostalCode) || formData.applicantPostalCode.trim().length < 5}
                                            errorMessage={(isStringFieldInvalid(formData.applicantPostalCode) || formData.applicantPostalCode.trim().length < 5) && '5 digit Postal Code is Required'}
                                            value={formData.applicantPostalCode}
                                            name="applicantPostalCode"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['applicantPostalCode']: null
                                            }))}
                                            onChange={handleInput} />
                                        <Input
                                            type="text"
                                            label="Applicant Country:"
                                            placeholder="Applicant Country"
                                            labelPlacement="outside"
                                            value={formData.applicantCountry}
                                            isRequired={true}
                                            isReadOnly
                                            onChange={handleInput} />
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="number"
                                            label="LRO Number"
                                            placeholder="0"
                                            labelPlacement="outside"
                                            isRequired={true}
                                            isClearable
                                            isInvalid={isLRONumberFieldInvalid(formData.lroNumber)}
                                            errorMessage={isLRONumberFieldInvalid(formData.lroNumber) && 'LRO Number > 0 is Required'}
                                            value={formData.lroNumber}
                                            name="lroNumber"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['lroNumber']: null
                                            }))}
                                            step={1}
                                            onChange={handleInput} />
                                        <Input
                                            type="email"
                                            label="LRO Email:"
                                            placeholder="you@example.com"
                                            labelPlacement="outside"
                                            isClearable
                                            isRequired={true}
                                            value={formData.lroEmail}
                                            isInvalid={isStringFieldInvalid(formData.lroEmail)}
                                            errorMessage={isStringFieldInvalid(formData.lroEmail) && 'LRO Email is Required'}
                                            name="lroEmail"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['lroEmail']: null
                                            }))}
                                            startContent={<MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                                            onChange={handleInput} />
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Select
                                            type="text"
                                            label="Jurisdiction:"
                                            placeholder="Jurisdiction"
                                            labelPlacement="outside"
                                            isClearable
                                            value={formData.jurisdiction}
                                            name="jurisdiction"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['jurisdiction']: ''
                                            }))}
                                            onChange={handleInput}
                                        >
                                            <SelectItem key="Atlanta/Fulton/DeKalb">Atlanta/Fulton/DeKalb</SelectItem>
                                            <SelectItem key="Coweta">Coweta</SelectItem>
                                            <SelectItem key="Douglas">Douglas</SelectItem>
                                            <SelectItem key="Gwinnett">Gwinnett</SelectItem>
                                            <SelectItem key="Rockdale">Rockdale</SelectItem>
                                            <SelectItem key="Cherokee">Cherokee</SelectItem>
                                            <SelectItem key="Paulding">Paulding</SelectItem>
                                            <SelectItem key="Fayette">Fayette</SelectItem>
                                        </Select>

                                        <Select
                                            type="text"
                                            label="Funding Phase:"
                                            placeholder="Funding Phase"
                                            labelPlacement="outside"
                                            isClearable
                                            value={formData.fundingPhase}
                                            name="fundingPhase"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['fundingPhase']: ''
                                            }))}
                                            onChange={handleInput}
                                        >
                                            <SelectItem key="ARPA-R">ARPA-R</SelectItem>
                                            {Array.from({ length: 62 }, (v, k) => k + 39).map(
                                                (phase) => {
                                                    return <SelectItem key={phase}>{`${phase}`}</SelectItem>;
                                                }
                                            )}
                                        </Select>
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="text"
                                            label="Agency Name:"
                                            placeholder="Enter Agency Name"
                                            labelPlacement="outside"
                                            isClearable
                                            value={formData.agencyName}
                                            name="agencyName"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['agencyName']: ''
                                            }))}
                                            onChange={handleInput} />
                                        <Input
                                            type="text"
                                            label="Payment Vendor:"
                                            placeholder="Payment Vendor"
                                            labelPlacement="outside"
                                            isClearable
                                            value={formData.paymentVendor}
                                            name="paymentVendor"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['paymentVendor']: ''
                                            }))}
                                            onChange={handleInput} />
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="number"
                                            label="Lodging Night Count:"
                                            placeholder="0"
                                            labelPlacement="outside"
                                            isClearable
                                            value={formData.lodgingNightCount}
                                            name="lodgingNightCount"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['lodgingNightCount']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={1} />
                                        <Input
                                            type="number"
                                            label="Lodging Night Cost ($):"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.lodgingNightCost}
                                            name="lodgingNightCost"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['lodgingNightCost']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                        <Input
                                            type="number"
                                            label="LRO Funded Lodging Night Cost ($):"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.lodgingNightCostLRO}
                                            name="lodgingNightCostLRO"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['lodgingNightCostLRO']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="number"
                                            label="One Month Rent ($):"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyRent}
                                            name="monthlyRent"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyRent']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                        <Input
                                            type="number"
                                            label="LRO Funded One Month Rent ($):"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyRentLRO}
                                            name="monthlyRentLRO"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyRentLRO']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="number"
                                            label="One Month Mortgage ($):"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyMortgage}
                                            name="monthlyMortgage"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyMortgage']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                        <Input
                                            type="number"
                                            label="LRO Funded One Month Mortgage ($):"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyMortgageLRO}
                                            name="monthlyMortgageLRO"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyMortgageLRO']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="number"
                                            label="One Month Gas ($):"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyGas}
                                            name="monthlyGas"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyGas']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                        <Input
                                            type="number"
                                            label="LRO Funded One Month Gas ($): "
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyGasLRO}
                                            name="monthlyGasLRO"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyGasLRO']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="number"
                                            label="One Month Electric ($):"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyElectric}
                                            name="monthlyElectric"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyElectric']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                        <Input
                                            type="number"
                                            label="LRO Funded One Month Electric ($):"
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyElectricLRO}
                                            name="monthlyElectricLRO"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyElectricLRO']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                    </div>

                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <Input
                                            type="number"
                                            label="One Month Water ($): "
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyWater}
                                            name="monthlyWater"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyWater']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                        <Input
                                            type="number"
                                            label="LRO Funded One Month Water ($): "
                                            placeholder="0.00"
                                            labelPlacement="outside"
                                            startContent={<div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>}
                                            isClearable
                                            value={formData.monthlyWaterLRO}
                                            name="monthlyWaterLRO"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['monthlyWaterLRO']: ''
                                            }))}
                                            onChange={handleInput}
                                            step={0.01} />
                                    </div>

                                    <div className="flex w-full text-black flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                                        <RadioGroup
                                            label="Select Direct/Indirect:"
                                            placeholder="Select Direct/Indirect:"
                                            orientation="horizontal"
                                            value={formData.directIndirect}
                                            name="directIndirect"
                                            onClear={() => setFormData((prevState) => ({
                                                ...prevState,
                                                ['directIndirect']: ''
                                            }))}
                                            onChange={handleInput}
                                            className="text-black"
                                        >
                                            <Radio value="direct">Direct</Radio>
                                            <Radio value="indirect">Indirect</Radio>

                                        </RadioGroup>
                                    </div>

                                    <div className="flex w-full flex-col gap-3 px-10">
                                        {householdMembers.length > 0 ?
                                            (<p className="flex  items-center font-mono font-medium text-3xl mt-10">Additional Household Members</p>) : ''}

                                        {householdMembers.map(
                                            (element, index) => {
                                                return (
                                                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4" key={index}>
                                                        <Input
                                                            type="text"
                                                            label="First Name:"
                                                            placeholder="Enter First Name"
                                                            labelPlacement="outside"
                                                            isRequired={true}
                                                            isClearable
                                                            value={element.firstName}
                                                            name="firstName"
                                                            isInvalid={isStringFieldInvalid(element.firstName)}
                                                            errorMessage={isStringFieldInvalid(element.firstName) && 'First Name is Required'}
                                                            onClear={(index) => {
                                                                let newHouseholdMembers = [...householdMembers];
                                                                newHouseholdMembers[index]["firstName"] = null;
                                                                setHouseholdMembers(newHouseholdMembers);
                                                            }}
                                                            onChange={e => handleMemberInput(index, e)} />
                                                        <Input
                                                            type="text"
                                                            label="Middle Name:"
                                                            placeholder="Enter Middle Name"
                                                            labelPlacement="outside"
                                                            isClearable
                                                            value={element.middleName}
                                                            name="middleName"
                                                            onClear={(index) => {
                                                                let newHouseholdMembers = [...householdMembers];
                                                                newHouseholdMembers[index]["middleName"] = '';
                                                                setHouseholdMembers(newHouseholdMembers);
                                                            }}
                                                            onChange={e => handleMemberInput(index, e)} />
                                                        <Input
                                                            type="text"
                                                            label="Last Name:"
                                                            placeholder="Enter Last Name"
                                                            labelPlacement="outside"
                                                            isRequired={true}
                                                            isClearable
                                                            value={element.lastName}
                                                            isInvalid={isStringFieldInvalid(element.lastName)}
                                                            errorMessage={isStringFieldInvalid(element.lastName) && 'Last Name is Required'}
                                                            name="lastName"
                                                            onClear={(index) => {
                                                                let newHouseholdMembers = [...householdMembers];
                                                                newHouseholdMembers[index]["lastName"] = null;
                                                                setHouseholdMembers(newHouseholdMembers);
                                                            }}
                                                            onChange={e => handleMemberInput(index, e)} />
                                                        <Input
                                                            type="date"
                                                            label="Date of Birth:"
                                                            placeholder="Enter Valid DOB"
                                                            labelPlacement="outside"
                                                            isRequired={true}
                                                            isClearable
                                                            value={element.dob}
                                                            isInvalid={isDOBFieldInvalid(element.dob)}
                                                            errorMessage={isDOBFieldInvalid(element.dob) && 'Valid DOB is Required'}
                                                            name="dob"
                                                            onClear={(index) => {
                                                                let newHouseholdMembers = [...householdMembers];
                                                                newHouseholdMembers[index]["dob"] = null;
                                                                setHouseholdMembers(newHouseholdMembers);
                                                            }}
                                                            onChange={e => handleMemberInput(index, e)} />
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>

                                    <div className="flex text-base w-full space-y-4 flex-wrap md:flex-nowrap mb-6 md:mb-0 items-center flex-col mt-10 pb-10">
                                        <Button color="default" onClick={() => addMember()}>Add Member</Button>

                                        <Button color="primary" isDisabled={isFormInvalid()} onClick={() => submitForm()}>Process Information</Button>
                                    </div>
                                </div>
                            )}
                        {isOpen ?
                            (
                                <Modal
                                    backdrop={'blur'}
                                    isOpen={isOpen}
                                    scrollBehavior={'inside'}
                                    placement={'center'}
                                    size={'5xl'}
                                    onClose={onClose}
                                    isDismissable={false}
                                    hideCloseButton={true}
                                    className="py-4"
                                >
                                    <ModalContent>
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1" fontSize={'20px'} id="customized-dialog-title">
                                                    Submitted Record Details
                                                </ModalHeader>
                                                <ModalBody>
                                                    <Card className="flex">
                                                        <CardBody>
                                                            <div align="left"><b>Status:</b> {<Chip className="capitalize" color={statusColorMap["Pending - Admin Action"]} size="md" variant="flat">
                                                                {'Pending - Admin Action'}
                                                            </Chip>}
                                                            </div>
                                                            <div align="left"><b>Requestor Email:</b> {session.user.email}</div>
                                                            <div align="left"><b>Request Date:</b> {new Date().toLocaleDateString('en-US', dateOptions)}</div>
                                                            <Divider className="my-4" />

                                                            <div align="left"><b>Full Name:</b> {formData.applicantFirstName} {formData.applicantMiddleName} {formData.applicantLastName}</div>
                                                            <div align="left"><b>Date of Birth:</b> {new Date(formData.applicantDOB).toLocaleDateString('en-US', dateOptions)}</div>
                                                            <div align="left"><b>Address:</b> {formData.applicantStreetAddress}, {formData.applicantPostalCode}.{formData.applicantCity}, {formData.applicantCountry}.
                                                            </div>
                                                            <Divider className="my-4" />
                                                            <div align="left"><b>LRO Number:</b> {formData.lroNumber}</div>
                                                            <div align="left"><b>LRO Agency Name:</b> {formData.agencyName}</div>
                                                            <div align="left"><b>LRO Email:</b> {formData.lroEmail}</div>
                                                            <div align="left"><b>Monthly Rent Amount:</b> ${formData.monthlyRent}</div>
                                                            <div align="left"><b>LRO Monthly Rent Amount:</b> ${formData.monthlyRentLRO}</div>
                                                            <div align="left"><b>Monthly Mortgage Amount:</b> ${formData.monthlyMortgage}</div>
                                                            <div align="left"><b>LRO Monthly Mortgage Amount:</b> ${formData.monthlyMortgageLRO}</div>
                                                            <div align="left"><b>Lodging Cost/Night:</b> ${formData.lodgingNightCost}</div>
                                                            <div align="left"><b>Lodging Night Count:</b> ${formData.lodgingNightCount}</div>
                                                            <div align="left"><b>LRO Lodging Cost/Night:</b> ${formData.lodgingNightCostLRO}</div>
                                                            <div align="left"><b>Monthly Gas Amount:</b> ${formData.monthlyGas}</div>
                                                            <div align="left"><b>LRO Monthly Gas Amount:</b> ${formData.monthlyGasLRO}</div>
                                                            <div align="left"><b>Monthly Electricity Amount:</b> ${formData.monthlyElectric}</div>
                                                            <div align="left"><b>LRO Monthly Electricity Amount</b> ${formData.monthlyElectricLRO}</div>
                                                            <div align="left"><b>Monthly Water Amount:</b> ${formData.monthlyWater}</div>
                                                            <div align="left"><b>LRO Monthly Water Amount:</b> ${formData.monthlyWaterLRO}</div>
                                                            <Divider className="my-4" />
                                                            <div align="left"><b>Funding Phase:</b> {formData.fundingPhase}</div>
                                                            <div align="left"><b>Jurisdiction:</b> {formData.jurisdiction}</div>
                                                            <div align="left"><b>Payment Vendor:</b> {formData.paymentVendor}</div>
                                                        </CardBody>
                                                    </Card>{householdMembers.length > 0 && <p className='flex justify-center font-mono uppercase text-black text-center font-bold text-xl'>
                                                        HouseHold Members
                                                    </p>}
                                                    {householdMembers.map(
                                                        (member, index) => {
                                                            return (
                                                                <div key={index}>
                                                                    <Card key={index}>
                                                                        <CardBody>
                                                                            <div align="left"><b>Full Name:</b> {member.firstName} {member.middleName} {member.lastName}</div>
                                                                            <div align="left"><b>Date of Birth:</b> {new Date(member.dob).toLocaleDateString('en-US', dateOptions)}</div>
                                                                        </CardBody>
                                                                    </Card>
                                                                </div>

                                                            );
                                                        }
                                                    )}
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="danger" onClick={() => {
                                                        onClose();
                                                        router.push("/audit");
                                                    }}
                                                    >
                                                        Return
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                            ) : ''}
                    </div></>
            ) : "Invalid credentials, Please login again"
        )
    }
}