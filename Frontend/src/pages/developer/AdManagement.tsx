import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import { AdsList } from '@/components/developer/AdsList';
import { AdFormDialog } from '@/components/developer/AdFormDialog';
import { AdPreviewDialog } from '@/components/developer/AdPreviewDialog';
import { DeleteConfirmDialog } from '@/components/developer/DeleteConfirmDialog';
import { useAdManagement } from '@/hooks/useAdManagement';

const AdManagement = () => {
  const {
    // State
    ads,
    isLoading,
    isSubmitting,
    editAdId,
    isDeleteDialogOpen,
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
    onSubmit,
    handleDeleteAd,
    handleToggleActive,
    formatDuration,
    setPreviewAd,
    openDeleteDialog,
    closeDeleteDialog
  } = useAdManagement();

  return (
    <DeveloperLayout>
      <AdsList
        ads={ads}
        isLoading={isLoading}
        onCreateAd={() => openForm()}
        onEditAd={(ad) => openForm(ad)}
        onDeleteAd={openDeleteDialog}
        onPreviewAd={setPreviewAd}
        onToggleActive={handleToggleActive}
        formatDuration={formatDuration}
      />

      <AdFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleFormDialogClose}
        editAdId={editAdId}
        isSubmitting={isSubmitting}
        form={form}
        onSubmit={onSubmit}
        videoFile={videoFile}
        thumbnailFile={thumbnailFile}
        isUploadingVideo={isUploadingVideo}
        isUploadingThumbnail={isUploadingThumbnail}
        videoPreview={videoPreview}
        thumbnailPreview={thumbnailPreview}
        onVideoFileChange={handleVideoFileChange}
        onThumbnailFileChange={handleThumbnailFileChange}
      />

      <AdPreviewDialog
        ad={previewAd}
        isOpen={!!previewAd}
        onClose={() => setPreviewAd(null)}
        formatDuration={formatDuration}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteAd}
        isDeleting={isSubmitting}
      />
    </DeveloperLayout>
  );
};

export default AdManagement;
