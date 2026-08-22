import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Check, ExternalLink, QrCode, Mail, Send } from 'lucide-react';
import { tripsService } from '../../services/trips';
import { useUIStore } from '../../stores/uiStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const ShareModal: React.FC = () => {
  const { shareModalTripId, closeShareModal, showToast } = useUIStore();
  const [copied, setCopied] = useState(false);

  const { data: trip } = useQuery({
    queryKey: ['trip', shareModalTripId],
    queryFn: () => (shareModalTripId ? tripsService.getTripById(shareModalTripId) : null),
    enabled: !!shareModalTripId,
  });

  if (!shareModalTripId || !trip) return null;

  const shareUrl = `${window.location.origin}/share/${trip.shareId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast('Share Link Copied', 'Public itinerary link is ready to share.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={!!shareModalTripId}
      onClose={closeShareModal}
      title="Share Boarding Pass"
      subtitle={`Itinerary Code: ${trip.shareId.toUpperCase()}`}
      maxWidth="md"
    >
      <div className="space-y-5">
        <p className="text-xs text-tarmac-grey">
          Anyone with this boarding pass link can view your complete day-by-day itinerary, stops, and activities without requiring an account.
        </p>

        <div>
          <label className="block text-xs font-mono uppercase font-bold text-ink-navy mb-1.5">
            Public Boarding Pass URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-parchment border border-tarmac-grey/30 rounded-md px-3 py-2 text-xs font-mono text-ink-navy select-all focus:outline-none"
            />
            <Button
              size="sm"
              variant={copied ? 'secondary' : 'primary'}
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopy}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="bg-runway-white p-4 rounded-xl border border-dashed border-tarmac-grey/30 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-tarmac-grey block">Destination Voyage</span>
            <h5 className="font-display font-bold text-sm text-ink-navy">{trip.title}</h5>
            <span className="text-[11px] font-mono text-signal-teal block">
              {trip.stops.length} Cities • {trip.startDate}
            </span>
          </div>

          <div className="w-16 h-16 bg-white border border-tarmac-grey/20 rounded-lg p-1.5 flex flex-col items-center justify-center shrink-0 shadow-xs">
            <QrCode className="w-10 h-10 text-ink-navy" />
            <span className="text-[8px] font-mono text-tarmac-grey mt-0.5">SCAN PASS</span>
          </div>
        </div>

        <div className="pt-3 border-t border-tarmac-grey/20 flex flex-wrap items-center justify-between gap-2">
          <a
            href={`mailto:?subject=${encodeURIComponent(`Itinerary: ${trip.title}`)}&body=${encodeURIComponent(`Check out my trip itinerary on GlobeTrotter: ${shareUrl}`)}`}
            className="inline-flex items-center gap-1.5 text-xs text-ink-navy hover:text-signal-teal font-medium py-1 px-2 rounded hover:bg-tarmac-grey/10 transition-colors"
          >
            <Mail className="w-4 h-4 text-signal-teal" /> Email Pass
          </a>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out my travel itinerary for ${trip.title} on GlobeTrotter: ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-ink-navy hover:text-signal-teal font-medium py-1 px-2 rounded hover:bg-tarmac-grey/10 transition-colors"
          >
            <Send className="w-4 h-4 text-signal-teal" /> Message Link
          </a>

          <a
            href={`/share/${trip.shareId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-boarding-amber-700 hover:text-boarding-amber font-mono font-bold"
          >
            <span>Preview Public View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Modal>
  );
};
