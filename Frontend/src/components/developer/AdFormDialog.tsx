import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Video } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface AdFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  editAdId: string | null;
  videoPreview: string | null;
  thumbnailPreview: string | null;
  isUploadingVideo: boolean;
  isUploadingThumbnail: boolean;
  onVideoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onThumbnailFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdFormDialog: React.FC<AdFormDialogProps> = ({
  isOpen,
  onClose,
  form,
  onSubmit,
  isSubmitting,
  editAdId,
  videoPreview,
  thumbnailPreview,
  isUploadingVideo,
  isUploadingThumbnail,
  onVideoFileChange,
  onThumbnailFileChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editAdId ? 'Edit Advertisement' : 'Create New Advertisement'}
          </DialogTitle>
          <DialogDescription>
            {editAdId 
              ? 'Update the advertisement details below.'
              : 'Fill in the details to create a new advertisement.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              rules={{ 
                required: "Title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" },
                maxLength: { value: 100, message: "Title must be less than 100 characters" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter advertisement title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              rules={{ 
                required: "Description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" },
                maxLength: { value: 500, message: "Description must be less than 500 characters" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter advertisement description"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Video Upload */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="videoUrl"
                rules={{ required: "Video is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video File</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={onVideoFileChange}
                            disabled={isUploadingVideo}
                            className="flex-1"
                          />
                          {isUploadingVideo && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </div>
                          )}
                        </div>
                        
                        {videoPreview && (
                          <div className="border rounded-lg p-3 bg-muted/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="h-4 w-4" />
                              <span className="text-sm font-medium">Video Preview</span>
                            </div>
                            <video 
                              src={videoPreview} 
                              controls 
                              className="w-full max-w-xs rounded border"
                              style={{ maxHeight: '150px' }}
                            />
                          </div>
                        )}
                        
                        {field.value && !videoPreview && (
                          <div className="text-sm text-green-600">
                            ✓ Video uploaded successfully
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a video file (max 50MB). Supported formats: MP4, WebM, AVI
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thumbnail Upload */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                rules={{ required: "Thumbnail is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={onThumbnailFileChange}
                            disabled={isUploadingThumbnail}
                            className="flex-1"
                          />
                          {isUploadingThumbnail && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </div>
                          )}
                        </div>
                        
                        {thumbnailPreview && (
                          <div className="border rounded-lg p-3 bg-muted/30">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Thumbnail Preview</span>
                            </div>
                            <img 
                              src={thumbnailPreview} 
                              alt="Thumbnail preview"
                              className="w-full max-w-xs rounded border object-cover"
                              style={{ maxHeight: '150px' }}
                            />
                          </div>
                        )}
                        
                        {field.value && !thumbnailPreview && (
                          <div className="text-sm text-green-600">
                            ✓ Thumbnail uploaded successfully
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a thumbnail image (max 5MB). Supported formats: JPG, PNG, WebP
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration and Reward */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                rules={{ 
                  required: "Duration is required",
                  min: { value: 1, message: "Duration must be at least 1 second" },
                  max: { value: 300, message: "Duration must be less than 300 seconds" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rewardCoins"
                rules={{ 
                  required: "Reward coins is required",
                  min: { value: 1, message: "Reward must be at least 1 coin" },
                  max: { value: 100, message: "Reward must be less than 100 coins" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward Coins</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable this advertisement to be shown to users
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploadingVideo || isUploadingThumbnail}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editAdId ? 'Update Advertisement' : 'Create Advertisement'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
