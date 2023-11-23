import executeQuery from "@/lib/db";

export default async function handler(req, res) {
    // console.log("in AddUser with query params:", req.query);

    try {
        const db_result = await executeQuery(
            {
                query: 'select * from Users'
            }
        );
        for (const entry of db_result) {
            if(entry["email"] == req.query.email) {
                return res.status(400).json({ result: "User with provided email already exists."});
            }
        }
    } catch ( error ) {
        console.log(error);
        return res.status(400).json({ result: "Failed to fetch users." });
    }

    try {
        let db_result = await executeQuery(
            {

                query: 'INSERT INTO Users (email, role) VALUES (?, ?)',
                values: [req.query.email, req.query.role]
            }
        );

        if (db_result.hasOwnProperty("error"))  {
            res.status(400).json({ result: `Internal server error, failed to add user to remote database.`})
        } else {
            res.status(200).json({ result: `Added '${req.query.role}' user with email: '${req.query.email}'.`})
        }
    } catch ( error ) {
        console.log(error);
        res.status(400).json({ result: error.message })
    }
}