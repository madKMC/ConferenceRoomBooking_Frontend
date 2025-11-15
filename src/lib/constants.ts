export const VALIDATION = {
	BOOKING: {
		MIN_DURATION_MINUTES: 30,
		MAX_DURATION_MINUTES: 240,
		BUSINESS_HOURS: {
			START: '09:00',
			END: '17:00',
		},
	},
	INVITATIONS: {
		MAX_INVITEES: 20,
	},
	ANALYTICS: {
		MAX_DATE_RANGE_DAYS: 365,
	},
	PHONE: {
		// South African phone number formats:
		// - Landline: (012) 345-6789 or 012-345-6789
		// - Mobile: 071 234 5678 or 0712345678
		// - International: +27 12 345 6789 or +27123456789
		PATTERN:
			/^(\+27|0)[0-9]{9}$|^(\+27|0)[0-9]{2}[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/,
		MESSAGE:
			'Please enter a valid South African phone number (e.g., 012-345-6789, 071 234 5678, or +27 12 345 6789)',
	},
};

export const API_LIMITS = {
	USERS_SEARCH: {
		DEFAULT_LIMIT: 50,
		MAX_LIMIT: 100,
	},
	ROOMS: {
		DEFAULT_LIMIT: 50,
	},
};
