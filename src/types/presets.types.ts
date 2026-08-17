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
