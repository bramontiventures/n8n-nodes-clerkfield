import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ClerkfieldApi implements ICredentialType {
	name = 'clerkfieldApi';

	displayName = 'Clerkfield API';

	icon: Icon = { light: 'file:../icons/clerkfield.svg', dark: 'file:../icons/clerkfield.dark.svg' };

	documentationUrl = 'https://clerkfield.com/docs#authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Create a key in your Clerkfield profile at https://clerkfield.com/app#profile. It starts with cf_live_.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://clerkfield.com',
			url: '/v1/account/me',
			method: 'GET',
		},
	};
}
