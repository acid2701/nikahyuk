export interface RundownPresetItem {
  sort_order: number;
  time_start: string;
  time_end: string;
  activity_title: string;
  pic_name: string;
  contingency_plan?: string;
  cue_type?: "audio" | "lighting" | "mic" | "custom";
  cue_notes?: string;
}

export interface RundownPreset {
  id: string;
  name: string;
  description: string;
  items: RundownPresetItem[];
}

export const RUNDOWN_PRESETS: RundownPreset[] = [
  {
    id: "akad_nikah_std",
    name: "Akad Nikah Standar (6 Sesi Sakral)",
    description: "Prosesi sakral akad nikah lengkap dengan ijab kabul & penyerahan mahar.",
    items: [
      {
        sort_order: 1,
        time_start: "08:00",
        time_end: "08:30",
        activity_title: "Persiapan & Final Check WO & MUA",
        pic_name: "Tim WO & MUA",
        contingency_plan: "Apabila MUA terlambat, tim WO membantu penyiapan aksesoris busana.",
      },
      {
        sort_order: 2,
        time_start: "08:30",
        time_end: "09:00",
        activity_title: "Kedatangan Pengantin Pria & Rombongan Keluarga",
        pic_name: "Keluarga Pria",
        contingency_plan: "Penerima tamu menyambut di selasar ballroom.",
      },
      {
        sort_order: 3,
        time_start: "09:00",
        time_end: "09:45",
        activity_title: "Prosesi Ijab Kabul & Pembacaan Shighat Ta'lik",
        pic_name: "Penghulu, Wali, Pria",
        contingency_plan: "Siapkan mik cadangan & sound system darurat.",
        cue_type: "mic",
        cue_notes: "Mic 1: Penghulu, Mic 2: Pengantin Pria, Mic 3: Wali",
      },
      {
        sort_order: 4,
        time_start: "09:45",
        time_end: "10:15",
        activity_title: "Penyerahan Mahar & Pemasangan Cincin",
        pic_name: "Kedua Pengantin",
        contingency_plan: "Fotografer siap di meja akad.",
        cue_type: "audio",
        cue_notes: "Instrumental romantis",
      },
      {
        sort_order: 5,
        time_start: "10:15",
        time_end: "10:45",
        activity_title: "Sungkeman kepada Kedua Orang Tua & Mertua",
        pic_name: "Tim WO & Pengantin",
        contingency_plan: "Siapkan tisu & pemandu sungkeman.",
        cue_type: "audio",
        cue_notes: "Lagu Sungkeman lembut",
      },
      {
        sort_order: 6,
        time_start: "10:45",
        time_end: "11:30",
        activity_title: "Foto Bersama Keluarga Inti Akad",
        pic_name: "Tim Foto / WO",
        contingency_plan: "WO memanggil daftar keluarga sesuai urutan.",
      },
    ],
  },
  {
    id: "resepsi_kirab",
    name: "Resepsi Pernikahan (Kirab & Ramah Tamah)",
    description: "Prosesi resepsi pernikahan modern dengan kirab pengantin & ucapan selamat.",
    items: [
      {
        sort_order: 1,
        time_start: "11:30",
        time_end: "12:00",
        activity_title: "Persiapan Kirab & Open Gate Ballroom",
        pic_name: "Tim WO",
        contingency_plan: "Layar backdrop & lighting dimatikan sementara.",
      },
      {
        sort_order: 2,
        time_start: "12:00",
        time_end: "12:20",
        activity_title: "Processional Kirab Pengantin & Orang Tua",
        pic_name: "Tim WO & MC",
        contingency_plan: "Penerima tamu menahan arus tamu masuk saat kirab berlangsung.",
        cue_type: "audio",
        cue_notes: "Play Backing Track Kirab Agung",
      },
      {
        sort_order: 3,
        time_start: "12:20",
        time_end: "12:30",
        activity_title: "Sambutan Selamat Datang & Doa",
        pic_name: "Wakil Keluarga",
        contingency_plan: "MC memandu pembacaan doa.",
        cue_type: "mic",
        cue_notes: "Mic Podium Utama",
      },
      {
        sort_order: 4,
        time_start: "12:30",
        time_end: "14:00",
        activity_title: "Ramah Tamah, Santap Siang & Foto Selamat",
        pic_name: "Semua Tim WO & Catering",
        contingency_plan: "Catering memantau refill prasmanan secara berkala.",
      },
    ],
  },
];

export interface EventStarterPreset {
  name: string;
  side: "groom" | "bride" | "joint";
  description: string;
}

