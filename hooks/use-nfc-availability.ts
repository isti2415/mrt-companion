import { useState, useEffect } from 'react';
import { checkNFCSupport } from '../utils/nfc-check';

export function useNfcAvailability() {
    const [isAvailable, setIsAvailable] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [permission, setPermission] = useState<PermissionState>('prompt');

    useEffect(() => {
        let mounted = true;

        const checkAvailability = async () => {
            try {
                const { isSupported, error: supportError } = await checkNFCSupport();
                
                if (!mounted) return;

                if (!isSupported) {
                    setIsAvailable(false);
                    setError(supportError || 'NFC not available');
                    return;
                }

                // If supported, try to get permission
                const permissionResult = await navigator.permissions.query({ 
                    name: 'nfc' as PermissionName 
                });
                
                if (!mounted) return;

                setPermission(permissionResult.state);
                setIsAvailable(true);
                setError(null);

                // Listen for permission changes
                permissionResult.addEventListener('change', () => {
                    if (!mounted) return;
                    setPermission(permissionResult.state);
                    setIsAvailable(permissionResult.state === 'granted');
                });

            } catch (err) {
                if (!mounted) return;
                setIsAvailable(false);
                setError(err instanceof Error ? err.message : 'Failed to check NFC availability');
            }
        };

        checkAvailability();

        return () => {
            mounted = false;
        };
    }, []);

    const requestPermission = async () => {
        try {
            const ndef = new NDEFReader();
            await ndef.scan();
            setIsAvailable(true);
            setError(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to get NFC permission');
        }
    };

    return {
        isAvailable,
        error,
        permission,
        requestPermission
    };
}