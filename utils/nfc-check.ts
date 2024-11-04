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

export const requestNFCPermission = async (): Promise<{ 
    granted: boolean; 
    error?: string 
}> => {
    if (!('NDEFReader' in window)) {
        return {
            granted: false,
            error: 'NFC not supported in this browser'
        };
    }

    try {
        const nfcNavigator = navigator as NFCNavigator;
        
        if (!nfcNavigator.nfc) {
            // Fallback to NDEFReader if specific NFC API is not available
            const ndef = new NDEFReader();
            await ndef.scan();
            return { granted: true };
        }

        const permission = await nfcNavigator.nfc.requestPermission({
            name: 'NFC',
            type: 'nfc-f' // Specifically request FeliCa
        });

        return {
            granted: permission.state === 'granted',
            error: permission.state === 'denied' ? 'NFC permission denied' : undefined
        };
    } catch (error) {
        return {
            granted: false,
            error: error instanceof Error ? error.message : 'Failed to request NFC permission'
        };
    }
};