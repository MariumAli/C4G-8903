import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    if (req.query.hasOwnProperty('applicationId') && req.query.hasOwnProperty('status')) {
        try {
            const db_result = await executeQuery(
                {
                    query: "UPDATE Application_Applicant_LRO SET Status = ?, StatusComments = ? WHERE `Application_Applicant_LRO`.`ApplicationId` = ?",
                    values: [req.query.status, req.query.statusComments, req.query.applicationId]
                }
            );

        } catch ( error ) {
            console.log(error);
            res.status(400).json({ result: error })
        }
    } else {
        res.status(400).json( {result: "Missing application identity." } )
    }
}
