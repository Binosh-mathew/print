import { useState, useEffect, useRef } from 'react';
import UserLayout from '@/components/layouts/UserLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Play, Clock, Coins, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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

const AdsPage = () => {
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
  
  // Try to resolve video format issues
  const resolveVideoUrl = (url: string): string => {
    if (!url) return url;
    
    // Don't modify YouTube URLs
    if (isYouTubeUrl(url)) {
      return url;
    }
    
    // Check if the URL already has a valid video extension
    if (/\.(mp4|webm|ogg|mov|m3u8)$/i.test(url)) {
      return url;
    }
    
    // If it's a Cloudinary URL without extension, append format
    if (url.includes('cloudinary.com') && !url.includes('resource_type=video')) {
      // Cloudinary transformation to force mp4
      if (url.includes('/upload/')) {
        return url.replace('/upload/', '/upload/f_mp4/');
      }
    }
    
    // If it's a URL with query parameters but no extension
    if (url.includes('?') && !url.match(/\.(mp4|webm|ogg|mov|m3u8)/i)) {
      return `${url}&format=mp4`;
    }
    
    return url;
  };

  // Handle video ended event
  const handleVideoEnded = () => {
    setPlaying(false);
    setWatchComplete(true);
  };

  // Handle video play
  const handlePlayAd = (ad: Ad) => {
    setSelectedAd(ad);
    setPlaying(true);
    setWatchComplete(false);
    setRewarded(false);
    setVideoError(null);
    
    // Function to check video format support
    const checkVideoFormat = (url: string) => {
      // Simple check if the URL has a file extension we recognize
      const formatSupported = /\.(mp4|webm|ogg|mov|m3u8)$/i.test(url);
      if (!formatSupported) {
        console.warn("Potentially unsupported video format:", url);
      }
      return formatSupported;
    };
    
    // Check if the URL appears to be valid
    if (!ad.videoUrl) {
      setVideoError("Video URL is missing");
      setPlaying(false);
      return;
    }
    
    // Check if it's a YouTube URL
    if (isYouTubeUrl(ad.videoUrl)) {
      // For YouTube URLs, we'll use the iframe API
      const videoId = getYoutubeVideoId(ad.videoUrl);
      if (!videoId) {
        setVideoError("Invalid YouTube URL");
        setPlaying(false);
        return;
      }
      
      // YouTube player will be initialized by the iframe when it loads
      // The setupYouTubePlayer function will be called in the useEffect when the video element exists
      setTimeout(() => {
        setupYouTubePlayer();
      }, 100);
      
      return;
    }
    
    // For direct video URLs (non-YouTube)
    // Try to fix video URL format issues
    const resolvedUrl = resolveVideoUrl(ad.videoUrl);
    // Create a modified ad object with the resolved URL
    const resolvedAd = {
      ...ad,
      videoUrl: resolvedUrl
    };
    
    // Use the resolved ad object
    setSelectedAd(resolvedAd);
    
    // Reset video if it was already played
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      
      // Force video element to reload with new sources
      videoRef.current.load();
      
      // Handle potential play errors
      videoRef.current.play()
        .catch(error => {
          console.error("Error playing video:", error);
          
          if (error.name === "NotSupportedError" || !checkVideoFormat(resolvedUrl)) {
            setVideoError("This video format is not supported by your browser");
          } else if (error.name === "AbortError") {
            setVideoError("Video playback was aborted");
          } else if (error.name === "NetworkError") {
            setVideoError("Network error occurred while loading the video");
          } else {
            setVideoError("Failed to play this ad. Please try again later.");
          }
          
          setPlaying(false);
        });
    }
  };

  // Handle claiming reward
  const handleClaimReward = async () => {
    if (!selectedAd) return;
    
    try {
      setProcessingReward(true);
      const result = await watchAd(selectedAd.id || selectedAd._id || '');
      
      // Update supercoins
      if (result.supercoins) {
        if (typeof result.supercoins === 'object') {
          // If API returns object with currentCoins and totalEarned
          setSupercoins(result.supercoins.currentCoins || result.supercoins);
          if (result.supercoins.totalEarned !== undefined) {
            setTotalEarned(result.supercoins.totalEarned);
          } else {
            // Increment total earned with the newly earned coins
            setTotalEarned(prev => prev + selectedAd.rewardCoins);
          }
        } else {
          // If API just returns a number
          setSupercoins(result.supercoins);
          // Increment total earned with the newly earned coins
          setTotalEarned(prev => prev + selectedAd.rewardCoins);
        }
      }
      
      setRewarded(true);
      
      toast({
        title: "Reward Claimed",
        description: `You earned ${selectedAd.rewardCoins} supercoins!`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to claim reward",
        description: err.message || "Something went wrong. Try again later.",
        variant: "destructive"
      });
    } finally {
      setProcessingReward(false);
    }
  };

  // Handle video close
  const handleCloseVideo = () => {
    // Clean up YouTube player if it exists
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.destroy();
      } catch (error) {
        console.error("Error destroying YouTube player:", error);
      }
      youtubePlayerRef.current = null;
      setYoutubePlayerReady(false);
    }
    
    setSelectedAd(null);
    setPlaying(false);
    setWatchComplete(false);
    setRewarded(false);
    setVideoError(null);
  };

  // Prevent video pause/play toggling when user clicks
  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If the video is paused for any reason, resume it
    if (videoRef.current && videoRef.current.paused && playing) {
      videoRef.current.play();
    }
    
    return false;
  };
  
  // Handler for overlay div clicks
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If the video is paused for any reason, resume it
    if (videoRef.current && videoRef.current.paused && playing) {
      videoRef.current.play();
    }
  };

  // Separate component to handle YouTube videos
  const YouTubeVideoPlayer = () => {
    // Set up YouTube player when component mounts
    useEffect(() => {
      if (!selectedAd || !isYouTubeUrl(selectedAd.videoUrl) || !playing) return;
      
      // Create container if needed
      let container = document.getElementById('youtube-player-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'youtube-player-container';
        document.querySelector('.aspect-video')?.appendChild(container);
      }
      
      // Load YouTube API if needed
      if (!window.YT || !window.YT.Player) {
        // Set up API loading
        window.onYouTubeIframeAPIReady = () => {
          initializeYouTubePlayer();
        };
        
        // Check if script is already added
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
          const script = document.createElement('script');
          script.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(script);
        }
      } else {
        // API already loaded, initialize player
        initializeYouTubePlayer();
      }
      
      return () => {
        // Clean up
        if (youtubePlayerRef.current) {
          try {
            youtubePlayerRef.current.destroy();
          } catch (e) {
            console.error("Error destroying YouTube player:", e);
          }
          youtubePlayerRef.current = null;
        }
      };
    }, [selectedAd, playing]);
    
    // Initialize the YouTube player
    const initializeYouTubePlayer = () => {
      if (!selectedAd || !window.YT || !window.YT.Player) return;
      
      const videoId = getYoutubeVideoId(selectedAd.videoUrl);
      if (!videoId) {
        setVideoError("Invalid YouTube URL");
        setPlaying(false);
        return;
      }
      
      try {
        // Create player
        youtubePlayerRef.current = new window.YT.Player('youtube-player-container', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: playing ? 1 : 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 0,
            disablekb: 1
          },
          events: {
            onReady: (event: any) => {
              if (playing) event.target.playVideo();
              setYoutubePlayerReady(true);
            },
            onStateChange: (event: any) => {
              if (event.data === 0) { // Video ended
                handleVideoEnded();
              }
            },
            onError: (event: any) => {
              console.error("YouTube player error:", event);
              setVideoError("Error loading YouTube video");
              setPlaying(false);
            }
          }
        });
      } catch (error) {
        console.error("Error initializing YouTube player:", error);
        setVideoError("Failed to initialize YouTube player");
        setPlaying(false);
      }
    };
    
    return (
      <div className="relative w-full h-full bg-black">
        <div id="youtube-player-container" className="w-full h-full"></div>
        
        {/* Loading indicator */}
        {!youtubePlayerReady && playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-white">Loading video...</span>
          </div>
        )}
        
        {/* Overlay with message */}
        {playing && selectedAd && (
          <div 
            className="absolute inset-0 pointer-events-auto cursor-not-allowed z-10" 
            onClick={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs rounded px-2 py-1">
              Watch the complete ad to earn {selectedAd.rewardCoins} supercoins
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Load YouTube API script
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT) return;

    // Create YouTube API script
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    
    // Insert the script before the first script tag
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    // Setup callback function to be called when YouTube API loads
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready');
    };
    
    // Cleanup function
    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, []);
  
  // Setup YouTube player event listeners when needed
  const setupYouTubePlayer = () => {
    if (!window.YT || !window.YT.Player) {
      console.warn("YouTube API not loaded yet");
      return;
    }
    
    const videoId = getYoutubeVideoId(selectedAd?.videoUrl || "");
    if (!videoId) return;
    
    try {
      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: playing ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0
        },
        events: {
          onReady: (event: any) => {
            setYoutubePlayerReady(true);
            if (playing) event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            if (event.data === 0) { // Video ended
              handleVideoEnded();
            } else if (event.data === 2 && playing) { // Video paused but should be playing
              event.target.playVideo();
            }
          },
          onError: (event: any) => {
            console.error("YouTube player error:", event);
            setVideoError("Error playing YouTube video. Please try again later.");
            setPlaying(false);
          }
        }
      });
    } catch (error) {
      console.error("Error creating YouTube player:", error);
    }
  };

  // Function to render the video player based on video type
  const renderVideoPlayer = () => {
    if (!selectedAd) return null;
    
    if (videoError) {
      return (
        <div className="flex items-center justify-center h-full w-full text-white bg-black p-4">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <p>{videoError}</p>
            <Button 
              variant="outline" 
              className="mt-4 border-white text-white hover:bg-white/10"
              onClick={handleCloseVideo}
            >
              Close
            </Button>
          </div>
        </div>
      );
    }
    
    // Check if it's a YouTube URL
    if (isYouTubeUrl(selectedAd.videoUrl)) {
      return <YouTubeVideoPlayer />;
    }
    
    // For standard video files
    const resolvedUrl = resolveVideoUrl(selectedAd.videoUrl);
    
    return (
      <>
        <video 
          ref={videoRef}
          className="w-full h-full pointer-events-auto select-none" 
          controls={false}
          autoPlay={playing}
          onEnded={handleVideoEnded}
          poster={selectedAd.thumbnailUrl}
          muted={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          onClick={handleVideoClick}
          onPause={() => playing && videoRef.current?.play()}
        >
          {/* Try MP4 format first as it's most widely supported */}
          <source src={resolvedUrl} type="video/mp4" />
          
          {/* Try other formats if specific extensions are detected */}
          {resolvedUrl.toLowerCase().endsWith('.webm') && (
            <source src={resolvedUrl} type="video/webm" />
          )}
          {resolvedUrl.toLowerCase().endsWith('.ogg') && (
            <source src={resolvedUrl} type="video/ogg" />
          )}
          {resolvedUrl.toLowerCase().endsWith('.mov') && (
            <source src={resolvedUrl} type="video/quicktime" />
          )}
          {resolvedUrl.toLowerCase().endsWith('.m3u8') && (
            <source src={resolvedUrl} type="application/x-mpegURL" />
          )}
          
          {/* Add WebM as fallback format */}
          {!resolvedUrl.toLowerCase().endsWith('.webm') && (
            <source src={resolvedUrl} type="video/webm" />
          )}
          Your browser doesn't support this video format.
        </video>
        {playing && (
          <div 
            className="absolute inset-0 pointer-events-auto cursor-not-allowed" 
            onClick={handleOverlayClick}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs rounded px-2 py-1">
              Watch the complete ad to earn {selectedAd.rewardCoins} supercoins
            </div>
          </div>
        )}
      </>
    );
  };

  // Loading state UI
  if (loading) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading ads...</p>
        </div>
      </UserLayout>
    );
  }

  // Error state UI
  if (error) {
    return (
      <UserLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center py-20">
          <p className="text-gray-500">Please try refreshing the page or check back later.</p>
        </div>
      </UserLayout>
    );
  }

  // Empty state UI
  if (ads.length === 0) {
    return (
      <UserLayout>
        <div className="space-y-6">
          <section>
            <h1 className="text-3xl font-bold mb-2">Watch Ads & Earn</h1>
            <p className="text-gray-600">
              Watch ads to earn supercoins that can be redeemed for rewards
            </p>
          </section>
          
          <div className="text-center py-20">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No ads are currently available.</p>
            <p className="text-gray-500 mt-2">Check back later for new opportunities to earn supercoins!</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header section */}
        <section className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Watch Ads & Earn</h1>
            <p className="text-gray-600">
              Watch ads to earn supercoins that can be redeemed for rewards
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-3 rounded-lg">
              <Coins className="h-6 w-6 text-amber-500" />
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold text-amber-600">{supercoins}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-3 rounded-lg">
              <Coins className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">{totalEarned}</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Video Player Modal */}
        {selectedAd && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl">
              <CardHeader>
                <CardTitle>{selectedAd.title}</CardTitle>
                <CardDescription>
                  Watch the complete ad to earn {selectedAd.rewardCoins} supercoins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                  {renderVideoPlayer()}
                </div>
                
                {!playing && !watchComplete && (
                  <div className="flex justify-center mt-4">
                    <Button 
                      onClick={() => handlePlayAd(selectedAd)}
                      className="gap-2"
                    >
                      <Play className="h-5 w-5" /> Play Ad
                    </Button>
                  </div>
                )}
                
                {watchComplete && !rewarded && (
                  <div className="flex flex-col items-center justify-center mt-4 gap-2">
                    <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                    <p className="text-center font-medium">
                      You've watched the entire ad!
                    </p>
                    <Button 
                      onClick={handleClaimReward} 
                      disabled={processingReward}
                      className="gap-2"
                    >
                      {processingReward ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          <Coins className="h-5 w-5" /> Claim {selectedAd.rewardCoins} Supercoins
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {watchComplete && rewarded && (
                  <div className="flex flex-col items-center justify-center mt-4 gap-2">
                    <div className="bg-green-100 p-4 rounded-lg text-center">
                      <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-green-700">
                        Congratulations!
                      </p>
                      <p className="text-green-600">
                        You've earned {selectedAd.rewardCoins} supercoins
                      </p>
                    </div>
                  </div>
                )}
                
                {videoError && (
                  <div className="mt-4 text-red-500 text-center">
                    {videoError}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleCloseVideo}
                >
                  Close
                </Button>
                {watchComplete && rewarded && (
                  <Button onClick={handleCloseVideo}>
                    Back to Ads
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
        
        {/* Ads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Card key={ad.id || ad._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video relative group">
                <img 
                  src={ad.thumbnailUrl} 
                  alt={ad.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    onClick={() => handlePlayAd(ad)} 
                    className="gap-2"
                  >
                    <Play className="h-5 w-5" /> Watch Ad
                  </Button>
                </div>
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold text-lg truncate">{ad.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 h-10 mb-2">
                  {ad.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Math.floor(ad.duration / 60)}:{String(ad.duration % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200">
                    <Coins className="h-3 w-3" /> {ad.rewardCoins} Supercoins
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default AdsPage;
