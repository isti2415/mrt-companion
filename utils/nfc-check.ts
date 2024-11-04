export const checkNFCSupport = (): boolean => {
    return 'NDEFReader' in window;
};

export const checkNFCPermission = async (): Promise<PermissionState> => {
    try {
        const permission = await navigator.permissions.query({ name: 'nfc' as PermissionName });
        return permission.state;
    } catch {
        return 'denied';
    }
};