import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    try {
        const db_result = await executeQuery(
            {
                query: "TRUNCATE TABLE Application_Applicant_LRO"
            }
        );

        if (db_result.hasOwnProperty("affectedRows")) {
            if (db_result.affectedRows != 0) {
                res.status(200).json({ result: `Removed all records` })
            } else {
                res.status(200).json({ result: `No records found to be deleted.` })
            }

            const member_db_result = await executeQuery(
                {
                    query: "TRUNCATE TABLE HouseholdMember"
                }
            );
            if (member_db_result.affectedRows != 0) {
                res.status(200).json({ result: `Removed all household records` })
            } else {
                res.status(200).json({ result: `No household records found to be deleted.` })
            }

        } else {
            res.status(400).json({ result: "Error found in remote database response, refresh the page and try again." })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: error })
    }
}