export const EVENT_STARTER_PRESETS: EventStarterPreset[] = [
  { name: "Lamaran & Tunangan", side: "joint", description: "Acara perkenalan & penyerahan hantaran keluarga." },
  { name: "Pengajian Pre-Wedding", side: "joint", description: "Doa bersama & pembacaan ayat suci Al-Qur'an." },
  { name: "Siraman & Sungkeman Adat", side: "bride", description: "Prosesi pembersihan diri & mohon doa restu orang tua." },
  { name: "Malam Midodareni", side: "bride", description: "Malam persiapan sebelum akad nikah." },
  { name: "Akad Nikah Sakral", side: "joint", description: "Prosesi ijab kabul & penyerahan mahar." },
  { name: "Resepsi Utama (Joint)", side: "joint", description: "Pesta perayaan bersama kedua keluarga mempelai." },
  { name: "Resepsi Pria (Groom Side)", side: "groom", description: "Resepsi ngunduh mantu keluarga pengantin pria." },
  { name: "Resepsi Wanita (Bride Side)", side: "bride", description: "Resepsi keluarga pengantin wanita." },
];

export interface BudgetPresetCategory {
  name: string;
  ratioPercentage: number;
}

export const BUDGET_STARTER_PRESETS: BudgetPresetCategory[] = [
  { name: "Venue & Catering", ratioPercentage: 45 },
  { name: "Dekorasi & Florist", ratioPercentage: 15 },
  { name: "Busana & MUA (Make Up Artist)", ratioPercentage: 12 },
  { name: "Dokumentasi Foto & Video", ratioPercentage: 10 },
  { name: "Hiburan Band & MC", ratioPercentage: 5 },
  { name: "Souvenir & Undangan", ratioPercentage: 5 },
  { name: "Dana Cadangan Darurat", ratioPercentage: 8 },
];

export interface BudgetStarterItem {
  itemName: string;
  categoryName: string;
  ratioPercentage: number;
  payer: "groom" | "bride" | "joint";
  notes: string;
}

export const BUDGET_STARTER_ITEMS: BudgetStarterItem[] = [
  {
    categoryName: "Venue & Catering",
    itemName: "Sewa Gedung / Ballroom Utama",
    ratioPercentage: 15,
    payer: "joint",
    notes: "Termasuk biaya sewa ballroom, AC, dan fasilitas dasar.",
  },
  {
    categoryName: "Venue & Catering",
    itemName: "Paket Catering Prasmanan & Stall Makanan",
    ratioPercentage: 30,
    payer: "joint",
    notes: "Porsi makanan prasmanan utama + gubuk makanan gubukan.",
  },
  {
    categoryName: "Dekorasi & Florist",
    itemName: "Dekorasi Pelaminan, Photobooth & Fresh Flower",
    ratioPercentage: 15,
    payer: "joint",
    notes: "Dekorasi panggung pelaminan, walkway, dan lorong masuk.",
  },
  {
    categoryName: "Busana & MUA",
    itemName: "MUA Pengantin (Akad & Resepsi) + Touch Up",
    ratioPercentage: 6,
    payer: "bride",
    notes: "Rias pengantin wanita & touch up selama resepsi.",
  },
  {
    categoryName: "Busana & MUA",
    itemName: "Sewa Busana Pengantin & Orang Tua",
    ratioPercentage: 6,
    payer: "joint",
    notes: "Busana akad & resepsi pasang pengantin + seragam keluarga inti.",
  },
  {
    categoryName: "Dokumentasi Foto & Video",
    itemName: "Foto Liputan, Cinematic Video & Album Cetak",
    ratioPercentage: 10,
    payer: "joint",
    notes: "Tim fotografer + videografer full day + album magz.",
  },
  {
    categoryName: "Hiburan & MC",
    itemName: "MC Acara Akad/Resepsi & Music Performance",
    ratioPercentage: 5,
    payer: "joint",
    notes: "Pembawa acara profesional & sound system.",
  },
  {
    categoryName: "Souvenir & Undangan",
    itemName: "Cetak Undangan, Souvenir & Hantaran",
    ratioPercentage: 5,
    payer: "joint",
    notes: "Undangan fisik/digital, souvenir tamu, dan hantaran.",
  },
  {
    categoryName: "Operasional & Emergency",
    itemName: "Biaya KUA, Kebersihan Gedung & Dana Cadangan",
    ratioPercentage: 8,
    payer: "groom",
    notes: "Administrasi KUA, tim medis, dan dana darurat.",
  },
];

export interface ChecklistPresetItem {
  category: "kua" | "seserahan" | "lamaran" | "emergency";
  item_name: string;
  notes?: string;
}

