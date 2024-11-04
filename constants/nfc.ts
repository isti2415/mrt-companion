export const NFC_CONSTANTS = {
    SERVICE_CODE: 0x220F,
    BLOCK_SIZE: 16,
    DEFAULT_BLOCKS_TO_READ: 10,
    DEFAULT_TIMEOUT: 5000, // 5 seconds
    DEFAULT_RETRY_ATTEMPTS: 3,
    
    STATUS: {
        SUCCESS_FLAG1: 0x00,
        SUCCESS_FLAG2: 0x00
    },
    
    STATIONS: {
        MOTIJHEEL: 10,
        SECRETARIAT: 20,
        DHAKA_UNIVERSITY: 25,
        SHAHBAGH: 30,
        KARWAN_BAZAR: 35,
        FARMGATE: 40,
        BIJOY_SARANI: 45,
        AGARGAON: 50,
        SHEWRAPARA: 55,
        KAZIPARA: 60,
        MIRPUR_10: 65,
        MIRPUR_11: 70,
        PALLABI: 75,
        UTTARA_SOUTH: 80,
        UTTARA_CENTER: 85,
        UTTARA_NORTH: 90
    }
} as const;