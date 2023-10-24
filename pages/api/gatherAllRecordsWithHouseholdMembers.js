import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    try {
        const db_result = await executeQuery(
            {
                query: 'select applicant.ApplicationId, DATE_FORMAT(applicant.RequestDate, "%M %d %Y") as RequestDate, DATE_FORMAT(applicant.DOB, "%M %d %Y") as DOB, '
                + 'applicant.FirstName, applicant.LastName, applicant.MiddleName, applicant.StreetAddress, applicant.City, applicant.PostalCode, applicant.DecisionDate, '
                + 'applicant.Country, applicant.LRONumber, applicant.LROAgencyName, applicant.LROEmail, applicant.FundingPhase, applicant.Jurisdiction, applicant.PaymentVendor, applicant.MonthlyRentAmt, '
                + 'applicant.MonthyRentAmt_LRO, applicant.MonthlyMortgageAmt, applicant.MonthlyMortgageAmt_LRO, applicant.LodgingCostPerNight, applicant.LodgingNightCount, '
                + 'applicant.LodgingCostPerNight_LRO, applicant.MonthlyGasAmt, applicant.MonthlyGasAmt_LRO, applicant.MonthlyElectricityAmt, applicant.MonthlyElectricityAmt_LRO, '
                + 'applicant.MonthlyWaterAmt, applicant.MonthlyWaterAmt_LRO, applicant.Status, applicant.StatusComments, applicant.RequestorEmail, '
                + 'member.FirstName as memberFirstName, member.LastName as memberLastName, member.MiddleName as memberMiddleName, '
                + 'DATE_FORMAT(member.DOB, "%M %d %Y") as memberDOB, member.HouseholdMemberId as HouseholdMemberId '
                + 'from Application_Applicant_LRO applicant LEFT JOIN HouseholdMember member on applicant.ApplicationId = member.ApplicantId'
            }
        );
        res.status(200).json({ result: db_result})
    } catch ( error ) {
        console.log(error);
        req.status(400).json({ result: null })
    }
}
