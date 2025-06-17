import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();  useEffect(() => {    const verifyEmail = async () => {      try {
        // Make sure we have a token
        if (!token) {
          console.error('No token provided in URL');
          setError('No verification token provided');
          setLoading(false);
          return;
        }
        
        console.log(`Verifying token: ${token}`);
        
        // Make sure we're using the correct API URL from environment variables
        // Try multiple ways to get the API URL to ensure it works
        const apiUrl = import.meta.env.VITE_API_URL || 
                      import.meta.env.VITE_API_BASE_URL || 
                      'http://localhost:5000/api';
                      
        console.log(`Using API URL: ${apiUrl}`);
        
        // Use direct URL without relying on environment variables as backup
        const fetchUrl = `${apiUrl}/auth/verify-email/${token}`;
        console.log(`Fetching URL: ${fetchUrl}`);
        
        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add credentials to handle cookies if needed
          credentials: 'include'
        });

        console.log('Verification response status:', response.status);
        
        if (!response.ok) {
          // Try to parse JSON response if available
          try {
            const data = await response.json();
            console.log('Verification error data:', data);
            setError(data.message || `Verification failed with status: ${response.status}`);
          } catch (e) {
            setError(`Verification failed with status: ${response.status}`);
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('Verification successful response:', data);

        if (data.success) {
          setVerified(true);
        } else {
          setError(data.message || 'Verification failed unexpectedly');
        }      } catch (error: any) {
        console.error('Verification error:', error);
        setError(`An error occurred during verification: ${error?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleRedirect = () => {
    navigate(verified ? '/login?verified=true' : '/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center">
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">Email Verification</h2>

          <div className="mt-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <p className="text-lg text-gray-600">Verifying your email...</p>
              </div>
            ) : verified ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Email Verified Successfully!</h3>
                <p className="text-gray-600 text-center">
                  Your email has been verified successfully. You can now log in to your account.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-red-100 rounded-full p-3">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Verification Failed</h3>
                <p className="text-gray-600 text-center">
                  {error || 'The verification link is invalid or has expired.'}
                </p>
                <p className="text-sm text-gray-500">
                  Please try logging in and requesting a new verification link.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <Button onClick={handleRedirect} className="w-full">
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
