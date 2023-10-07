import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    if (req.query.hasOwnProperty('requestorEmail')) {
        try {
            let db_result = await executeQuery(
                {
                    query: "select * from Application_Applicant_LRO WHERE `Application_Applicant_LRO`.`RequestorEmail` = ?",
                    values: [req.query.requestorEmail]
                }
            );
            res.status(200).json({ result: db_result })
        } catch (error) {
            console.log(error);
            res.status(400).json({ result: [] })
        }
    } else {
        res.status(400).json({ result: "Missing email." })
    }
}
