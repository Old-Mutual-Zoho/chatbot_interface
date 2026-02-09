export const travelPlusQuoteFormSteps = [
  {
    title: "Travel Sure Plus Quote",
    fields: [
      { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "Enter your first name" },
      { name: "middleName", label: "Middle Name", type: "text", required: false, placeholder: "Enter your middle name", optionalLabel: "optional" },
      { name: "surname", label: "Surname", type: "text", required: true, placeholder: "Enter your surname" },
      { name: "mobile", label: "Phone Number", type: "tel", required: true, placeholder: "Enter your phone number" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "Enter your email" },
     
    ],
  },
  {
    title: "Select Cover",
    fields: [
      {
        name: "coverLevel",
        label: "Cover",
        type: "radio",
        required: true,
        options: [
          { label: "Worldwide Essential", value: "worldwide_essential" },
          { label: "Worldwide Elite", value: "worldwide_elite" },
          { label: "Schengen Essential", value: "schengen_essential" },
          { label: "Schengen Elite", value: "schengen_elite" },
          { label: "Student Cover", value: "student_cover" },
          { label: "Africa & Asia", value: "africa_asia" },
          { label: "Inbound Karibu", value: "inbound_karibu" },
        ],
      },
    ],
  },
  {
    title: "Trip Details",
    fields: [
      {
        name: "departureCountry",
        label: "Departure Country",
        type: "text",
        required: true,
        placeholder: "Enter departure country",
      },
      {
        name: "destinationCountries",
        label: "Destination Countries/Country",
        type: "text",
        required: true,
        placeholder: "Enter destination countries/country",
      },
      {
        name: "travelStartDate",
        label: "Travel Start Date",
        type: "date",
        required: true,
      },
      {
        name: "travelEndDate",
        label: "Travel End Date",
        type: "date",
        required: true,
      },
      {
        name: "durationOfTravel",
        label: "Number of days for the trip",
        type: "number",
        required: true,
        placeholder: "Enter number of days",
      },
      {
        name: "whoAreYouCovering",
        label: "Who are you covering",
        type: "radio",
        required: true,
        options: [
          { label: "Myself", value: "myself" },
          { label: "Someone else", value: "someone_else" },
          { label: "Myself and someone else", value: "myself_and_someone_else" },
          { label: "Group", value: "group" },
        ],
      },
      {
        name: "numberOfTravellers",
        label: "Number of travellers",
        type: "number",
        required: true,
        placeholder: "Enter number of travellers",
      },

      
    ],
  },
];

// Not requested for quote
      // {
      //   name: "purposeOfTravel",
      //   label: "Purpose of Travel",
      //   type: "select",
      //   required: true,
      //   options: [
      //     { label: "Leisure", value: "leisure" },
      //     { label: "Business", value: "business" },
      //     { label: "Study", value: "study" },
      //     { label: "Other", value: "other" },
      //   ],
      //   placeholder: "Select purpose",
      // },
// export const travelPlusPurchaseFormSteps = [
//   {
//     title: "Additional Details",
//     fields: [
//       { name: "professionalOccupation", label: "Professional Occupation", type: "text", required: true, placeholder: "Enter your occupation" },
//       { name: "preferredContact", label: "Preferred Contact Method", type: "text", required: false, placeholder: "e.g. WhatsApp, Email, Phone Call", optionalLabel: "optional" },
//     ],
//   },
//   {
//     title: "Address Details",
//     fields: [
//       { name: "residence", label: "Place of Residence", type: "text", required: true, placeholder: "Enter your place of residence" },
//       { name: "nin", label: "NIN Number", type: "text", required: true, placeholder: "Enter your NIN number" },
//     ],
//   },
//   {
//     title: "Identification / Travel Document Details",
//     fields: [
//       {
//         name: "passportNumber",
//         label: "Passport Number",
//         type: "text",
//         required: true,
//         placeholder: "Enter your passport number",
//       },
//       {
//         name: "passportIssuingCountry",
//         label: "Passport Issuing Country",
//         type: "text",
//         required: true,
//         placeholder: "Enter issuing country",
//       },
//       {
//         name: "passportIssueDate",
//         label: "Passport Issue Date",
//         type: "date",
//         required: true,
//       },
//       {
//         name: "passportExpiryDate",
//         label: "Passport Expiry Date",
//         type: "date",
//         required: true,
//       },
//     ],
//   },
// ];
