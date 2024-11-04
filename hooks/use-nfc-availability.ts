import { useState, useEffect } from 'react';
import { checkNFCSupport, checkNFCPermission } from '../utils/nfc-check';

export function useNfcAvailability() {
    const [isAvailable, setIsAvailable] = useState<boolean>(false);
    const [permission, setPermission] = useState<PermissionState>('prompt');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAvailability = async () => {
            try {
                // Check if NFC is supported
                const supported = checkNFCSupport();
                if (!supported) {
                    setError('NFC is not supported on this device');
                    setIsAvailable(false);
                    return;
                }

                // Check permission
                const permissionState = await checkNFCPermission();
                setPermission(permissionState);
                setIsAvailable(permissionState === 'granted');

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to check NFC availability');
                setIsAvailable(false);
            }
        };

        checkAvailability();
    }, []);

    return { isAvailable, permission, error };
}