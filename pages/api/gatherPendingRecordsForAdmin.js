import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    try {
        let db_result = await executeQuery(
            {
                query: 'select * from Application_Applicant_LRO where Status="Pending - Admin Action"'
            }
        );
        res.status(200).json({ result: db_result})
    } catch ( error ) {
        console.log(error);
        res.status(400).json({ result: [] })
    }
}
