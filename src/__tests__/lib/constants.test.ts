import { describe, it, expect } from 'vitest';
import { VALIDATION, API_LIMITS } from '../../lib/constants';

describe('Constants', () => {
	describe('VALIDATION', () => {
		it('should have correct booking duration limits', () => {
			expect(VALIDATION.BOOKING.MIN_DURATION_MINUTES).toBe(30);
			expect(VALIDATION.BOOKING.MAX_DURATION_MINUTES).toBe(240);
		});

		it('should have correct business hours', () => {
			expect(VALIDATION.BOOKING.BUSINESS_HOURS.START).toBe('09:00');
			expect(VALIDATION.BOOKING.BUSINESS_HOURS.END).toBe('17:00');
		});

		it('should have correct invitation limits', () => {
			expect(VALIDATION.INVITATIONS.MAX_INVITEES).toBe(20);
		});

		it('should have correct analytics limits', () => {
			expect(VALIDATION.ANALYTICS.MAX_DATE_RANGE_DAYS).toBe(365);
		});

		it('should have phone validation pattern', () => {
			expect(VALIDATION.PHONE.PATTERN).toBeInstanceOf(RegExp);
		});

		it('should have phone validation message', () => {
			expect(VALIDATION.PHONE.MESSAGE).toContain('South African');
		});
	});

	describe('API_LIMITS', () => {
		it('should have user search limits', () => {
			expect(API_LIMITS.USERS_SEARCH.DEFAULT_LIMIT).toBe(50);
			expect(API_LIMITS.USERS_SEARCH.MAX_LIMIT).toBe(100);
		});

		it('should have room limits', () => {
			expect(API_LIMITS.ROOMS.DEFAULT_LIMIT).toBe(50);
		});
	});

	describe('Phone Pattern Validation', () => {
		const pattern = VALIDATION.PHONE.PATTERN;

		it('should match valid South African numbers', () => {
			const validNumbers = [
				'0123456789',
				'071 234 5678',
				'012-345-6789',
				'+27123456789',
				'+27 12 345 6789',
				'0712345678',
			];

			validNumbers.forEach((number) => {
				const cleaned = number.replace(/[\s\-()]/g, '');
				expect(pattern.test(cleaned)).toBe(true);
			});
		});

		it('should reject invalid numbers', () => {
			const invalidNumbers = ['123', '12345', '+1234567890', 'abcdefghij'];

			invalidNumbers.forEach((number) => {
				const cleaned = number.replace(/[\s\-()]/g, '');
				expect(pattern.test(cleaned)).toBe(false);
			});
		});
	});
});
