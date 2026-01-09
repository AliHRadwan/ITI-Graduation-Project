import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { roomsAPI } from '@/api';
import { Modal, Button, Spinner, Badge } from '@/components/ui';
import { format } from 'date-fns';
import { QrCodeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function QRTokenModal({ isOpen, onClose, room }) {
  const queryClient = useQueryClient();
  const [expiresInDays, setExpiresInDays] = useState(7);

  const downloadQRCode = (tokenId, roomNumber) => {
    const svg = document.getElementById(`qr-${tokenId}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `room-${roomNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const { data, isLoading } = useQuery({
    queryKey: ['room-tokens', room.id],
    queryFn: () => roomsAPI.getRoomTokens(room.id),
    enabled: isOpen,
  });

  const tokens = Array.isArray(data) ? data : data?.data || [];

  const issueTokenMutation = useMutation({
    mutationFn: () =>
      roomsAPI.issueToken(room.id, {
        expires_at: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['room-tokens', room.id]);
      toast.success('QR token generated!');
    },
    onError: () => toast.error('Failed to generate token'),
  });

  const revokeTokenMutation = useMutation({
    mutationFn: (tokenId) => roomsAPI.revokeToken(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries(['room-tokens', room.id]);
      toast.success('Token revoked');
    },
    onError: () => toast.error('Failed to revoke token'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`QR Tokens - Room ${room.room_number}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Generate New Token */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Generate New Token</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Expires in:</label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="rounded-md border-gray-300"
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
            </select>
            <Button
              size="sm"
              onClick={() => issueTokenMutation.mutate()}
              loading={issueTokenMutation.isLoading}
            >
              <QrCodeIcon className="h-4 w-4 mr-1" />
              Generate
            </Button>
          </div>
        </div>

        {/* Active Tokens */}
        <div>
          <h3 className="font-semibold mb-3">Active Tokens</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !tokens || tokens.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No active tokens. Generate one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="p-6 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* QR Code Display */}
                    <div className="flex flex-col items-center">
                      {token.deep_link ? (
                        <>
                          <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
                            <QRCodeSVG
                              id={`qr-${token.id}`}
                              value={token.deep_link}
                              size={180}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadQRCode(token.id, room.room_number)}
                            className="mt-3"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            Download QR
                          </Button>
                        </>
                      ) : (
                        <div className="p-4 bg-gray-100 rounded-lg text-center">
                          <QrCodeIcon className="h-24 w-24 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">QR code unavailable</p>
                        </div>
                      )}
                    </div>

                    {/* Token Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-semibold text-gray-900">Token Details</h4>
                          {token.revoked_at ? (
                            <Badge variant="danger" size="sm">
                              Revoked
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm">
                              Active
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Expires:</span>
                            <span className="ml-2 font-medium">
                              {token.expires_at ? format(new Date(token.expires_at), 'MMM d, yyyy') : 'Never'}
                            </span>
                          </div>
                          
                          {token.deep_link && (
                            <div>
                              <span className="text-gray-600">Deep Link:</span>
                              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                                <code className="text-xs text-blue-600 break-all">
                                  {token.deep_link}
                                </code>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {!token.revoked_at && (
                        <div className="mt-4">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => revokeTokenMutation.mutate(token.id)}
                            loading={revokeTokenMutation.isLoading}
                          >
                            Revoke Token
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
