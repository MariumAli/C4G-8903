import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    console.log("in Add household_member with query params:");
    console.log(req.query);

    let addedRecord = [];

    try {
        let household_member_db_result = await executeQuery(
            {

                query: 'INSERT INTO HouseholdMember (ApplicantId, DOB, FirstName, LastName, MiddleName) '
                         + 'VALUES (?, ?, ?, ?, ?)',
                         values: [req.query.householdMemberApplicantId,
                        req.query.householdMemberDOB,
                        req.query.householdMemberFirstName,
                        req.query.householdMemberLastName,
                        req.query.householdMemberMiddleName
                ]
            }
        );

        if (household_member_db_result != null) {
            console.log(household_member_db_result.insertId);
            addedRecord.push(
                {
                    success: household_member_db_result.insertId != undefined

                }
            );
        }
        res.status(200).json({ result: addedRecord})

    } catch ( error ) {
        console.log(error);
        res.status(400).json({ result: [] })
    }
}
