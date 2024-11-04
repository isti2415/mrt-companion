export const checkNFCSupport = async (): Promise<{ 
    isSupported: boolean; 
    error?: string;
}> => {
    // First check if we're in a browser environment
    if (typeof window === 'undefined') {
        return { 
            isSupported: false, 
            error: 'Not in browser environment' 
        };
    }

    // Check if running on HTTPS or localhost
    const isSecureContext = window.isSecureContext;
    if (!isSecureContext) {
        return { 
            isSupported: false, 
            error: 'NFC requires a secure context (HTTPS or localhost)' 
        };
    }

    // Check for NFC API support
    if (!('NDEFReader' in window)) {
        return { 
            isSupported: false, 
            error: 'NFC not supported in this browser' 
        };
    }

    try {
        // Try to create an NDEFReader instance
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ndef = new NDEFReader();
        
        // Try to get permission
        const permission = await navigator.permissions.query({ name: 'nfc' as PermissionName });
        
        if (permission.state === 'denied') {
            return {
                isSupported: false,
                error: 'NFC permission denied'
            };
        }

        return { isSupported: true };
    } catch (error) {
        return {
            isSupported: false,
            error: error instanceof Error ? error.message : 'Unknown error checking NFC support'
        };
    }
};