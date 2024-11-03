export interface Station {
    id: number;
    nameEn: string;
    nameBn: string;
    code: number;
    lineNumber: number;
    latitude: number;
    longitude: number;
    isActive: boolean;
  }
  
  export const MRT_STATIONS: Station[] = [
    {
      id: 1,
      nameEn: "Uttara North",
      nameBn: "উত্তরা উত্তর",
      code: 95,
      lineNumber: 6,
      latitude: 23.8766,
      longitude: 90.3973,
      isActive: true
    },
    {
      id: 2,
      nameEn: "Uttara Center",
      nameBn: "উত্তরা সেন্টার",
      code: 85,
      lineNumber: 6,
      latitude: 23.8687,
      longitude: 90.3957,
      isActive: true
    },
    {
      id: 3,
      nameEn: "Uttara South",
      nameBn: "উত্তরা দক্ষিণ",
      code: 80,
      lineNumber: 6,
      latitude: 23.8601,
      longitude: 90.3947,
      isActive: true
    },
    {
      id: 4,
      nameEn: "Pallabi",
      nameBn: "পল্লবী",
      code: 75,
      lineNumber: 6,
      latitude: 23.8519,
      longitude: 90.3766,
      isActive: true
    },
    {
      id: 5,
      nameEn: "Mirpur 11",
      nameBn: "মিরপুর ১১",
      code: 70,
      lineNumber: 6,
      latitude: 23.8407,
      longitude: 90.3745,
      isActive: true
    },
    {
      id: 6,
      nameEn: "Mirpur 10",
      nameBn: "মিরপুর ১০",
      code: 65,
      lineNumber: 6,
      latitude: 23.8307,
      longitude: 90.3722,
      isActive: true
    },
    {
      id: 7,
      nameEn: "Kazipara",
      nameBn: "কাজীপাড়া",
      code: 60,
      lineNumber: 6,
      latitude: 23.8236,
      longitude: 90.3722,
      isActive: true
    },
    {
      id: 8,
      nameEn: "Shewrapara",
      nameBn: "শেওড়াপাড়া",
      code: 55,
      lineNumber: 6,
      latitude: 23.8139,
      longitude: 90.3722,
      isActive: true
    },
    {
      id: 9,
      nameEn: "Agargaon",
      nameBn: "আগারগাঁও",
      code: 50,
      lineNumber: 6,
      latitude: 23.7781,
      longitude: 90.3788,
      isActive: true
    },
    {
      id: 10,
      nameEn: "Bijoy Sarani",
      nameBn: "বিজয় সরণি",
      code: 45,
      lineNumber: 6,
      latitude: 23.7641,
      longitude: 90.3891,
      isActive: true
    },
    {
      id: 11,
      nameEn: "Farmgate",
      nameBn: "ফার্মগেট",
      code: 40,
      lineNumber: 6,
      latitude: 23.7573,
      longitude: 90.3911,
      isActive: true
    },
    {
      id: 12,
      nameEn: "Karwan Bazar",
      nameBn: "কারওয়ান বাজার",
      code: 35,
      lineNumber: 6,
      latitude: 23.7507,
      longitude: 90.3934,
      isActive: true
    },
    {
      id: 13,
      nameEn: "Shahbag",
      nameBn: "শাহবাগ",
      code: 30,
      lineNumber: 6,
      latitude: 23.7388,
      longitude: 90.3955,
      isActive: true
    },
    {
      id: 14,
      nameEn: "Dhaka University",
      nameBn: "ঢাকা বিশ্ববিদ্যালয়",
      code: 25,
      lineNumber: 6,
      latitude: 23.7334,
      longitude: 90.3966,
      isActive: false
    },
    {
      id: 15,
      nameEn: "Bangladesh Bank",
      nameBn: "বাংলাদেশ ব্যাংক",
      code: 20,
      lineNumber: 6,
      latitude: 23.7285,
      longitude: 90.4088,
      isActive: false
    },
    {
      id: 16,
      nameEn: "Motijheel",
      nameBn: "মতিঝিল",
      code: 10,
      lineNumber: 6,
      latitude: 23.7233,
      longitude: 90.4177,
      isActive: true
    }
  ];