import executeQuery from "@/lib/db";


export default async function handler(req, res) {
    console.log("in GatherSimilarRecords with query params:");
    console.log(req.query);

    let req_firstname = req.query.firstname.toLowerCase().trim();
    let req_lastname = req.query.lastname.toLowerCase().trim();
    let req_name = `${req_firstname} ${req_lastname}`;
    let req_dob = req.query.dob.trim();

    let similarRecords = {};
    try {
        let db_result = await executeQuery(
            {
                query: "select * from Application_Applicant_LRO WHERE Status='Approved'",
                values: [req.query.applicationId]
            }
        );

        for (const record of db_result) {
            let rec_firstname = record.FirstName.toLowerCase().trim();
            let rec_lastname = record.LastName.toLowerCase().trim();
            let rec_name = `${rec_firstname} ${rec_lastname}`;
            var dist = calculate_distance(req_name, rec_name);

            var rec_dob = "";
            try {
                rec_dob = JSON.stringify(record.DOB).split("T")[0].replaceAll('"', '');
            } catch (e) {
                console.log(`failed to parse DOB: ${e}`);
            }

            if ((rec_dob == req_dob) || (rec_lastname == req_lastname) || dist < 4) {
                let name = `${record.FirstName} ${record.MiddleName} ${record.LastName}`;
                let app_info = {
                    identity: record.ApplicationId,
                    date: JSON.stringify(record.RequestDate).split("T")[0].replaceAll('"', ''),
                    jurisdiction: record.Jurisdiction,
                    fundingPhase: record.FundingPhase,
                    agency: `${record.LROAgencyName} (LRO #${record.LRONumber})`,
                    paymentVendor: record.PaymentVendor,
                    rent: record.MonthlyRentAmt,
                    rentLRO: record.MonthyRentAmt_LRO,
                    mortgage: record.MonthlyMortgageAmt,
                    mortgageLRO: record.MonthlyMortgageAmt_LRO,
                    lodgingCount: record.LodgingNightCount,
                    lodgingCost: record.LodgingCostPerNight,
                    lodgingCostLRO: record.LodgingCostPerNight_LRO,
                    gas: record.MonthlyGasAmt,
                    gasLRO: record.MonthlyGasAmt_LRO,
                    electric: record.MonthlyElectricityAmt,
                    electricLRO: record.MonthlyElectricityAmt_LRO,
                    water: record.MonthlyWaterAmt,
                    waterLRO: record.MonthlyWaterAmt_LRO,
                    isHouseholdMember: false,
                }

                if (similarRecords.hasOwnProperty(name)) {
                    similarRecords[name].history.push(app_info);
                } else {
                    console.log(`Found Similar Applicant: ${name} (DOB: ${rec_dob})`);
                    similarRecords[name] = {
                        dob: rec_dob,
                        history: [app_info]
                    };
                }
            }
        }

        // console.log("in GatherSimilarRecords with similarRecords:");
        // console.log(similarRecords);

        let member_db_result = await executeQuery(
            {
                query: "select member.FirstName as FirstName, member.LastName as LastName, member.MiddleName as MiddleName, "
                    + "member.DOB as DOB, member.HouseholdMemberId as HouseholdMemberId, member.ApplicantId as ApplicantId "
                    + "from HouseholdMember member INNER JOIN Application_Applicant_LRO applicant ON "
                    + "applicant.ApplicationId = member.ApplicantId "
                    + "and applicant.Status='Approved' and member.ApplicantId != ? and applicant.ApplicationId != ?",
                values: [req.query.applicationId, req.query.applicationId]
            }
        );

        // console.log('member_db_result');
        // console.log(member_db_result);

        let memberSimilarRecords = {}
        for (const record of member_db_result) {
            let rec_firstname = record.FirstName.toLowerCase().trim();
            let rec_lastname = record.LastName.toLowerCase().trim();
            let rec_name = `${rec_firstname} ${rec_lastname}`;
            var dist = calculate_distance(req_name, rec_name);

            var rec_dob = "";
            try {
                rec_dob = JSON.stringify(record.DOB).split("T")[0].replaceAll('"', '');
            } catch (e) {
                console.log(`failed to parse DOB: ${e}`);
            }

            if ((rec_dob == req_dob) || (rec_lastname == req_lastname) || dist < 4) {
                let name = `${record.FirstName} ${record.MiddleName} ${record.LastName}`;
                let app_info = {
                    identity: record.HouseholdMemberId,
                    ApplicantId: record.ApplicantId,
                    isHouseholdMember: true,
                }

                if (memberSimilarRecords.hasOwnProperty(name)) {
                    memberSimilarRecords[name].history.push(app_info);
                } else {
                    console.log(`Found Similar Applicant: ${name} (DOB: ${rec_dob})`);
                    memberSimilarRecords[name] = {
                        dob: rec_dob,
                        history: [app_info]
                    };
                }
            }


            console.log("in GatherSimilarRecords with memberSimilarRecords:");
            console.log(memberSimilarRecords);
        }
        res.status(200).json({ result: { 'similarRecords': similarRecords, 'memberSimilarRecords': memberSimilarRecords } })

    } catch (error) {
        console.log(error);
        res.status(400).json({ result: [] })
    }
}

// src: https://gist.github.com/andrei-m/982927
function calculate_distance(a, b) {
    if (a.length == 0) return b.length;
    if (b.length == 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }
    console.log("Levenshtein distance: " + matrix[b.length][a.length]);
    return matrix[b.length][a.length];
}
