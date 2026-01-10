import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { roomsAPI } from '@/api';
import { Button, Badge, Spinner, EmptyState, Pagination, Input } from '@/components/ui';
import { PlusIcon, BuildingOfficeIcon, QrCodeIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
  const [searchTerm, setSearchTerm] = useState('');

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
  const filteredRooms = useMemo(() => {
    if (!searchTerm) return sortedRooms;
    const needle = searchTerm.trim().toLowerCase();
    return sortedRooms.filter((room) => room.room_number?.toLowerCase().includes(needle));
  }, [sortedRooms, searchTerm]);

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by room number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              containerClassName="w-full"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredRooms.length} room{filteredRooms.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Room Grid */}
      {!filteredRooms || filteredRooms.length === 0 ? (
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
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[180px] hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Room</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {room.room_number}
                  </div>
                </div>
                <Badge variant={statusColors[room.status || 'available']}>
                  {room.status || 'available'}
                </Badge>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => handleQRClick(room)}
                >
                  <QrCodeIcon className="h-4 w-4 mr-1" />
                  QR Code
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleEditClick(room)}
                    aria-label={`Edit room ${room.room_number}`}
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleDeleteClick(room)}
                    aria-label={`Delete room ${room.room_number}`}
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
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
