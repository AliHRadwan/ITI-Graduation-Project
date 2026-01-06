import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roomsAPI } from '@/api';
import { Button, Badge, Spinner, EmptyState } from '@/components/ui';
import { PlusIcon, BuildingOfficeIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import CreateRoomModal from './CreateRoomModal';
import QRTokenModal from './QRTokenModal';

const statusColors = {
  available: 'success',
  occupied: 'warning',
  maintenance: 'danger',
  cleaning: 'info',
};

export default function RoomList() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [filterFloor, setFilterFloor] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['rooms', filterFloor],
    queryFn: () => roomsAPI.getRooms(filterFloor ? { floor: filterFloor } : {}),
  });

  const rooms = Array.isArray(data) ? data : data?.data || [];

  const floors = [...new Set(rooms?.map((r) => r.floor) || [])].sort();

  const handleQRClick = (room) => {
    setSelectedRoom(room);
    setShowQRModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-600">Manage hotel rooms and availability</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <select
          value={filterFloor}
          onChange={(e) => setFilterFloor(e.target.value)}
          className="rounded-md border-gray-300"
        >
          <option value="">All Floors</option>
          {floors.map((floor) => (
            <option key={floor} value={floor}>
              Floor {floor}
            </option>
          ))}
        </select>
      </div>

      {/* Room Grid */}
      {!rooms || rooms.length === 0 ? (
        <EmptyState
          icon={BuildingOfficeIcon}
          title="No rooms found"
          description="Add rooms to get started"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Room
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {room.room_number}
                  </h3>
                  <p className="text-sm text-gray-600">{room.room_type}</p>
                </div>
                <Badge variant={statusColors[room.status || 'available']}>
                  {room.status || 'available'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Floor:</span>
                  <span className="font-medium text-gray-900">{room.floor}</span>
                </div>
                {room.capacity && (
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium text-gray-900">
                      {room.capacity} guests
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  fullWidth
                  onClick={() => handleQRClick(room)}
                >
                  <QrCodeIcon className="h-4 w-4 mr-1" />
                  QR Code
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />

      {selectedRoom && (
        <QRTokenModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
        />
      )}
    </div>
  );
}

