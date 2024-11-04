import { NFC_CONSTANTS } from '../constants/nfc';
import type { StationType } from '../types';

export class StationService {
    private stationMap: Map<number, StationType>;

    constructor() {
        this.stationMap = new Map([
            [NFC_CONSTANTS.STATIONS.MOTIJHEEL, 'Motijheel'],
            [NFC_CONSTANTS.STATIONS.SECRETARIAT, 'Bangladesh Secretariat'],
            [NFC_CONSTANTS.STATIONS.DHAKA_UNIVERSITY, 'Dhaka University'],
            [NFC_CONSTANTS.STATIONS.SHAHBAGH, 'Shahbagh'],
            [NFC_CONSTANTS.STATIONS.KARWAN_BAZAR, 'Karwan Bazar'],
            [NFC_CONSTANTS.STATIONS.FARMGATE, 'Farmgate'],
            [NFC_CONSTANTS.STATIONS.BIJOY_SARANI, 'Bijoy Sarani'],
            [NFC_CONSTANTS.STATIONS.AGARGAON, 'Agargaon'],
            [NFC_CONSTANTS.STATIONS.SHEWRAPARA, 'Shewrapara'],
            [NFC_CONSTANTS.STATIONS.KAZIPARA, 'Kazipara'],
            [NFC_CONSTANTS.STATIONS.MIRPUR_10, 'Mirpur 10'],
            [NFC_CONSTANTS.STATIONS.MIRPUR_11, 'Mirpur 11'],
            [NFC_CONSTANTS.STATIONS.PALLABI, 'Pallabi'],
            [NFC_CONSTANTS.STATIONS.UTTARA_SOUTH, 'Uttara South'],
            [NFC_CONSTANTS.STATIONS.UTTARA_CENTER, 'Uttara Center'],
            [NFC_CONSTANTS.STATIONS.UTTARA_NORTH, 'Uttara North']
        ]);
    }

    getStationName(code: number): StationType | string {
        return this.stationMap.get(code) ?? `Unknown Station (${code})`;
    }
}