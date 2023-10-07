import styles from '@/styles/Home.module.css'
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import SimpleResponsiveTable from '@/components/SimpleResponsiveTable';
import { userColumns } from "@/data";


export default function Users({ params }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [allUsers, setAllUsers] = useState([]);
    const [addUserFormData, setAddUserFormData] = useState([]);
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

                    if (res_json.hasOwnProperty('result') && res_json["result"] != "invalid") {
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
        },
        [router.isReady]
    );


    async function submitRemoveUserForm(user) {
        if (user.email) {
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
            alert(res_json.result);
        } else {
            alert("An error has occurred in parsing this form, please refresh the page.");
        }

        window.location.reload();
    }

    const handleAddUserInput = (e) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        setAddUserFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue
        }));
    }

    const submitAddUserForm = async (e) => {
        // We don't want the page to refresh
        e.preventDefault();

        if ((addUserFormData.hasOwnProperty("email")) && (addUserFormData.hasOwnProperty("role"))) {
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
            alert(res_json.result);
        } else {
            alert("An error has occurred in parsing this form, please refresh the page.");
        }

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
                    <h1>Users</h1>
                    <div style={{display: "flex"}}>
                        <div className={styles.container} style={{ width: '30%', minWidth: "250px" }}>
                            <h2 style={{ marginTop: '10px', marginBottom: "10px" }}>Add User</h2>
                            <p style={{ marginTop: '10px', marginBottom: "10px" }}>
                                {"Add a user via the email address and role."}
                            </p>
                            <form id="add-user-form" onSubmit={submitAddUserForm} style={{ overflow: 'hidden' }}>
                                <div className={styles.container}>
                                    <label className={styles.required}>User Email: </label>
                                    <span style={{ display: "block", overflow: "hidden", marginTop: "5px" }}>
                                        <input type="email" required={true} name="email" style={{ width: '100%' }} onChange={handleAddUserInput} value={addUserFormData.email}/>
                                    </span>
                                </div>
                                <div className={styles.container}>
                                    <label className={styles.required}>User Role: </label>
                                    <span style={{ display: "block", overflow: "hidden", marginTop: "5px" }}>
                                        <select type="text" name="role" style={{ width: '100%' }} onChange={handleAddUserInput} value={addUserFormData.role} >
                                            <option value=""></option>
                                            <option value="agent">agent</option>
                                            <option value="admin-agent">admin-agent</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </span>
                                </div>
                                <button className={styles.button} style={{ marginTop: '10px', marginBottom: "10px" }} type="submit">Submit</button>
                            </form>
                        </div>
                    </div>
                    <h2 style={{ marginTop: '10px', marginBottom: "10px" }}>Explore Users</h2>

                    <SimpleResponsiveTable allRecords={allUsers} 
                    onDelete={submitRemoveUserForm}/>
                </main>
            );
        }
    }
}
