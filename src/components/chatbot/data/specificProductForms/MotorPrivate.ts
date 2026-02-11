import { MOTOR_PRIVATE_VEHICLE_MAKE_OPTIONS } from "../vehicleMakes";

// Motor Private Insurance form steps.
export const motorPrivateQuoteFormSteps = [
	{
		title: "Get A Quote",
		description: "Get your motor insurance quote in minutes - quick, easy and hassle-free",
		fields: [
			{
				name: "coverType",
				label: "Select cover type",
				type: "radio",
				required: true,
				options: [
					{ label: "Comprehensive Insurance", value: "comprehensive" },
					{ label: "Third Party Insurance", value: "third_party" },
				],
			},
		],
	},
	{
		title: "Personal Details",
		fields: [
			{
				name: "firstName",
				label: "First Name",
				type: "text",
				required: true,
				placeholder: "Enter your first name",
			},
			{
				name: "middleName",
				label: "Middle Name",
				type: "text",
				required: false,
				placeholder: "Enter your middle name",
				optionalLabel: "optional",
			},
			{
				name: "surname",
				label: "Surname",
				type: "text",
				required: true,
				placeholder: "Enter your surname",
			},
			{
				name: "mobile",
				label: "Phone Number",
				type: "tel",
				required: true,
				placeholder: "+256 7XXXXXXXX",
			},
			{
				name: "email",
				label: "Email",
				type: "email",
				required: true,
				placeholder: "name@example.com",
			},
		],
	},
	{
		title: "Premium Calculation",
		description: "Let's crunch the numbers and calculate your premium",
		fields: [
			{
				name: "vehicleMake",
				label: "Choose vehicle make",
				type: "combobox",
				required: true,
				placeholder: "Select vehicle make",
				// Options list is shared across forms.
				options: MOTOR_PRIVATE_VEHICLE_MAKE_OPTIONS,
			},
			{
				name: "yearOfManufacture",
				label: "Year of manufacture",
				type: "number",
				required: true,
				placeholder: "e.g. 2015",
			},
			{
				name: "coverStartDate",
				label: "Cover start date",
				type: "date",
				required: true,
			},
			{
				name: "isRareModel",
				label: "Is the car a rare model?",
				type: "radio",
				required: true,
				options: [
					{ label: "Yes", value: "yes" },
					{ label: "No", value: "no" },
				],
			},
			{
				name: "hasUndergoneValuation",
				label: "Has the vehicle undergone valuation?",
				type: "radio",
				required: true,
				options: [
					{ label: "Yes", value: "yes" },
					{ label: "No", value: "no" },
				],
			},
			{
				name: "vehicleValueUgx",
				label: "Value of Vehicle (UGX)",
				type: "number",
				required: true,
				placeholder: "Enter value of vehicle",
			},
			{
				name: "isFirstRegistrationForThisInsurance",
				label: "Is this the first time this vehicle is being registered for this type of insurance?",
				type: "radio",
				required: true,
				options: [
					{ label: "Yes", value: "yes" },
					{ label: "No", value: "no" },
				],
			},
			{
				name: "hasCarAlarmInstalled",
				label: "Do you have a car alarm installed?",
				type: "radio",
				required: true,
				options: [
					{ label: "Yes", value: "yes" },
					{ label: "No", value: "no" },
				],
			},
			{
				name: "hasTrackingSystemInstalled",
				label: "Do you have a tracking system installed?",
				type: "radio",
				required: true,
				options: [
					{ label: "Yes", value: "yes" },
					{ label: "No", value: "no" },
				],
			},
			{
				name: "usageRegion",
				label: "Do you use your car within Uganda or within/outside East Africa?",
				type: "radio",
				required: true,
				options: [
					{ label: "Within Uganda", value: "within_uganda" },
					{ label: "Within East Africa", value: "within_east_africa" },
					{ label: "Outside East Africa", value: "outside_east_africa" },
				],
			},
		],
	},
];

