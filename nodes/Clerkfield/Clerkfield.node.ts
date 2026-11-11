import {
	NodeConnectionTypes,
	type INodeProperties,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

// U.S. states and DC. Coverage differs by check: the Coverage resource (or https://clerkfield.com/coverage)
// lists which states each check supports. An uncovered state returns a clear "not covered" error.
const STATES: INodePropertyOptions[] = [
	['Alabama', 'AL'], ['Alaska', 'AK'], ['Arizona', 'AZ'], ['Arkansas', 'AR'], ['California', 'CA'],
	['Colorado', 'CO'], ['Connecticut', 'CT'], ['Delaware', 'DE'], ['District of Columbia', 'DC'],
	['Florida', 'FL'], ['Georgia', 'GA'], ['Hawaii', 'HI'], ['Idaho', 'ID'], ['Illinois', 'IL'],
	['Indiana', 'IN'], ['Iowa', 'IA'], ['Kansas', 'KS'], ['Kentucky', 'KY'], ['Louisiana', 'LA'],
	['Maine', 'ME'], ['Maryland', 'MD'], ['Massachusetts', 'MA'], ['Michigan', 'MI'], ['Minnesota', 'MN'],
	['Mississippi', 'MS'], ['Missouri', 'MO'], ['Montana', 'MT'], ['Nebraska', 'NE'], ['Nevada', 'NV'],
	['New Hampshire', 'NH'], ['New Jersey', 'NJ'], ['New Mexico', 'NM'], ['New York', 'NY'],
	['North Carolina', 'NC'], ['North Dakota', 'ND'], ['Ohio', 'OH'], ['Oklahoma', 'OK'], ['Oregon', 'OR'],
	['Pennsylvania', 'PA'], ['Rhode Island', 'RI'], ['South Carolina', 'SC'], ['South Dakota', 'SD'],
	['Tennessee', 'TN'], ['Texas', 'TX'], ['Utah', 'UT'], ['Vermont', 'VT'], ['Virginia', 'VA'],
	['Washington', 'WA'], ['West Virginia', 'WV'], ['Wisconsin', 'WI'], ['Wyoming', 'WY'],
].map(([name, value]) => ({ name, value }));

const forBusinessVerify = { resource: ['business'], operation: ['verify'] };
const forLienSearch = { resource: ['lien'], operation: ['search'] };

const businessProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['business'] } },
		options: [
			{
				name: 'Verify',
				value: 'verify',
				action: 'Verify a business',
				description:
					'Check a business against the official registry of the state it was formed in and get a Pass, Review or Fail verdict',
				routing: { request: { method: 'GET', url: '/v1/business-check' } },
			},
		],
		default: 'verify',
	},
	{
		displayName: 'Business Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. DIY Automotive LLC',
		description: 'The business name as the applicant gave it',
		displayOptions: { show: forBusinessVerify },
		routing: { send: { type: 'query', property: 'name' } },
	},
	{
		displayName: 'State',
		name: 'state',
		type: 'options',
		options: STATES,
		required: true,
		default: 'FL',
		description: 'The state where the business was formed (not necessarily where it operates)',
		displayOptions: { show: forBusinessVerify },
		routing: { send: { type: 'query', property: 'state' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: forBusinessVerify },
		options: [
			{
				displayName: 'Minimum Months in Business',
				name: 'minMonths',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 6,
				description: 'Flag businesses formed more recently than this many months ago',
				routing: { send: { type: 'query', property: 'min_months' } },
			},
			{
				displayName: 'Owner Name',
				name: 'owner',
				type: 'string',
				default: '',
				placeholder: 'e.g. Eric Vonfricken',
				description:
					"The applicant's name, checked against the officers the state lists. This is not identity verification.",
				routing: { send: { type: 'query', property: 'owner' } },
			},
		],
	},
];

const lienProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['lien'] } },
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search UCC liens',
				description:
					'List UCC financing statements filed against a business, or filed by a lender, newest first',
				routing: { request: { method: 'GET', url: '/v1/liens' } },
			},
		],
		default: 'search',
	},
	{
		displayName: 'State',
		name: 'state',
		type: 'options',
		options: STATES,
		required: true,
		default: 'FL',
		description: 'The state whose UCC filing office to search, usually where the business is organized',
		displayOptions: { show: forLienSearch },
		routing: { send: { type: 'query', property: 'state' } },
	},
	{
		displayName: 'Search By',
		name: 'searchBy',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Business (Debtor)',
				value: 'debtor',
				description: 'Find filings against a business, for example to check for stacking',
			},
			{
				name: 'Lender (Secured Party)',
				value: 'securedParty',
				description: 'Find every filing a lender has made in the state',
			},
		],
		default: 'debtor',
		displayOptions: { show: forLienSearch },
	},
	{
		displayName: 'Business Name',
		name: 'debtor',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. DIY Automotive LLC',
		displayOptions: { show: { ...forLienSearch, searchBy: ['debtor'] } },
		routing: { send: { type: 'query', property: 'debtor' } },
	},
	{
		displayName: 'Lender Name',
		name: 'securedParty',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Pearl Capital',
		displayOptions: { show: { ...forLienSearch, searchBy: ['securedParty'] } },
		routing: { send: { type: 'query', property: 'secured_party' } },
	},
	{
		displayName: 'Include Lapsed and Terminated',
		name: 'includeInactive',
		type: 'boolean',
		default: true,
		description: 'Whether to include lapsed and terminated filings, which show lending history',
		displayOptions: { show: forLienSearch },
		routing: { send: { type: 'query', property: 'include_inactive', value: '={{$value ? "true" : "false"}}' } },
	},
];

const coverageProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['coverage'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get coverage by state',
				description: 'Which states each check covers and what each state publishes',
				routing: { request: { method: 'GET', url: '/v1/coverage' } },
			},
		],
		default: 'get',
	},
];

export class Clerkfield implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Clerkfield',
		name: 'clerkfield',
		icon: { light: 'file:../../icons/clerkfield.svg', dark: 'file:../../icons/clerkfield.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Verify U.S. businesses against official state registries and search UCC liens by business or lender',
		defaults: { name: 'Clerkfield' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'clerkfieldApi', required: true }],
		requestDefaults: {
			baseURL: 'https://clerkfield.com',
			headers: { Accept: 'application/json' },
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Business', value: 'business' },
					{ name: 'Coverage', value: 'coverage' },
					{ name: 'UCC Lien', value: 'lien' },
				],
				default: 'business',
			},
			...businessProperties,
			...lienProperties,
			...coverageProperties,
		],
	};
}
