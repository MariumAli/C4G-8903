import Image from 'next/image'
import Head from 'next/head'
import Link from "next/link";
import styles from '@/styles/Home.module.css'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Button, Card, CardBody } from "@nextui-org/react";


export default function AboutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>{"EFSP Dashboard"}</title>
        <meta property="og:title" content="EFSP Dashboard" key="title" />
      </Head>
      <main className={styles.main}>
        <h1>
          United Way of Metro Atlanta - Emergency Food and Shelter Program
        </h1>

        <div className={`${styles.card} content-center`}>
          <p className="uppercase font-mono font-bold text-xl text-black content-center">
            About EFSP Dashboard
          </p>
          <span>
            The Emergency Food and Shelter Program is a federal grant that provides funds to agencies for emergency financial assistance for individuals and families in crisis. United Way of Greater Atlanta administers this grant in eight metro counties.
            This application tracks the recipients of funds for grant administers and to provide an interface for logging distributions and providing analytics about previous funding records.
          </span>
        </div>

        <div className={`${styles.card} content-center`}>
          <p className="uppercase font-mono font-bold text-xl text-black content-center">
            Goals of EFSP Dashboard
          </p>
          <span>
            <ul>
              <li>Provide an online form to submit funding requests</li>
              <li>Provide an automated solution to detect if the funding should be approved or denied</li>
              <li>Maintain a database of all previous funding grants</li>
              <li>Provide an interface to view previous grants</li>
              <li>Enable administers to view the current status of funding</li>
            </ul>
          </span>
        </div>

        <Card className='p-5 m-10'>
          <CardBody className="flex gap-3">
            <p className="uppercase font-mono font-bold text-xl text-black content-center mt-auto">
              EFSP Dashboard User Guide
            </p>
          </CardBody>
          <Button className="uppercase font-mono font-bold text-xl" color="warning">
            <Link href={"https://drive.google.com/file/d/1WTh7Lt6zvVKOXSiVec77uqx4Svfz73Fw/view?usp=sharing"}>{"View User Guide"}</Link>
          </Button>
        </Card>

        <p className="uppercase font-mono font-bold text-xl text-black content-center mt-auto">
          Contributors - Iteration I
        </p>
        <table className={`${styles.table} content-center`}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Goal</th>
              <th>Contributions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{'Andrew Spittlemeister'}</td>
              <td>{'Backend/Data Engineer and Team lead'}</td>
              <td>{'Contribute to building an application that can streamline the process of managing shelter funding requests, checking for duplication, and providing an informative view for administrators. I would also like to help provide support to my team and facilitate their abilities to create a well-rounded application.'}</td>
              <td>
                Interfaced with customer and created presentations & evaluations for this project. Also pulled together the Vercel deployment, designed application navigation, enabled PWA support, and contributed to CSS formatting.
              </td>
            </tr>
            <tr>
              <td>{'Bryan Xian '}</td>
              <td>{'Backend/Data Engineer'}</td>
              <td>{'Develop a working and easy to use MVP for client. I would like to make a positive and lasting impact on the Metro Atlanta community by the end of this project. I plan to do this by using my software engineering skills to save employees of United Way of Atlanta time, so they can better serve the community.'}</td>
              <td>
                Aggregated user needs into application logic & designed database schemas such that it could create a scalable architecture to include user identities and relationships between current and future metadata.
              </td>
            </tr>
            <tr>
              <td>{'Marium Ali'}</td>
              <td>{'Full Stack Engineer'}</td>
              <td>{"Develop a working and easy to use MVP for client to be able to use. I would like the client to be able to process a new request for shelter as soon as possible identifying the duplication rules and make a decision without much manual interaction. Additionally, the interface should be easy to use and training-free. My goal is to use my expertise and make that happen as a team!"}</td>
              <td>
                Designed the project about page (team web page) and form submission page, added Google authentication functionality, and contributed to defining funding application logic.
              </td>
            </tr>
            <tr>
              <td>{'Pallavi Bhatnagar'}</td>
              <td>{'Full Stack Engineer'}</td>
              <td>{'Develop a working and easy to use Minimal Loveable Product for the client. Working with the team I will contibute to all phases of software devlopment lifecycle for United Way. My goal will be to ensure we maintain high quality work and meet all the requirements stated by the partner.'}</td>
              <td>
                Interfaced with customer and DreamHost to allocate a hosted database with non-profit status and hooked it up to our hosted application. Implemented the database schemas inside this database and created API calls to access the database from front-end application logic.
              </td>
            </tr>
          </tbody>
        </table>

        <br></br>

        <p className="uppercase font-mono font-bold text-xl text-black content-center mt-auto">
          Contributors - Iteration II
        </p>
        <table className={`${styles.table} content-center`}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Goal</th>
              <th>Contributions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{'Marium Ali'}</td>
              <td>{'Team Lead and Full Stack Engineer'}</td>
              <td>{"Develop a working and easy to use MVP for client to be able to use. I would like the client to be able to process a new request for shelter as soon as possible identifying the duplication rules and make a decision without much manual interaction. Additionally, the interface should be easy to use and training-free. My goal is to use my expertise and make that happen as a team!"}</td>
              <td>
                Stakeholder presentations and communication. User interface and user experience uplift. User authentication enhancement. Validation logic enhancement. Admin approval workflow enhancement. Agent request workflow enhancement. Software testing and validation.
              </td>
            </tr>
            <tr>
              <td>{'Dexter Wah'}</td>
              <td>{'Full Stack Engineer'}</td>
              <td>{"Design and implement impactful solutions by employing user-centered design principles and software development methodologies. Foster value creation through collaborative efforts and proactive needfinding. Support social impact financing using technology and innovative approaches."}</td>
              <td>
                Stakeholder communication. Database design enhancement. E-mail notification function. Validation logic enhancement. Admin approval workflow enhancement. Agent request workflow enhancement. Software testing and validation. User guide documentation.
              </td>
            </tr>
          </tbody>
        </table>

        <br></br>

        <div className={`${styles.card} content-center`}>
          <p className="uppercase font-mono font-bold text-xl text-black content-center">
            Lighthouse scores
          </p>
          <span>
            <ul>
              <li>Performance: 100%</li>
              <li>Accessability: 100%</li>
              <li>Best Practices: 100%</li>
              <li>SEO: 100%</li>
              <li>PWA: 100%</li>
            </ul>
          </span>
        </div>

      </main>
    </>
  )
}
