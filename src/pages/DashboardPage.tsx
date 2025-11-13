import { useEffect, useState } from 'react';
import { Calendar, Clock, DoorOpen, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import type { Booking, Room } from '../types';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [nextBooking, setNextBooking] = useState<Booking | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const bookingsResponse = await api.get(`/users/${user?.id}/bookings`, {
        params: { status: 'confirmed', limit: 1 },
      });

      const userBookings = bookingsResponse.data.data || [];
      const now = new Date();
      const upcoming = userBookings
        .filter((b: Booking) => new Date(b.start_time) > now)
        .sort((a: Booking, b: Booking) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );

      if (upcoming.length > 0) {
        const bookingWithRoom = await api.get(`/bookings/${upcoming[0].id}`);
        setNextBooking(bookingWithRoom.data.data);
      }

      const roomsResponse = await api.get('/rooms');
      const rooms = roomsResponse.data.data || [];

      const now30min = new Date(now.getTime() + 30 * 60000);
      const endTime = new Date(now30min);
      endTime.setMinutes(endTime.getMinutes() + 30);

      const availabilityChecks = await Promise.all(
        rooms.map(async (room: Room) => {
          try {
            const date = now30min.toISOString().split('T')[0];
            const availResponse = await api.get(`/rooms/${room.id}/availability`, {
              params: { date },
            });
            const slots = availResponse.data.data || [];
            const nextSlotTime = now30min.toTimeString().slice(0, 5);
            const nextSlot = slots.find((s: any) => s.time === nextSlotTime);
            return { room, available: nextSlot?.available || false };
          } catch {
            return { room, available: false };
          }
        })
      );

      setAvailableRooms(
        availabilityChecks
          .filter((check) => check.available)
          .map((check) => check.room)
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user?.first_name}!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              <Calendar size={24} />
            </div>
            <h2 className="text-xl font-semibold">Next Upcoming Booking</h2>
          </div>

          {nextBooking ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{nextBooking.title}</h3>
                {nextBooking.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {nextBooking.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DoorOpen size={16} className="text-gray-500" />
                  <span className="font-medium">{nextBooking.room?.name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-gray-500" />
                  <span>
                    {formatDateTime(nextBooking.start_time).date} at{' '}
                    {formatDateTime(nextBooking.start_time).time}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-success-500" />
                  <span className="text-success-600 dark:text-success-400 font-medium">
                    {nextBooking.status}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">
                  Ends at {formatDateTime(nextBooking.end_time).time}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No upcoming bookings</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Book a room to get started
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400">
              <DoorOpen size={24} />
            </div>
            <h2 className="text-xl font-semibold">Available for Next Slot</h2>
          </div>

          {availableRooms.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {availableRooms.length} {availableRooms.length === 1 ? 'room' : 'rooms'} available
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{room.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Floor {room.floor} • Capacity: {room.capacity}
                        </p>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-success-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DoorOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No rooms available</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Check back later or view all rooms
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
