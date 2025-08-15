import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Coins
} from "lucide-react";
import { Ad } from "@/types/ad";

interface AdsListProps {
  ads: Ad[];
  isLoading: boolean;
  onCreateAd: () => void;
  onEditAd: (ad: Ad) => void;
  onDeleteAd: (adId: string) => void;
  onPreviewAd: (ad: Ad) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  formatDuration: (seconds: number) => string;
}

export const AdsList = ({
  ads,
  isLoading,
  onCreateAd,
  onEditAd,
  onDeleteAd,
  onPreviewAd,
  onToggleActive,
  formatDuration
}: AdsListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Ads</h1>
          <p className="text-gray-500 mt-1">
            Create and manage ads for users to watch and earn supercoins
          </p>
        </div>
        <Button 
          onClick={onCreateAd}
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
                onClick={onCreateAd}
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
                          onCheckedChange={() => onToggleActive(ad.id || ad._id || '', ad.active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPreviewAd(ad)}
                            className="text-blue-500"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditAd(ad)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteAd(ad.id || ad._id || '')}
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
  );
};
