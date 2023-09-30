import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    try {
        let db_result = await executeQuery(
            {
                query: 'select ApplicationId, DATE_FORMAT(RequestDate, "%M %d %Y") as RequestDate, DATE_FORMAT(DOB, "%M %d %Y") as DOB, '
                         + 'FirstName, LastName, MiddleName, StreetAddress, City, PostalCode, '
                         + 'Country, LRONumber, LROAgencyName, LROEmail, FundingPhase, Jurisdiction, PaymentVendor, MonthlyRentAmt, '
                         + 'MonthyRentAmt_LRO, MonthlyMortgageAmt, MonthlyMortgageAmt_LRO, LodgingCostPerNight, LodgingNightCount, '
                         + 'LodgingCostPerNight_LRO, MonthlyGasAmt, MonthlyGasAmt_LRO, MonthlyElectricityAmt, MonthlyElectricityAmt_LRO, '
                         + 'MonthlyWaterAmt, MonthlyWaterAmt_LRO, Status, StatusComments, RequestorEmail '
                         + 'from Application_Applicant_LRO'
            }
        );
        res.status(200).json({ result: db_result})
    } catch ( error ) {
        console.log(error);
        res.status(400).json({ result: [] })
    }
}
