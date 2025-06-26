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

const AdsPage = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [supercoins, setSupercoins] = useState<number>(0);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [watchComplete, setWatchComplete] = useState<boolean>(false);
  const [rewarded, setRewarded] = useState<boolean>(false);
  const [processingReward, setProcessingReward] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
        setSupercoins(coins);
      } catch (err: any) {
        setError(err.message || "Failed to load ads. Please try again later.");
        console.error("Error loading ads:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

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
    
    // Reset video if it was already played
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // Handle claiming reward
  const handleClaimReward = async () => {
    if (!selectedAd) return;
    
    try {
      setProcessingReward(true);
      const result = await watchAd(selectedAd.id || selectedAd._id || '');
      
      // Update supercoins
      setSupercoins(result.supercoins);
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
    setSelectedAd(null);
    setPlaying(false);
    setWatchComplete(false);
    setRewarded(false);
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
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-3 rounded-lg">
            <Coins className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-sm text-gray-500">Your Supercoins</p>
              <p className="text-2xl font-bold text-amber-600">{supercoins}</p>
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
                  <video 
                    ref={videoRef}
                    src={selectedAd.videoUrl} 
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
                  />
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
