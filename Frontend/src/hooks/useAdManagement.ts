import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
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
      
      // Prepare the final ad data
      const adData = {
        ...values,
        videoUrl: values.videoUrl,
        thumbnailUrl: values.thumbnailUrl,
        duration: values.duration, 
        videoDetails: videoFile && values.videoUrl.includes(videoFile.name) ? {
          publicId: videoFile.name,
          format: videoFile.type.split('/')[1],
          size: videoFile.size
        } : undefined,
        thumbnailDetails: thumbnailFile && values.thumbnailUrl.includes(thumbnailFile.name) ? {
          publicId: thumbnailFile.name,
          format: thumbnailFile.type.split('/')[1],
          width: 0,
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

  // Handle opening delete dialog
  const openDeleteDialog = (adId: string) => {
    setDeleteAdId(adId);
    setIsDeleteDialogOpen(true);
  };

  // Handle closing delete dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteAdId(null);
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
    user,
    form,
    
    // Actions
    openForm,
    handleFormDialogClose,
    handleVideoFileChange,
    handleThumbnailFileChange,
    onSubmit,
    handleDeleteAd,
    handleToggleActive,
    formatDuration,
    setPreviewAd,
    openDeleteDialog,
    closeDeleteDialog
  };
};
