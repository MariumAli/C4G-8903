const columns = [
  {name: "Status", uid: "Status", sortable: true},
  {name: "ID", uid: "ApplicationId", sortable: true},
  {name: "Full Name", uid: "FirstName", sortable: true},
  {name: "Date Of Birth", uid: "DOB", sortable: true},
  {name: "Address", uid: "Country", sortable: true},
  {name: "Requestor Email", uid: "RequestorEmail", sortable: true},
  {name: "Application Date", uid: "RequestDate", sortable: true},
  {name: "Jurisdiction", uid: "Jurisdiction", sortable: true},
  {name: "Actions", uid: "actions"},
];

const userColumns = [
  {name: "Email", uid: "email", sortable: true},
  {name: "Role", uid: "role", sortable: true},
];

const detailsColumns = [
  {name: "LRO Number", uid: "LRONumber"},
  {name: "Agency Name", uid: "LROAgencyName", sortable: true},
  {name: "Agency Email", uid: "LROEmail"},
  {name: "Payment Vendor", uid: "PaymentVendor", sortable: true},
  {name: "Funding Phase", uid: "FundingPhase"},
  {name: "Monthly Rent ($)", uid: "MonthlyRentAmt", sortable: true},
  {name: "LRO Monthly Rent ($)", uid: "MonthyRentAmt_LRO"},
  {name: "Monthly Mortgage ($)", uid: "MonthlyMortgageAmt", sortable: true},
  {name: "LRO Monthly Mortgage ($)", uid: "MonthlyMortgageAmt_LRO"},
  {name: "Lodging Night Count", uid: "LodgingNightCount", sortable: true},
  {name: "Lodging Nightly Cost ($)", uid: "LodgingCostPerNight", sortable: true},
  {name: "LRO Lodging Nightly Cost ($)", uid: "LodgingCostPerNight_LRO"},
  {name: "Monthly Gas ($)", uid: "MonthlyGasAmt", sortable: true},
  {name: "LRO Monthly Gas ($)", uid: "MonthlyGasAmt_LRO"},
  {name: "Monthly Electric ($)", uid: "MonthlyElectricityAmt", sortable: true},
  {name: "LRO Monthly Electric ($)", uid: "MonthlyElectricityAmt_LRO"},
  {name: "Monthly Water ($)", uid: "MonthlyWaterAmt", sortable: true},
  {name: "LRO Monthly Water ($)", uid: "MonthlyWaterAmt_LRO", sortable: true},
]

const statusOptions = [
  {name: "Approved", uid: "approved"},
  {name: "Pending", uid: "pending"},
  {name: "Rejected", uid: "rejected"},
];


const initialVisibleColumns = ["Status", "ApplicationId", "FirstName", "DOB", "Country", "RequestorEmail", "actions"];
const statusColorMap = {
    Approved: "success",
    Pending: "warning",
    Rejected: "danger",
};

const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
};

export {columns, statusOptions, initialVisibleColumns, statusColorMap, dateOptions, userColumns};