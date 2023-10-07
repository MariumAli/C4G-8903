import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    if (req.query.hasOwnProperty('identity') && req.query.hasOwnProperty('status')) {
        try {
            const db_result = await executeQuery(
                {
                    query: "UPDATE Application_Applicant_LRO SET status = ? WHERE `Application_Applicant_LRO`.`ApplicationId` = ?",
                    values: [req.query.status, req.query.identity]
                }
            );

            if (db_result.hasOwnProperty("affectedRows")) {
                console.log(db_result);
                if (db_result.affectedRows == 1) {
                    res.status(200).json( {result: `Sucessfully approved application record with ID: '${req.query.identity}'.`} )
                } else {
                    res.status(200).json( {result: `No application records found with ID: '${req.query.identity}'.\n\nDatabase is unchanged.`} )
                }
            } else {
                res.status(400).json( {result: "Error found in remote database response, refresh the page and try again."} )
            }
        } catch ( error ) {
            console.log(error);
            res.status(400).json({ result: error })
        }
    } else {
        res.status(400).json( {result: "Missing application identity." } )
    }
}
