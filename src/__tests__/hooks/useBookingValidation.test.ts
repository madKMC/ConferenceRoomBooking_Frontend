import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBookingValidation } from '../../hooks/useBookingValidation';

describe('useBookingValidation', () => {
	describe('validateBookingTime', () => {
		it('should return null for valid booking times', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'10:00',
				'11:30',
				'2025-11-20'
			);
			expect(error).toBeNull();
		});

		it('should reject bookings less than 30 minutes', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'10:00',
				'10:20',
				'2025-11-20'
			);
			expect(error).toBe('Minimum booking duration is 30 minutes');
		});

		it('should reject bookings longer than 4 hours', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'10:00',
				'15:00',
				'2025-11-20'
			);
			expect(error).toBe('Maximum booking duration is 4 hours');
		});

		it('should reject bookings starting before 09:00', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'08:30',
				'10:00',
				'2025-11-20'
			);
			expect(error).toBe('Bookings must start at or after 09:00');
		});

		it('should reject bookings ending after 17:00', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'16:00',
				'18:00',
				'2025-11-20'
			);
			expect(error).toBe('Bookings must end by 17:00');
		});

		it('should reject when end time is before start time', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'14:00',
				'12:00',
				'2025-11-20'
			);
			expect(error).toBe('End time must be after start time');
		});

		it('should reject when end time equals start time', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'10:00',
				'10:00',
				'2025-11-20'
			);
			expect(error).toBe('End time must be after start time');
		});

		it('should reject missing fields', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'',
				'10:00',
				'2025-11-20'
			);
			expect(error).toBe('Please fill in all required fields');
		});

		it('should accept 30 minutes exactly', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'10:00',
				'10:30',
				'2025-11-20'
			);
			expect(error).toBeNull();
		});

		it('should accept 4 hours exactly', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'09:00',
				'13:00',
				'2025-11-20'
			);
			expect(error).toBeNull();
		});

		it('should accept booking at start of business hours', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'09:00',
				'10:00',
				'2025-11-20'
			);
			expect(error).toBeNull();
		});

		it('should accept booking at end of business hours', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateBookingTime(
				'16:00',
				'17:00',
				'2025-11-20'
			);
			expect(error).toBeNull();
		});
	});

	describe('validateDateRange', () => {
		it('should return null for valid date range', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateDateRange(
				'2025-11-01',
				'2025-11-15'
			);
			expect(error).toBeNull();
		});

		it('should reject when start date is missing', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateDateRange('', '2025-11-15');
			expect(error).toBe('Please select both start and end dates');
		});

		it('should reject when end date is missing', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateDateRange('2025-11-01', '');
			expect(error).toBe('Please select both start and end dates');
		});

		it('should reject when start date is after end date', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateDateRange(
				'2025-11-20',
				'2025-11-10'
			);
			expect(error).toBe('Start date must be before end date');
		});

		it('should reject date range exceeding 365 days', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateDateRange(
				'2025-01-01',
				'2026-01-02'
			);
			expect(error).toBe('Date range cannot exceed 365 days');
		});

		it('should accept exactly 365 days', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateDateRange(
				'2025-01-01',
				'2025-12-31'
			);
			expect(error).toBeNull();
		});

		it('should accept same start and end date', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validateDateRange(
				'2025-11-15',
				'2025-11-15'
			);
			expect(error).toBeNull();
		});
	});

	describe('validatePhoneNumber', () => {
		it('should return null for empty phone (optional field)', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validatePhoneNumber('');
			expect(error).toBeNull();
		});

		it('should accept South African landline with dashes', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validatePhoneNumber('012-345-6789');
			expect(error).toBeNull();
		});

		it('should accept South African mobile with spaces', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validatePhoneNumber('071 234 5678');
			expect(error).toBeNull();
		});

		it('should accept South African mobile without spaces', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validatePhoneNumber('0712345678');
			expect(error).toBeNull();
		});

		it('should accept international format with +27', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validatePhoneNumber('+27 12 345 6789');
			expect(error).toBeNull();
		});

		it('should accept international format without spaces', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validatePhoneNumber('+27123456789');
			expect(error).toBeNull();
		});

		it('should reject invalid phone number', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validatePhoneNumber('123');
			expect(error).toBe(
				'Please enter a valid South African phone number (e.g., 012-345-6789, 071 234 5678, or +27 12 345 6789)'
			);
		});

		it('should reject US phone number', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validatePhoneNumber('+1-555-0100');
			expect(error).toBe(
				'Please enter a valid South African phone number (e.g., 012-345-6789, 071 234 5678, or +27 12 345 6789)'
			);
		});

		it('should reject phone with letters', () => {
			const { result } = renderHook(() => useBookingValidation());
			const error = result.current.validatePhoneNumber('071-ABC-DEFG');
			expect(error).toBe(
				'Please enter a valid South African phone number (e.g., 012-345-6789, 071 234 5678, or +27 12 345 6789)'
			);
		});
	});
});
