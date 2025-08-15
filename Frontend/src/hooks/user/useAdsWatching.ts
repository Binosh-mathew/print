import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { fetchAds, watchAd, getUserSupercoins } from '@/api';
import { Ad } from '@/types/ad';

// Add TypeScript declarations for YouTube API
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export const useAdsWatching = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [supercoins, setSupercoins] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [watchComplete, setWatchComplete] = useState<boolean>(false);
  const [rewarded, setRewarded] = useState<boolean>(false);
  const [processingReward, setProcessingReward] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Reference for YouTube player API
  const youtubePlayerRef = useRef<any>(null);
  
  // Track YouTube video state
  const [youtubePlayerReady, setYoutubePlayerReady] = useState(false);

  // Load ads and user's supercoins
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load ads
        const fetchedAds = await fetchAds();
        setAds(fetchedAds);
        
        // Load user's supercoins
        const coins = await getUserSupercoins();
        setSupercoins(coins.currentCoins || coins);
        
        // Set total earned if available
        if (coins.totalEarned !== undefined) {
          setTotalEarned(coins.totalEarned);
        } else {
          // If API doesn't provide totalEarned, estimate from watched ads
          const totalFromAds = Array.isArray(fetchedAds) ? fetchedAds.reduce((total, ad) => {
            // If ad has watchedCount, add that times rewardCoins
            // Use nullish coalescing to handle undefined/null values
            if (!ad) return total;
            const watchCount = ad.watchedCount ?? 0;
            const rewardAmount = ad.rewardCoins ?? 0;
            return total + (watchCount * rewardAmount);
          }, 0) : 0;
          setTotalEarned(totalFromAds);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load ads. Please try again later.");
        console.error("Error loading ads:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Check video URL validity when selected ad changes
  useEffect(() => {
    if (selectedAd && videoRef.current) {
      // Reset error state
      setVideoError(null);
      
      // Check if the video can play
      const checkVideo = () => {
        if (videoRef.current) {
          const video = videoRef.current;
          
          // Check if video URL is valid
          if (!selectedAd.videoUrl) {
            setVideoError("Video URL is missing");
            return;
          }
          
          // Don't set src directly here since we're using <source> elements
          // Instead, set up error handling only
          
          const errorHandler = () => {
            console.error("Video error:", video.error);
            setVideoError("This video format is not supported by your browser. Please try a different ad.");
            setPlaying(false);
          };
          
          video.addEventListener('error', errorHandler);
          
          return () => {
            video.removeEventListener('error', errorHandler);
          };
        }
      };
      
      checkVideo();
    }
  }, [selectedAd]);

  // Check if URL is a YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    return !!url && (
      url.includes('youtube.com/watch') || 
      url.includes('youtu.be/') || 
      url.includes('youtube.com/embed/')
    );
  };
  
  // Extract YouTube video ID from various YouTube URL formats
  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Match patterns like: https://www.youtube.com/watch?v=VIDEO_ID
    // or https://youtu.be/VIDEO_ID or https://www.youtube.com/embed/VIDEO_ID
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
      /youtube\.com\/watch\?.*v=([^&\?\/]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Handle ad selection
  const handleWatchAd = (ad: Ad) => {
    setSelectedAd(ad);
    setWatchComplete(false);
    setRewarded(false);
    setPlaying(false);
    setVideoError(null);
  };

  // Handle claiming reward
  const handleClaimReward = async () => {
    if (!selectedAd || !watchComplete || rewarded) return;
    
    try {
      setProcessingReward(true);
      
      const response = await watchAd(selectedAd.id || selectedAd._id || '');
      
      if (response && response.coinsEarned) {
        setSupercoins(prev => prev + response.coinsEarned);
        setTotalEarned(prev => prev + response.coinsEarned);
        setRewarded(true);
        
        toast({
          title: "Reward Claimed!",
          description: `You earned ${response.coinsEarned} supercoins!`,
        });
      } else {
        throw new Error("Failed to process reward");
      }
    } catch (err: any) {
      console.error("Error claiming reward:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingReward(false);
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    setWatchComplete(true);
    setPlaying(false);
  };

  // Handle video play
  const handleVideoPlay = () => {
    setPlaying(true);
  };

  // Handle video pause
  const handleVideoPause = () => {
    setPlaying(false);
  };

  // Close video player
  const closeVideoPlayer = () => {
    setSelectedAd(null);
    setWatchComplete(false);
    setRewarded(false);
    setPlaying(false);
    setVideoError(null);
    
    // Cleanup YouTube player
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }
  };

  // Load YouTube API
  const loadYouTubeAPI = () => {
    if (window.YT && window.YT.Player) {
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve) => {
      // Check if script already exists
      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        // Script exists, wait for API to be ready
        const checkAPI = () => {
          if (window.YT && window.YT.Player) {
            resolve();
          } else {
            setTimeout(checkAPI, 100);
          }
        };
        checkAPI();
        return;
      }
      
      // Create script tag
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      
      // Set up global callback
      window.onYouTubeIframeAPIReady = () => {
        setYoutubePlayerReady(true);
        resolve();
      };
      
      document.head.appendChild(script);
    });
  };

  // Initialize YouTube player
  const initializeYouTubePlayer = async (videoId: string, containerId: string) => {
    try {
      await loadYouTubeAPI();
      
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
      
      youtubePlayerRef.current = new window.YT.Player(containerId, {
        height: '360',
        width: '640',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            console.log('YouTube player ready');
          },
          onStateChange: (event: any) => {
            if (window.YT?.PlayerState && event.data === window.YT.PlayerState.ENDED) {
              handleVideoEnd();
            } else if (window.YT?.PlayerState && event.data === window.YT.PlayerState.PLAYING) {
              handleVideoPlay();
            } else if (window.YT?.PlayerState && event.data === window.YT.PlayerState.PAUSED) {
              handleVideoPause();
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            setVideoError("Failed to load YouTube video. Please try again.");
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
      setVideoError("Failed to load video player. Please try again.");
    }
  };

  return {
    // State
    ads,
    loading,
    error,
    supercoins,
    totalEarned,
    selectedAd,
    playing,
    watchComplete,
    rewarded,
    processingReward,
    videoError,
    videoRef,
    youtubePlayerRef,
    youtubePlayerReady,
    
    // Actions
    handleWatchAd,
    handleClaimReward,
    handleVideoEnd,
    handleVideoPlay,
    handleVideoPause,
    closeVideoPlayer,
    loadYouTubeAPI,
    initializeYouTubePlayer,
    
    // Utilities
    isYouTubeUrl,
    getYoutubeVideoId,
  };
};
