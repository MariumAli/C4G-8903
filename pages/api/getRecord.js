import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    if (req.query.hasOwnProperty('identity')) {
        try {
            const db_result = await executeQuery(
                {
                    query: "SELECT * FROM Application_Applicant_LRO WHERE `Application_Applicant_LRO`.`ApplicationId` = ?",
                    values: [req.query.identity]
                }
            );

            res.status(200).json( {result: db_result} )
            
        } catch ( error ) {
            console.log(error);
            res.status(400).json({ result: error })
        }
    } else {
        res.status(400).json( {result: "Missing application identity or status." } )
    }
}
