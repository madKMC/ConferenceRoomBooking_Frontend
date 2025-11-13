import { useState, useEffect, type FormEvent } from 'react';
import { X } from 'lucide-react';
import api from '../../lib/api';
import type { Room, Booking } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking?: Booking | null;
}

const BookingModal = ({ isOpen, onClose, onSuccess, booking }: BookingModalProps) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState({
    room_id: '',
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      if (booking) {
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);
        setFormData({
          room_id: booking.room_id.toString(),
          title: booking.title,
          description: booking.description || '',
          date: start.toISOString().split('T')[0],
          start_time: start.toTimeString().slice(0, 5),
          end_time: end.toTimeString().slice(0, 5),
        });
      } else {
        setFormData({
          room_id: '',
          title: '',
          description: '',
          date: '',
          start_time: '09:00',
          end_time: '10:00',
        });
      }
      setError('');
    }
  }, [isOpen, booking]);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const start_time = `${formData.date}T${formData.start_time}:00`;
      const end_time = `${formData.date}T${formData.end_time}:00`;

      const payload = {
        room_id: parseInt(formData.room_id),
        user_id: user?.id,
        title: formData.title,
        description: formData.description,
        start_time,
        end_time,
      };

      if (booking) {
        await api.patch(`/bookings/${booking.id}`, payload);
      } else {
        await api.post('/bookings', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save booking');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {booking ? 'Edit Booking' : 'Create Booking'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room</label>
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (Floor {room.floor}, Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              placeholder="Team Meeting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              placeholder="Weekly team sync..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
                min="09:00"
                max="17:00"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
                min="09:00"
                max="17:00"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Business hours: 9:00 AM - 5:00 PM
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : booking ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
