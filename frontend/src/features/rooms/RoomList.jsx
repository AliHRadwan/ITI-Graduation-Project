import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { roomsAPI } from '@/api';
import { Button, Badge, Spinner, EmptyState, Pagination } from '@/components/ui';
import { PlusIcon, BuildingOfficeIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import CreateRoomModal from './CreateRoomModal';
import QRTokenModal from './QRTokenModal';
import EditRoomModal from './EditRoomModal';

const statusColors = {
  available: 'success',
  occupied: 'warning',
  maintenance: 'danger',
  cleaning: 'info',
};

export default function RoomList() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', page],
    queryFn: () => roomsAPI.getRooms({ page, per_page: perPage }),
  });

  const rooms = data?.items || [];
  const pagination = data?.pagination || null;
  const collator = useMemo(
    () => new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }),
    []
  );
  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => collator.compare(a.room_number, b.room_number)),
    [rooms, collator]
  );

  const deleteMutation = useMutation({
    mutationFn: (id) => roomsAPI.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      toast.success('Room deleted');
    },
    onError: () => toast.error('Failed to delete room'),
  });

  const handleQRClick = (room) => {
    setSelectedRoom(room);
    setShowQRModal(true);
  };

  const handleEditClick = (room) => {
    setSelectedRoom(room);
    setShowEditModal(true);
  };

  const handleDeleteClick = (room) => {
    const confirmed = window.confirm(`Delete room ${room.room_number}? This cannot be undone.`);
    if (!confirmed) return;
    deleteMutation.mutate(room.id);
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
          {sortedRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {room.room_number}
                  </h3>
                </div>
                <Badge variant={statusColors[room.status || 'available']}>
                  {room.status || 'available'}
                </Badge>
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
                <Button
                  size="sm"
                  variant="secondary"
                  fullWidth
                  onClick={() => handleEditClick(room)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  fullWidth
                  onClick={() => handleDeleteClick(room)}
                >
                  Delete
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
          queryClient.invalidateQueries(['rooms']);
        }}
      />

      {selectedRoom && (
        <EditRoomModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedRoom(null);
            queryClient.invalidateQueries(['rooms']);
          }}
        />
      )}

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

      {pagination?.last_page > 1 && (
        <Pagination
          currentPage={pagination.current_page || 1}
          totalPages={pagination.last_page || 1}
          onPageChange={(nextPage) => {
            if (nextPage < 1 || nextPage > (pagination.last_page || 1)) return;
            setPage(nextPage);
          }}
        />
      )}
    </div>
  );
}
