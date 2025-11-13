import { useEffect, useState } from 'react';
import { DoorOpen, Users, MapPin, Tv, Wifi, Monitor, Coffee, Phone } from 'lucide-react';
import api from '../lib/api';
import type { Room } from '../types';

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCapacity, setFilterCapacity] = useState<string>('');
  const [filterFloor, setFilterFloor] = useState<string>('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (filterCapacity) params.capacity = filterCapacity;
      if (filterFloor) params.floor = filterFloor;

      const response = await api.get('/rooms', { params });
      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filterCapacity, filterFloor]);

  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase();
    if (name.includes('projector') || name.includes('screen')) return Tv;
    if (name.includes('wifi') || name.includes('internet')) return Wifi;
    if (name.includes('monitor') || name.includes('display')) return Monitor;
    if (name.includes('coffee') || name.includes('refreshment')) return Coffee;
    if (name.includes('phone') || name.includes('conference call')) return Phone;
    return DoorOpen;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Conference Rooms</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Browse available meeting spaces and their amenities
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Capacity</label>
            <input
              type="number"
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              placeholder="e.g., 10"
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Floor</label>
            <input
              type="number"
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              placeholder="e.g., 3"
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        {(filterCapacity || filterFloor) && (
          <button
            onClick={() => {
              setFilterCapacity('');
              setFilterFloor('');
            }}
            className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <DoorOpen size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No rooms found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => {
            return (
              <div
                key={room.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{room.name}</h3>
                      <div className="flex items-center gap-4 text-sm opacity-90">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>Floor {room.floor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{room.capacity} people</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <DoorOpen size={24} />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {room.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {room.description}
                    </p>
                  )}

                  {room.amenities && room.amenities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Amenities
                      </h4>
                      <div className="space-y-2">
                        {room.amenities.map((amenity) => {
                          const Icon = getAmenityIcon(amenity.name);
                          return (
                            <div
                              key={amenity.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Icon
                                size={16}
                                className="text-primary-600 dark:text-primary-400"
                              />
                              <span className="text-gray-700 dark:text-gray-300">
                                {amenity.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(!room.amenities || room.amenities.length === 0) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No amenities listed
                    </p>
                  )}
                </div>

                <div className="px-6 pb-6">
                  <button className="w-full py-2 px-4 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 font-medium transition-colors">
                    View Availability
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
