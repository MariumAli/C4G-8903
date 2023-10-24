import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    console.log("Edit Application with query params:");
    console.log(req.query);

    let addedRecord = [];

    try {
        let application_db_result = await executeQuery(
            {

                query: 'UPDATE HouseholdMember SET '
                    + 'DOB = ?, FirstName = ?, LastName = ?, MiddleName = ? '
                    + 'WHERE `HouseholdMember`.`HouseholdMemberId` = ?'
                ,
                values: [req.query.householdMemberDOB,
                req.query.householdMemberFirstName,
                req.query.householdMemberLastName,
                req.query.householdMemberMiddleName,
                req.query.householdMemberId
                ]
            }
        );
        if (application_db_result != null) {
            console.log(application_db_result.insertId);
            addedRecord.push(
                {
                    success: application_db_result.insertId != undefined

                }
            );
        }
        res.status(200).json({ result: addedRecord })

    } catch (error) {
        console.log(error);
        res.status(400).json({ result: [] })
    }
}
