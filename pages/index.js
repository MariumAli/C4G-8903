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
requests to the EFSP database. \
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
      <div className="w-1/2 relative items-center text-center inline">
        <img
          src="/computing_for_good.png"
          alt="Background Image"
          className='inline'
        />
      </div>
      <br />

        <Card className='shadow-none'>
          <CardBody>
            <p className="uppercase font-mono font-extrabold text-2xl">{WELCOME_MESSAGE}</p>
          </CardBody>
        </Card>

        <Card className='shadow-none'>
          <CardBody>
            <p className="uppercase font-mono font-bold text-xl">{WELCOME_PROMPT}</p>
          </CardBody>
        </Card>

        {
          status == "authenticated" ? (
            <Card className='shadow-none'>
              <CardBody className="flex gap-3">

                <Button className="uppercase font-mono font-bold text-xl" color="warning" startContent={<PlusIcon />} onClick={() => router.push('/form')}>
                  Process New Application
                </Button>

              </CardBody>
            </Card>
          ) : (

            <Card className='shadow-none'>
              <CardHeader className="uppercase font-mono font-bold text-base">
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