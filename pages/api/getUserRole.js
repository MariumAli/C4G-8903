import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    try {
        const db_result = await executeQuery(
            {
                query: 'SELECT role FROM Users WHERE `Users`.`email` = ? LIMIT 1',
                values: [req.query.email]
            }
        );
        if (db_result && db_result[0] && db_result[0]["role"]) {
            res.status(200).json({ result: db_result[0]["role"]})
        } else {
            res.status(400).json({ result: "invalid" })
        }
    } catch ( error ) {
        console.log(error);
        res.status(500).json({ result: error })
    }
}