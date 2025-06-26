import { useState, useEffect } from "react";
import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Clock, 
  Play,
  Video,
  Coins, 
  Loader2
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { 
  fetchAds, 
  createAd, 
  updateAd, 
  deleteAd,
  uploadAdVideo,
  uploadAdThumbnail
} from "@/api";
import { Ad } from "@/types/ad";
import useAuthStore from '@/store/authStore';

const initialFormState = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  duration: 30,
  rewardCoins: 5,
  active: true
};

const AdManagement = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editAdId, setEditAdId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  const form = useForm({
    defaultValues: initialFormState
  });

  // Load ads
  useEffect(() => {
    const loadAds = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAds();
        
        if (data && data.length > 0) {
          setAds(data);
        } else {
          setAds([]);
        }
      } catch (error) {
        toast({
          title: "Error loading ads",
          description: "Failed to load ads. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAds();
  }, []);

  // Open form for creating/editing
  const openForm = (ad: Ad | null = null) => {
    // Reset file state
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
    
    if (ad) {
      // For edit mode
      setEditAdId(ad.id || ad._id || '');
      form.reset({
        title: ad.title,
        description: ad.description,
        videoUrl: ad.videoUrl,
        thumbnailUrl: ad.thumbnailUrl,
        duration: ad.duration,
        rewardCoins: ad.rewardCoins,
        active: ad.active
      });
      
      // Clear any validation errors
      form.clearErrors();
    } else {
      // For create mode
      setEditAdId(null);
      form.reset(initialFormState);
      form.clearErrors();
    }
    setIsFormDialogOpen(true);
  };
  
  // Handle form dialog close
  const handleFormDialogClose = () => {
    // Clean up resources
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
    setIsFormDialogOpen(false);
  };



  // Handle video file selection
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Video file size must be less than 50MB.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }
    
    setVideoFile(file);
    
    // Create a preview URL
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    
    // Upload the file immediately
    try {
      setIsUploadingVideo(true);
      const result = await uploadAdVideo(file);
      
      if (result && result.videoUrl) {
        form.setValue("videoUrl", result.videoUrl);
        // Trigger validation to clear any errors
        form.trigger("videoUrl");
        
        toast({
          title: "Video uploaded",
          description: "Video file has been uploaded successfully.",
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      // Clear the file input
      e.target.value = "";
      
      toast({
        title: "Error uploading video",
        description: error.message || "Failed to upload video file.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Thumbnail image size must be less than 5MB.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WEBP).",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }
    
    setThumbnailFile(file);
    
    // Create a preview URL
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
    
    // Upload the file immediately
    try {
      setIsUploadingThumbnail(true);
      const result = await uploadAdThumbnail(file);
      
      if (result && result.thumbnailUrl) {
        form.setValue("thumbnailUrl", result.thumbnailUrl);
        // Trigger validation to clear any errors
        form.trigger("thumbnailUrl");
        
        toast({
          title: "Thumbnail uploaded",
          description: "Thumbnail image has been uploaded successfully.",
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      // Clear the file input
      e.target.value = "";
      
      toast({
        title: "Error uploading thumbnail",
        description: error.message || "Failed to upload thumbnail image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      // We no longer need to upload files here since they're uploaded as soon as selected
      // But we do need to make sure the URL fields are still valid
      
      // Check if form values match what we have in our file state
      // If they don't, it means the user edited the URL field after uploading a file
      // In that case, we prioritize what's in the form
      
      // Prepare the final ad data
      const adData = {
        ...values,
        // Get URLs from the form values, which contain either manually entered URLs
        // or URLs set by our upload functions
        videoUrl: values.videoUrl,
        thumbnailUrl: values.thumbnailUrl,
        // Use the duration from the form
        duration: values.duration, 
        // Include file details if we have them from uploads that match the current URLs
        videoDetails: videoFile && values.videoUrl.includes(videoFile.name) ? {
          publicId: videoFile.name,
          format: videoFile.type.split('/')[1],
          size: videoFile.size
        } : undefined,
        thumbnailDetails: thumbnailFile && values.thumbnailUrl.includes(thumbnailFile.name) ? {
          publicId: thumbnailFile.name,
          format: thumbnailFile.type.split('/')[1],
          width: 0, // These will be set by Cloudinary
          height: 0
        } : undefined
      };
      
      let result: Ad;
      if (editAdId) {
        // Update existing ad
        result = await updateAd(editAdId, adData);
        toast({
          title: "Ad updated",
          description: "Ad has been updated successfully.",
        });
        // Update local state
        setAds(prev => prev.map(p => p.id === editAdId || p._id === editAdId ? result : p));
      } else {
        // Create new ad
        result = await createAd(adData);
        toast({
          title: "Ad created",
          description: "New ad has been created successfully.",
        });
        // Update local state
        setAds(prev => [...prev, result]);
      }

      // Reset form state
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview(null);
      setThumbnailPreview(null);
      setIsFormDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteAd = async () => {
    if (!deleteAdId) return;
    
    try {
      setIsSubmitting(true);
      await deleteAd(deleteAdId);
      
      toast({
        title: "Ad deleted",
        description: "Ad has been deleted successfully.",
      });
      
      // Update local state
      setAds(prev => prev.filter(p => p.id !== deleteAdId && p._id !== deleteAdId));
      setIsDeleteDialogOpen(false);
      setDeleteAdId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggling active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await updateAd(id, { active: newStatus });
      
      // Update local state
      setAds(prev => 
        prev.map(ad => (ad.id === id || ad._id === id) ? { ...ad, active: newStatus } : ad)
      );
      
      toast({
        title: `Ad ${newStatus ? "activated" : "deactivated"}`,
        description: `Ad has been ${newStatus ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Failed to update ad status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format time in MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manage Ads</h1>
            <p className="text-gray-500 mt-1">
              Create and manage ads for users to watch and earn supercoins
            </p>
          </div>
          <Button 
            onClick={() => openForm()} 
            className="bg-primary hover:bg-primary-600"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Ad
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ad List</CardTitle>
            <CardDescription>
              Manage all ads available for users to watch
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full"></div>
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No ads found</p>
                <Button 
                  onClick={() => openForm()} 
                  variant="outline"
                >
                  Add your first ad
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map((ad) => (
                      <TableRow key={ad.id || ad._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <img
                              src={ad.thumbnailUrl}
                              alt={ad.title}
                              className="h-10 w-16 mr-3 rounded object-cover"
                              onError={(e) => {
                                // Set a fallback image if the ad image fails to load
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                            <div>
                              <p className="font-medium">{ad.title}</p>
                              <p className="text-xs text-gray-500 truncate max-w-xs">
                                {ad.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{formatDuration(ad.duration)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-amber-600">
                            <Coins className="h-4 w-4 mr-1" />
                            <span>{ad.rewardCoins} coins</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{ad.viewCount || 0} views</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={ad.active}
                            onCheckedChange={() => handleToggleActive(ad.id || ad._id || '', ad.active)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewAd(ad)}
                              className="text-blue-500"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openForm(ad)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteAdId(ad.id || ad._id || '');
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ad Preview Dialog */}
      {previewAd && (
        <Dialog open={!!previewAd} onOpenChange={() => setPreviewAd(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{previewAd.title}</DialogTitle>
              <DialogDescription>
                {previewAd.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="aspect-video bg-black rounded-md overflow-hidden">
              <video 
                src={previewAd.videoUrl} 
                className="w-full h-full" 
                controls 
                poster={previewAd.thumbnailUrl} 
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-500">{formatDuration(previewAd.duration)}</span>
              </div>
              <div className="flex items-center text-amber-600">
                <Coins className="h-4 w-4 mr-1" />
                <span>{previewAd.rewardCoins} coins reward</span>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewAd(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Ad Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={handleFormDialogClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editAdId ? "Edit Ad" : "Add New Ad"}
            </DialogTitle>
            <DialogDescription>
              {editAdId 
                ? "Update the ad details below" 
                : "Fill in the details for the new ad"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                rules={{ required: "Ad title is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ad title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Ad description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter ad description"
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                rules={{ 
                  validate: {
                    required: value => {
                      return (value && value.trim() !== '') || videoFile !== null || "Video URL or file upload is required";
                    },
                    validUrl: value => {
                      if (!value || value.trim() === '') return true;
                      try {
                        new URL(value);
                        return true;
                      } catch (e) {
                        return "Please enter a valid URL";
                      }
                    }
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Video URL input */}
                        <Input 
                          placeholder="https://example.com/video.mp4" 
                          {...field}
                          disabled={isUploadingVideo} 
                        />
                        
                        {/* Video file upload */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoFileChange}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100"
                              disabled={isUploadingVideo}
                            />
                            {isUploadingVideo && (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            )}
                          </div>
                          
                          {/* Video preview */}
                          {videoPreview && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500 mb-2">Preview:</p>
                              <div className="aspect-video max-h-[200px] bg-black rounded overflow-hidden">
                                <video 
                                  src={videoPreview} 
                                  className="w-full h-full object-contain" 
                                  controls 
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {videoFile?.name} ({videoFile ? Math.round(videoFile.size / 1024) : 0} KB)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter a URL directly or upload a video file (MP4 recommended)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnailUrl"
                rules={{ 
                  validate: {
                    required: value => {
                      return (value && value.trim() !== '') || thumbnailFile !== null || "Thumbnail URL or file upload is required";
                    },
                    validUrl: value => {
                      if (!value || value.trim() === '') return true;
                      try {
                        new URL(value);
                        return true;
                      } catch (e) {
                        return "Please enter a valid URL";
                      }
                    }
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Thumbnail URL input */}
                        <Input 
                          placeholder="https://example.com/thumbnail.jpg" 
                          {...field}
                          disabled={isUploadingThumbnail} 
                        />
                        
                        {/* Thumbnail file upload */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailFileChange}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100"
                              disabled={isUploadingThumbnail}
                            />
                            {isUploadingThumbnail && (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            )}
                          </div>
                          
                          {/* Thumbnail preview */}
                          {thumbnailPreview && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500 mb-2">Preview:</p>
                              <div className="h-[100px] bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={thumbnailPreview} 
                                  alt="Thumbnail preview" 
                                  className="w-full h-full object-contain" 
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {thumbnailFile?.name} ({thumbnailFile ? Math.round(thumbnailFile.size / 1024) : 0} KB)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter a URL directly or upload an image file for the ad thumbnail
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  rules={{ required: "Duration is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          step="1"
                          placeholder="30" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rewardCoins"
                  rules={{ required: "Reward coins amount is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward Coins</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          step="1"
                          placeholder="5" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Status
                      </FormLabel>
                      <FormDescription>
                        When active, users can view this ad and earn rewards.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      {editAdId ? "Update Ad" : "Create Ad"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Ad</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ad? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteAdId(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteAd();
              }}
              disabled={isSubmitting}
              className="z-50 ml-2"
            >
              {isSubmitting ? (
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DeveloperLayout>
  );
};

export default AdManagement;
