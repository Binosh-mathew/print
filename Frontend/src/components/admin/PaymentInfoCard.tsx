import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Info } from 'lucide-react';

export const PaymentInfoCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <CreditCard className="mr-2 h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="rounded-full bg-primary-100 p-2 text-primary mr-3">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium">Online Payment Gateway</h4>
              <p className="text-sm text-gray-600 mt-1">
                All payments are processed securely through our integrated Google Pay / UPI gateway.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="rounded-md bg-yellow-50 p-4 text-sm flex">
            <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
            <p className="text-yellow-700">
              Note: When you update pricing, it will affect all new orders. Existing orders will maintain their original pricing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
