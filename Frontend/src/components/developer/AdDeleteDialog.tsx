import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface AdDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const AdDeleteDialog: React.FC<AdDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Advertisement
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this advertisement? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> Deleting this advertisement will:
            </p>
            <ul className="text-sm text-destructive mt-2 space-y-1 ml-4">
              <li>• Remove it from all active campaigns</li>
              <li>• Stop all future revenue from this ad</li>
              <li>• Permanently delete associated video and thumbnail files</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Advertisement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
