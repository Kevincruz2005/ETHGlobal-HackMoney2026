import { useState } from 'react';
import axios from 'axios';

/**
 * usePinataUpload - Hook for uploading videos to Pinata IPFS
 * 
 * Features:
 * - Real-time upload progress tracking
 * - Metadata attachment (name, description, price, duration)
 * - Error handling
 * - Returns IPFS hash and gateway URLs
 */

interface UploadMetadata {
    name: string;
    description?: string;
    price?: string;
    duration?: number;
}

interface UploadResult {
    ipfsHash: string;
    pinataUrl: string;
    gatewayUrl: string;
    timestamp: string;
    name: string;
}

interface UsePinataUploadReturn {
    uploadVideo: (file: File, metadata: UploadMetadata) => Promise<UploadResult | null>;
    progress: number;
    isUploading: boolean;
    error: string | null;
    result: UploadResult | null;
    reset: () => void;
}

export const usePinataUpload = (): UsePinataUploadReturn => {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<UploadResult | null>(null);

    const uploadVideo = async (
        file: File,
        metadata: UploadMetadata
    ): Promise<UploadResult | null> => {
        setIsUploading(true);
        setProgress(0);
        setError(null);
        setResult(null);

        try {
            // Validate JWT
            const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
            if (!jwt) {
                throw new Error('Pinata JWT not configured');
            }

            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Add Pinata metadata
            const pinataMetadata = JSON.stringify({
                name: metadata.name,
                keyvalues: {
                    description: metadata.description || '',
                    price: metadata.price || '0.00001',
                    duration: metadata.duration?.toString() || '0',
                    uploadedAt: new Date().toISOString(),
                    platform: 'NitroGate',
                },
            });
            formData.append('pinataMetadata', pinataMetadata);

            // Pinata options (optional)
            const pinataOptions = JSON.stringify({
                cidVersion: 1,
            });
            formData.append('pinataOptions', pinataOptions);

            console.log('[Pinata] Starting upload:', metadata.name);

            // Upload to Pinata
            const uploadResponse = await axios.post(
                'https://api.pinata.cloud/pinning/pinFileToIPFS',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setProgress(percentCompleted);
                            console.log('[Pinata] Upload progress:', percentCompleted + '%');
                        }
                    },
                }
            );

            const ipfsHash = uploadResponse.data.IpfsHash;
            console.log('[Pinata] Upload complete! IPFS Hash:', ipfsHash);

            const uploadResult: UploadResult = {
                ipfsHash,
                pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                gatewayUrl: `https://ipfs.io/ipfs/${ipfsHash}`,
                timestamp: new Date().toISOString(),
                name: metadata.name,
            };

            setResult(uploadResult);
            setIsUploading(false);
            setProgress(100);
            return uploadResult;

        } catch (err: any) {
            console.error('[Pinata] Upload error:', err);

            let errorMessage = 'Upload failed';
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setIsUploading(false);
            setProgress(0);
            return null;
        }
    };

    const reset = () => {
        setProgress(0);
        setIsUploading(false);
        setError(null);
        setResult(null);
    };

    return {
        uploadVideo,
        progress,
        isUploading,
        error,
        result,
        reset,
    };
};
