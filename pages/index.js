import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { useSession, signIn } from "next-auth/react"
import { useRouter } from 'next/router';
import { Card, CardBody, Button, CardHeader } from "@nextui-org/react";
import { PlusIcon } from "@/components/PlusIcon";


const WELCOME_MESSAGE = "\
Welcome to the United Way of Metro Atlanta - \
Emergency Food and Shelter Program Dashboard\
"

const WELCOME_PROMPT = "\
This application is an online portal for logging and monitoring funding \
requests to the EFSP database. To use these capabilities, log in with the \
button below.\
"


export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();


  <Head>
    <title>{"EFSP Dashboard"}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta property="og:title" content="EFSP Dashboard" key="title" />
  </Head>
  return (
    <>
      <main className={styles.main}>
        <Card>
          <CardBody>
            <p>{WELCOME_MESSAGE}</p>
          </CardBody>
        </Card>

        <br></br>
        <br></br>

        <Card>
          <CardBody>
            <p>{WELCOME_PROMPT}</p>
          </CardBody>
        </Card>
        <br></br>
        <br></br>

        {
          status == "authenticated" ? (
            <Card>
              <CardHeader>
                Click below to display a form for submitting a new application.
              </CardHeader>
              <CardBody className="flex gap-3">

                <Button className="text-lg" color="primary" startContent={<PlusIcon />} onClick={() => router.push('/form')}>
                  Process New Application
                </Button>

              </CardBody>
            </Card>
          ) : (

            <Card>
              <CardHeader>
                Click below to sign in with your Gmail user account.
              </CardHeader>
              <CardBody className="flex gap-3">
                <Button onClick={() => signIn()} color="primary" variant="flat">
                  Sign In
                </Button>

              </CardBody>
            </Card>

          )
        }
      </main>
    </>
  );
}