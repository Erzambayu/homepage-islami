# Homepage Islami

Homepage Islami adalah halaman pembuka browser yang modern, responsif, dan penuh inspirasi Islami. Cocok dijadikan homepage di Chrome, Edge, atau browser favorit Anda.

## Fitur Utama

- **Greetings Otomatis**: Ucapan salam sesuai waktu (pagi, siang, sore, malam).
- **Pencarian Google**: Search bar langsung ke Google.
- **Widget Cuaca Dua Wilayah**: Cuaca Petojo Utara (Jakarta Pusat) dan Jatibening (Bekasi) tampil berdampingan, lengkap dengan suhu, kelembapan, angin, dan saran sesuai kondisi (hujan, panas, mendung, cerah).
- **Jadwal Sholat**: Jadwal sholat harian (Subuh, Dzuhur, Ashar, Maghrib, Isya).
- **Countdown Sholat Berikutnya**: Hitung mundur menuju waktu sholat terdekat.
- **Ayat Al-Quran Random**: Ayat dan terjemahan random setiap hari, lengkap tombol audio murottal.
- **Doa Harian**: Doa pendek harian (Arab, latin, arti).
- **Inspirasi Sunnah Harian**: Tips sunnah harian random.
- **Quotes Harian**: Menggunakan API eksternal (https://api.quotable.io/random) dengan fallback quotes Islami lokal.
- **Animasi Langit**: Matahari, awan, bulan, bintang sesuai waktu.
- **Desain Modern**: Gradient, glassmorphism, dan animasi smooth.
- **Responsif**: Nyaman di desktop maupun mobile.

## Cara Pakai

1. **Clone repo ini**  
   ```
   git clone https://github.com/Erzambayu/homepage-islami.git
   ```
2. **Buka file `index.html` di browser**  
   Atur sebagai homepage di browser Anda (bisa via Settings > On Startup).

3. **(Opsional) Deploy ke Netlify, Vercel, atau GitHub Pages**  
   Agar bisa diakses online dan API berjalan optimal.

## Sumber API

- Cuaca: [BMKG Prakiraan Cuaca](https://data.bmkg.go.id/prakiraan-cuaca/)
- Quotes: [Quotable API](https://api.quotable.io/random) + fallback lokal
- Jadwal Sholat: [Aladhan API](https://aladhan.com/prayer-times-api)
- Ayat Al-Quran & Audio: [Quran API ID](https://github.com/renomureza/quran-api-id)
- Doa & Sunnah: Fallback lokal

## Kontribusi

Pull request, issue, dan saran sangat diterima!  
Hubungi: erzambayu@gmail.com

---

**Lisensi:** MIT 