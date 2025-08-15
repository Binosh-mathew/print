import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Coins, X } from 'lucide-react';
import { Ad } from '@/types/ad';

interface VideoPlayerDialogProps {
  selectedAd: Ad | null;
  isOpen: boolean;
  onClose: () => void;
  playing: boolean;
  watchComplete: boolean;
  rewarded: boolean;
  processingReward: boolean;
  videoError: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  onClaimReward: () => void;
  onVideoEnd: () => void;
  onVideoPlay: () => void;
  onVideoPause: () => void;
  isYouTubeUrl: (url: string) => boolean;
  getYoutubeVideoId: (url: string) => string | null;
  initializeYouTubePlayer: (videoId: string, containerId: string) => Promise<void>;
}

export const VideoPlayerDialog: React.FC<VideoPlayerDialogProps> = ({
  selectedAd,
  isOpen,
  onClose,
  playing,
  watchComplete,
  rewarded,
  processingReward,
  videoError,
  videoRef,
  onClaimReward,
  onVideoEnd,
  onVideoPlay,
  onVideoPause,
  isYouTubeUrl,
  getYoutubeVideoId,
  initializeYouTubePlayer,
}) => {
  // Initialize YouTube player for YouTube URLs
  useEffect(() => {
    if (selectedAd && selectedAd.videoUrl && isYouTubeUrl(selectedAd.videoUrl)) {
      const videoId = getYoutubeVideoId(selectedAd.videoUrl);
      if (videoId) {
        setTimeout(() => {
          initializeYouTubePlayer(videoId, 'youtube-player-container');
        }, 500);
      }
    }
  }, [selectedAd, isYouTubeUrl, getYoutubeVideoId, initializeYouTubePlayer]);

  if (!selectedAd) return null;

  const isYouTube = selectedAd.videoUrl && isYouTubeUrl(selectedAd.videoUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {selectedAd.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {selectedAd.description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Error Alert */}
          {videoError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{videoError}</AlertDescription>
            </Alert>
          )}

          {/* Video Player */}
          <div className="space-y-4">
            {isYouTube ? (
              // YouTube Player Container
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <div id="youtube-player-container" className="w-full h-full"></div>
              </div>
            ) : (
              // Regular Video Player
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                  onEnded={onVideoEnd}
                  onPlay={onVideoPlay}
                  onPause={onVideoPause}
                  poster={selectedAd.thumbnailUrl}
                >
                  {selectedAd.videoUrl && (
                    <>
                      <source src={selectedAd.videoUrl} type="video/mp4" />
                      <source src={selectedAd.videoUrl} type="video/webm" />
                      <source src={selectedAd.videoUrl} type="video/ogg" />
                    </>
                  )}
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Video Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    playing ? 'bg-green-500 animate-pulse' : 
                    watchComplete ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {playing ? 'Playing' : watchComplete ? 'Completed' : 'Ready to Play'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{selectedAd.rewardCoins} coins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Section */}
          <div className="border-t pt-6">
            {watchComplete && !rewarded && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Congratulations! You've watched the complete advertisement. 
                  Click below to claim your reward!
                </AlertDescription>
              </Alert>
            )}

            {rewarded && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Reward claimed successfully! You earned {selectedAd.rewardCoins} supercoins.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">Earn Supercoins</h4>
                <p className="text-sm text-muted-foreground">
                  Watch the complete video to earn {selectedAd.rewardCoins} supercoins
                </p>
              </div>

              <Button
                onClick={onClaimReward}
                disabled={!watchComplete || rewarded || processingReward}
                className="flex items-center space-x-2"
              >
                {processingReward ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : rewarded ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Claimed</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Claim Reward</span>
                  </>
                )}
              </Button>
            </div>

            {!watchComplete && (
              <p className="text-xs text-muted-foreground mt-2">
                * You must watch the complete video to claim your reward
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