export const PREWEDDING_CHECKLIST_PRESETS: ChecklistPresetItem[] = [
  { category: "kua", item_name: "Surat Pengantar Nikah dari RT / RW", notes: "Minta ke ketua RT dan RW setempat" },
  { category: "kua", item_name: "Surat Keterangan Nikah Kelurahan (Form N1, N2, N4)", notes: "Bawa pengantar RT/RW ke kantor Kelurahan" },
  { category: "kua", item_name: "Surat Rekomendasi Numpang Nikah dari KUA Domisili", notes: "Diperlukan jika lokasi akad di luar kecamatan tempat tinggal" },
  { category: "kua", item_name: "Fotokopi KTP & KK Pasangan dan Orang Tua", notes: "Siapkan 3 rangkap" },
  { category: "kua", item_name: "Pasfoto Latar Belakang Biru (2x3 4 lembar & 4x6 2 lembar)", notes: "Busana rapi berkerah" },
  { category: "kua", item_name: "Fotokopi Akta Kelahiran & Ijazah Terakhir", notes: "Untuk verifikasi ejaan nama" },
  { category: "kua", item_name: "Sertifikat Elsimil / Imunisasi TT Puskesmas", notes: "Pemeriksaan kesehatan calon pengantin di Puskesmas" },
  { category: "kua", item_name: "Bukti Setor PNBP KUA (Rp 600.000 di luar KUA)", notes: "Bayar via Bank / Bank Transfer resmi" },

  { category: "lamaran", item_name: "Penetapan Tanggal & Waktu Acara Lamaran", notes: "Diskusi keluarga besar" },
  { category: "lamaran", item_name: "Cincin Tunangan / Cincin Pengikat", notes: "Siapkan sepasang cincin" },
  { category: "lamaran", item_name: "Catering & Menu Konsumsi Keluarga", notes: "Menu makan siang / makan malam" },
  { category: "lamaran", item_name: "Dekorasi Backdrop Lamaran & Welcome Board", notes: "Inisial nama pasangan" },
  { category: "lamaran", item_name: "MUA & Busana Sarimbit / Batik Couple", notes: "Seragam warna senada" },
  { category: "lamaran", item_name: "Fotografer Liputan Acara Lamaran", notes: "Dokumentasi momen tunangan" },
  { category: "lamaran", item_name: "Teks Sambutan Juru Bicara Keluarga", notes: "Perwakilan keluarga pria & wanita" },

  { category: "emergency", item_name: "Cincin Nikah & Kotak Cincin (Pegang PIC WO)", notes: "Jangan sampai tertinggal" },
  { category: "emergency", item_name: "Berkas KTP & Bukti Setor PNBP KUA", notes: "Diserahkan ke Penghulu" },
  { category: "emergency", item_name: "Uang Mahar & Mas Kawin", notes: "Uang tunai / logam mulia" },
  { category: "emergency", item_name: "Emergency Kit MUA (Tisu, Jarum Pentul, Peniti, Softlens)", notes: "Pegang pembantu MUA / WO" },
];

export interface SeserahanItemPreset {
  box_name: string;
  item_name: string;
  estimated_price?: number;
  purchase_url?: string;
  notes?: string;
}

