import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { 
  fetchAds, 
  createAd, 
  updateAd, 
  deleteAd,
  uploadAdVideo,
  uploadAdThumbnail
} from '@/api';
import useAuthStore from '@/store/authStore';
import { Ad } from '@/types/ad';

const initialFormState = {
  title: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  duration: 0,
  rewardCoins: 0,
  active: true,
};

export const useAdManagement = () => {
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
    defaultValues: initialFormState,
  });

  // Load ads on component mount
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
        form.trigger("thumbnailUrl");
        
        toast({
          title: "Thumbnail uploaded",
          description: "Thumbnail image has been uploaded successfully.",
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
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
  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      
      const adData = {
        ...formData,
        developerId: user?.id,
      };

      let result: Ad;
      if (editAdId) {
        result = await updateAd(editAdId, adData);
        setAds(prev => prev.map(ad => 
          (ad.id || ad._id) === editAdId ? { ...ad, ...result } : ad
        ));
        toast({
          title: "Ad updated",
          description: "Advertisement has been updated successfully.",
        });
      } else {
        result = await createAd(adData);
        setAds(prev => [result, ...prev]);
        toast({
          title: "Ad created",
          description: "Advertisement has been created successfully.",
        });
      }

      handleFormDialogClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save advertisement.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ad deletion
  const handleDelete = async () => {
    if (!deleteAdId) return;

    try {
      await deleteAd(deleteAdId);
      setAds(prev => prev.filter(ad => (ad.id || ad._id) !== deleteAdId));
      setIsDeleteDialogOpen(false);
      setDeleteAdId(null);
      
      toast({
        title: "Ad deleted",
        description: "Advertisement has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting ad",
        description: error.message || "Failed to delete advertisement.",
        variant: "destructive",
      });
    }
  };

  // Open delete dialog
  const openDeleteDialog = (adId: string) => {
    setDeleteAdId(adId);
    setIsDeleteDialogOpen(true);
  };

  // Handle ad preview
  const handlePreview = (ad: Ad) => {
    setPreviewAd(ad);
  };

  return {
    // State
    ads,
    isLoading,
    isSubmitting,
    editAdId,
    isDeleteDialogOpen,
    deleteAdId,
    isFormDialogOpen,
    previewAd,
    videoFile,
    thumbnailFile,
    isUploadingVideo,
    isUploadingThumbnail,
    videoPreview,
    thumbnailPreview,
    form,
    
    // Actions
    openForm,
    handleFormDialogClose,
    handleVideoFileChange,
    handleThumbnailFileChange,
    handleSubmit,
    handleDelete,
    openDeleteDialog,
    handlePreview,
    setIsDeleteDialogOpen,
    setPreviewAd,
  };
};
