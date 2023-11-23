import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    if (req.query.hasOwnProperty('email')) {
        try {
            const db_result = await executeQuery(
                {
                    query: "DELETE FROM Users WHERE `Users`.`email` = ?",
                    values: [req.query.email]
                }
            );

            if (db_result.hasOwnProperty("affectedRows")) {
                if (db_result.affectedRows > 0) {
                    res.status(200).json( {result: `Removed user with email: '${req.query.email}'.`} )
                } else {
                    res.status(200).json( {result: `No users found with email: '${req.query.email}'.\n\nDatabase is unchanged.`} )
                }
            } else {
                res.status(400).json( {result: "Error found in remote database response, refresh the page and try again."} )
            }
        } catch ( error ) {
            console.log(error);
            res.status(400).json({ result: error })
        }
    } else {
        res.status(400).json( {result: "Missing user email." } )
    }
}
