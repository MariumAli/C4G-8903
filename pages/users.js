import React, { use, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import SimpleResponsiveTable from '@/components/SimpleResponsiveTable';
import {
    Input,
    Button,
    CircularProgress,
} from "@nextui-org/react";
import { MailIcon } from "components/MailIcon";
import { Select, SelectItem } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";


export default function Users({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [allUsers, setAllUsers] = useState([]);
    const [addUserFormData, setAddUserFormData] = useState([]);
    const [userRole, setUserRole] = useState("invalid");
    const [isLoading, setIsLoading] = useState(true);
    const [emailError, setEmailError] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [modalText, setModalText] = useState("");

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

                    if (res_json.hasOwnProperty('result') && res_json["result"] != "invalid") {
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
            async function getAllUsers() {
                if (router.isReady) {

                    let res_users = await fetch(
                        `/api/getUsers`,
                        {
                            method: "GET",
                            headers: {
                                "accept": "application/json",
                            },
                        },
                    );
                    let users = await res_users.json();

                    console.log("Setting All Users");
                    console.log(users);
                    setAllUsers(users.result);
                } else {
                    setAllUsers([]);
                }
            }
            getAllUsers();
            setEmailError(false);
            setRoleError(false);
        },
        [router.isReady]
    );


    async function submitRemoveUserForm(user) {
        if (user.email) {
            if (user.email == session.user.email) {
                setModalText(`Error - Cannot delete the current user,\n You are logged in with the email you are trying to delete: ${user.email}`);
                onOpen();
            } else {
                let res = await fetch(
                    `/api/removeUser?email=${user.email}`,
                    {
                        method: "GET",
                        headers: {
                            "accept": "application/json",
                        },
                    },
                );
                let res_json = await res.json();
                console.log(`remove user call response status: ${res.status}`);
                // alert(res_json.result);
                setModalText(`Success - Removed User with Email: ${user.email}`);
                onOpen();
            }
        } else {
            setModalText("Error - Email Required.");
            onOpen();
        }
    }

    const handleAddUserInput = (e) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        setAddUserFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue
        }));
    }

    const onModalClose = () => {
        onClose()
        setEmailError(false);
        setRoleError(false);
        window.location.reload();
    }

    const submitAddUserForm = async (e) => {

        if ((addUserFormData.hasOwnProperty("email")) && (addUserFormData.hasOwnProperty("role"))) {
            if (allUsers.find(r => r.email == addUserFormData.email)) {
                setEmailError(true);
            } else {
                setEmailError(false);
                setRoleError(false);
                let res = await fetch(
                    `/api/addUser?email=${addUserFormData.email}&role=${addUserFormData.role}`,
                    {
                        method: "POST",
                        headers: {
                            "accept": "application/json",
                        },
                    },
                );
                let res_json = await res.json();
                console.log(res);
                console.log(`Add user call response status: ${res.status}`);
                setModalText(`Success - Added User with Email: ${addUserFormData.email} and Role: ${addUserFormData.role}`);
                onOpen();
            }
        } else {
            setEmailError(true);
            setRoleError(true);
            setModalText("Error - Email and Role are Required.");
            onOpen();
        }

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
    } else if (userRole != "admin") {
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
        return (
            <>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} hideCloseButton={true}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Important Message</ModalHeader>
                                <ModalBody>
                                    <p>
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

                <div className="flex flex-col w-full space-y-4 flex-nowrap items-center mt-15 px-20">
                    <div className="flex text-base w-full space-y-9 flex-wrap flex-col items-center mt-10 px-10">
                        <p className="flex font-mono font-large text-base">Add User</p>
                    </div>
                    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">

                        <Input
                            type="email"
                            label="User Email:"
                            placeholder="you@example.com"
                            labelPlacement="outside"
                            isClearable
                            isRequired={true}
                            value={addUserFormData.email}
                            name="email"
                            isInvalid={addUserFormData.email == "" || emailError}
                            errorMessage={emailError && (addUserFormData.email == "" ? 'Email is Required' : 'Email already exists')}
                            onClear={() => setAddUserFormData((prevState) => ({
                                ...prevState,
                                ['email']: ''
                            }))}
                            startContent={<MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                            onChange={handleAddUserInput} />

                        <Select
                            type="text"
                            label="User Role:"
                            placeholder="User Role"
                            labelPlacement="outside"
                            isClearable
                            isRequired={true}
                            value={addUserFormData.role}
                            isInvalid={roleError}
                            errorMessage={roleError && 'Role is required'}
                            name="role"
                            onClear={() => setAddUserFormData((prevState) => ({
                                ...prevState,
                                ['role']: ''
                            }))}
                            onChange={handleAddUserInput}
                        >
                            <SelectItem key="agent">agent</SelectItem>
                            <SelectItem key="admin">admin</SelectItem>
                            {/* <SelectItem key="admin-agent">admin-agent</SelectItem> */}
                        </Select>
                    </div>

                    <div className="flex text-base w-full space-y-4 flex-wrap flex-col items-center mt-15 pb-10">
                        <Button color="primary" onClick={() => submitAddUserForm()}>
                            Add User
                        </Button>

                    </div>

                    <SimpleResponsiveTable allRecords={allUsers}
                        onDelete={submitRemoveUserForm}
                        userRole={userRole} />

                </div></>
        );
    }
}
