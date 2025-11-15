import { VALIDATION } from '../lib/constants';

export const useBookingValidation = () => {
	const validateBookingTime = (
		startTime: string,
		endTime: string,
		date: string
	): string | null => {
		if (!startTime || !endTime || !date) {
			return 'Please fill in all required fields';
		}

		const start = new Date(`${date}T${startTime}:00`);
		const end = new Date(`${date}T${endTime}:00`);

		// Check if dates are valid
		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			return 'Invalid date or time format';
		}

		// Check if end time is after start time
		if (end <= start) {
			return 'End time must be after start time';
		}

		const duration = (end.getTime() - start.getTime()) / (1000 * 60);

		if (duration < VALIDATION.BOOKING.MIN_DURATION_MINUTES) {
			return `Minimum booking duration is ${VALIDATION.BOOKING.MIN_DURATION_MINUTES} minutes`;
		}

		if (duration > VALIDATION.BOOKING.MAX_DURATION_MINUTES) {
			return `Maximum booking duration is ${
				VALIDATION.BOOKING.MAX_DURATION_MINUTES / 60
			} hours`;
		}

		// Validate business hours
		const startTimeOnly = startTime;
		const endTimeOnly = endTime;

		if (startTimeOnly < VALIDATION.BOOKING.BUSINESS_HOURS.START) {
			return `Bookings must start at or after ${VALIDATION.BOOKING.BUSINESS_HOURS.START}`;
		}

		if (endTimeOnly > VALIDATION.BOOKING.BUSINESS_HOURS.END) {
			return `Bookings must end by ${VALIDATION.BOOKING.BUSINESS_HOURS.END}`;
		}

		return null;
	};

	const validateDateRange = (
		startDate: string,
		endDate: string
	): string | null => {
		if (!startDate || !endDate) {
			return 'Please select both start and end dates';
		}

		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			return 'Invalid date format';
		}

		if (start > end) {
			return 'Start date must be before end date';
		}

		const daysDiff = Math.ceil(
			(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (daysDiff > VALIDATION.ANALYTICS.MAX_DATE_RANGE_DAYS) {
			return `Date range cannot exceed ${VALIDATION.ANALYTICS.MAX_DATE_RANGE_DAYS} days`;
		}

		return null;
	};

	const validatePhoneNumber = (phone: string): string | null => {
		if (!phone) {
			return null; // Phone is optional
		}

		const cleanedPhone = phone.replace(/[\s\-()]/g, '');

		if (!VALIDATION.PHONE.PATTERN.test(cleanedPhone)) {
			return VALIDATION.PHONE.MESSAGE;
		}

		return null;
	};

	return {
		validateBookingTime,
		validateDateRange,
		validatePhoneNumber,
	};
};
