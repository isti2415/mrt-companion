// hooks/use-nfc-availability.ts
import { useState, useEffect, useCallback } from 'react';

interface NFCAvailabilityResult {
    isAvailable: boolean;
    permission: PermissionState;
    error: string | null;
    requestPermission: () => Promise<void>;
}

export function useNfcAvailability(): NFCAvailabilityResult {
    const [isAvailable, setIsAvailable] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [permission, setPermission] = useState<PermissionState>('prompt');

    // Check NFC availability and permission
    useEffect(() => {
        let mounted = true;

        const checkAvailability = async () => {
            // Check if we're in a secure context
            if (typeof window !== 'undefined' && !window.isSecureContext) {
                setError('NFC requires a secure context (HTTPS)');
                return;
            }

            // Check for NFC support
            if (!('NDEFReader' in window)) {
                setError('NFC is not supported on this device');
                return;
            }

            try {
                const permissionStatus = await navigator.permissions.query({ 
                    name: 'nfc' as PermissionName 
                });

                if (!mounted) return;

                setPermission(permissionStatus.state);
                setIsAvailable(permissionStatus.state === 'granted');

                // Listen for permission changes
                permissionStatus.addEventListener('change', () => {
                    if (!mounted) return;
                    setPermission(permissionStatus.state);
                    setIsAvailable(permissionStatus.state === 'granted');
                });

            } catch (err) {
                if (!mounted) return;
                setError('Failed to check NFC availability');
                console.error('NFC availability error:', err);
            }
        };

        checkAvailability();

        return () => {
            mounted = false;
        };
    }, []);

    const requestPermission = useCallback(async () => {
        try {
            // Request NFC permissions with specific technologies
            if ('NDEFReader' in window) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const nfc = (window as any).navigator.nfc;
                if (nfc?.requestPermission) {
                    await nfc.requestPermission({ name: "NFC", type: "nfc-f" });
                } else {
                    // Fallback to standard NDEFReader permission request
                    const ndef = new NDEFReader();
                    await ndef.scan();
                }
                setIsAvailable(true);
                setError(null);
            }
        } catch (error) {
            setError('Failed to get NFC permission');
            console.error('NFC permission error:', error);
        }
    }, []);

    return {
        isAvailable,
        permission,
        error,
        requestPermission
    };
}