export const PREWEDDING_SESERAHAN_PRESETS: SeserahanItemPreset[] = [
  // Kotak 1: Set Perlengkapan Ibadah
  {
    box_name: "Kotak 1: Set Perlengkapan Ibadah",
    item_name: "Mukena Silk / Telekung Sholat Premium",
    estimated_price: 450000,
    purchase_url: "https://shopee.co.id/search?keyword=mukena+silk+premium",
    notes: "Bahan silk lembut berenda bordir eksklusif",
  },
  {
    box_name: "Kotak 1: Set Perlengkapan Ibadah",
    item_name: "Sajadah Busa / Velour Empuk Premium",
    estimated_price: 200000,
    purchase_url: "https://tokopedia.com/search?q=sajadah+busa+premium",
    notes: "Warna matching dengan mukena",
  },
  {
    box_name: "Kotak 1: Set Perlengkapan Ibadah",
    item_name: "Al-Qur'an Madina Tajwid Warna & Terjemahan",
    estimated_price: 150000,
    purchase_url: "https://shopee.co.id/search?keyword=alquran+madina+custom+nama",
    notes: "Cover kustom ukir nama pasangan pengantin",
  },
  {
    box_name: "Kotak 1: Set Perlengkapan Ibadah",
    item_name: "Tasbih Kayu Kokka / Tasbih Digital LED",
    estimated_price: 75000,
    purchase_url: "https://shopee.co.id/search?keyword=tasbih+kokka+asli",
  },

  // Kotak 2: Set Skincare & Kosmetik
  {
    box_name: "Kotak 2: Set Skincare & Kosmetik",
    item_name: "Cushion / Foundation High Coverage",
    estimated_price: 250000,
    purchase_url: "https://shopee.co.id/search?keyword=cushion+makeup",
  },
  {
    box_name: "Kotak 2: Set Skincare & Kosmetik",
    item_name: "Lipstick / Lip Velvet & Gloss Set",
    estimated_price: 150000,
    purchase_url: "https://tokopedia.com/search?q=lip+velvet+set",
  },
  {
    box_name: "Kotak 2: Set Skincare & Kosmetik",
    item_name: "Eye Shadow Palette & Blush On Natural",
    estimated_price: 200000,
    purchase_url: "https://shopee.co.id/search?keyword=eyeshadow+palette",
  },
  {
    box_name: "Kotak 2: Set Skincare & Kosmetik",
    item_name: "Night Cream, Day Cream & Serum Wajah",
    estimated_price: 450000,
    purchase_url: "https://tokopedia.com/search?q=skincare+set+glowing",
    notes: "Set skincare harian wanita",
  },

  // Kotak 3: Set Perhiasan Emas
  {
    box_name: "Kotak 3: Set Perhiasan Emas",
    item_name: "Cincin Kawin Pengantin Wanita (Emas 75%)",
    estimated_price: 3500000,
    notes: "Disimpan di kotak perhiasan velvet",
  },
  {
    box_name: "Kotak 3: Set Perhiasan Emas",
    item_name: "Kalung Emas / Liontin Berlian",
    estimated_price: 4500000,
  },
  {
    box_name: "Kotak 3: Set Perhiasan Emas",
    item_name: "Gelang Emas Simpel Elegant",
    estimated_price: 3000000,
  },

  // Kotak 4: Set Busana & Kain Kebaya
  {
    box_name: "Kotak 4: Set Busana & Kain Kebaya",
    item_name: "Bahan Kain Kebaya Brokat Perancis Premium",
    estimated_price: 600000,
    purchase_url: "https://shopee.co.id/search?keyword=kain+kebaya+brokat",
  },
  {
    box_name: "Kotak 4: Set Busana & Kain Kebaya",
    item_name: "Kain Batik Solo / Jogja Tradisional (Bawahan)",
    estimated_price: 400000,
    purchase_url: "https://tokopedia.com/search?q=kain+batik+solo+tulis",
  },
  {
    box_name: "Kotak 4: Set Busana & Kain Kebaya",
    item_name: "Kemeja Batik Pria Matching Pasangan",
    estimated_price: 350000,
    purchase_url: "https://shopee.co.id/search?keyword=kemeja+batik+pria+premium",
  },

  // Kotak 5: Set Sepatu & Tas
  {
    box_name: "Kotak 5: Set Sepatu & Tas",
    item_name: "High Heels / Pesta Stiletto Hak 7cm",
    estimated_price: 750000,
    purchase_url: "https://shopee.co.id/search?keyword=high+heels+pesta+wanita",
  },
  {
    box_name: "Kotak 5: Set Sepatu & Tas",
    item_name: "Handbag / Clutch Pesta Formil",
    estimated_price: 1200000,
    purchase_url: "https://tokopedia.com/search?q=clutch+pesta+wanita",
  },

  // Kotak 6: Set Body Care & Parfum
  {
    box_name: "Kotak 6: Set Body Care & Parfum",
    item_name: "Body Lotion, Body Wash & Body Scrub Gift Set",
    estimated_price: 350000,
    purchase_url: "https://shopee.co.id/search?keyword=body+care+gift+set",
  },
  {
    box_name: "Kotak 6: Set Body Care & Parfum",
    item_name: "Eau de Parfum EDP Luxury 100ml",
    estimated_price: 1200000,
    purchase_url: "https://tokopedia.com/search?q=parfum+wanita+edp",
  },

  // Kotak 7: Set Pakaian Dalam & Lingerie
  {
    box_name: "Kotak 7: Set Pakaian Dalam & Lingerie",
    item_name: "Set Underwear Exclusive Seamless (3 Pcs)",
    estimated_price: 300000,
    purchase_url: "https://shopee.co.id/search?keyword=underwear+set+wanita",
  },
  {
    box_name: "Kotak 7: Set Pakaian Dalam & Lingerie",
    item_name: "Lingerie & Silk Robe Baju Tidur Renda",
    estimated_price: 450000,
    purchase_url: "https://tokopedia.com/search?q=lingerie+robe+silk",
  },

  // Kotak 8: Makanan Tradisional & Kue
  {
    box_name: "Kotak 8: Makanan Tradisional & Kue",
    item_name: "Jadah Ketan & Wajik Manis Adat",
    estimated_price: 200000,
    notes: "Simbolik perekat ikatan tali silaturahmi kedua keluarga",
  },
  {
    box_name: "Kotak 8: Makanan Tradisional & Kue",
    item_name: "Lapis Legit & Tampah Kue Basah Tradisional",
    estimated_price: 300000,
  },

  // Kotak 9: Parsel Buah Segar
  {
    box_name: "Kotak 9: Parsel Buah Segar",
    item_name: "Parsel Buah (Pisang Raja, Apel, Jeruk, Anggur)",
    estimated_price: 250000,
    notes: "Simbolik keberkahan dan kesuburan calon pengantin",
  },
];
