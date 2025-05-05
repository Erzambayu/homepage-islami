// Update date and time + greeting
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('dateTime').textContent = now.toLocaleDateString('id-ID', options);

    // Greeting
    const hour = now.getHours();
    let greet = 'Selamat Datang';
    if (hour >= 4 && hour < 11) greet = 'Selamat Pagi';
    else if (hour >= 11 && hour < 15) greet = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greet = 'Selamat Sore';
    else if (hour >= 18 || hour < 4) greet = 'Selamat Malam';
    document.getElementById('greeting').textContent = greet;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Fetch prayer times
let prayerTimesData = null;
async function fetchPrayerTimes() {
    try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia&method=11');
        const data = await response.json();
        const timings = data.data.timings;
        prayerTimesData = timings;
        
        const prayerTimesContainer = document.getElementById('prayerTimes');
        prayerTimesContainer.innerHTML = '';
        
        const prayers = {
            Fajr: 'Subuh',
            Sunrise: 'Terbit',
            Dhuhr: 'Dzuhur',
            Asr: 'Ashar',
            Maghrib: 'Maghrib',
            Isha: 'Isya'
        };

        for (const [key, value] of Object.entries(prayers)) {
            const prayerTime = document.createElement('div');
            prayerTime.className = 'prayer-time fade-in';
            prayerTime.innerHTML = `
                <div class="prayer-name">${value}</div>
                <div class="prayer-time-value">${timings[key]}</div>
            `;
            prayerTimesContainer.appendChild(prayerTime);
        }
        updatePrayerCountdown();
    } catch (error) {
        console.error('Error fetching prayer times:', error);
    }
}

// Fetch random Quran verse
let lastAudio = null;
function showAudioMurottal(surah, ayat) {
    // API: https://quran-api-id.vercel.app/surah/{nomorSurah}/ayat/{nomorAyat}/audio
    // surah: nama latin atau nomor, ayat: nomor
    // Gunakan nomor surah dari mapping nama latin
    const surahMap = {
        'Al-Fatihah': 1, 'Al-Baqarah': 2, 'Ali Imran': 3, 'An-Nisa': 4, 'Al-Ma\'idah': 5, 'Al-An\'am': 6, 'Al-A\'raf': 7, 'Al-Anfal': 8, 'At-Taubah': 9, 'Yunus': 10, 'Hud': 11, 'Yusuf': 12, 'Ar-Ra\'d': 13, 'Ibrahim': 14, 'Al-Hijr': 15, 'An-Nahl': 16, 'Al-Isra': 17, 'Al-Kahfi': 18, 'Maryam': 19, 'Ta-Ha': 20, 'Al-Anbiya': 21, 'Al-Hajj': 22, 'Al-Mu\'minun': 23, 'An-Nur': 24, 'Al-Furqan': 25, 'Asy-Syu\'ara': 26, 'An-Naml': 27, 'Al-Qasas': 28, 'Al-Ankabut': 29, 'Ar-Rum': 30, 'Luqman': 31, 'As-Sajda': 32, 'Al-Ahzab': 33, 'Saba': 34, 'Fatir': 35, 'Yasin': 36, 'As-Saffat': 37, 'Sad': 38, 'Az-Zumar': 39, 'Ghafir': 40, 'Fussilat': 41, 'Asy-Syura': 42, 'Az-Zukhruf': 43, 'Ad-Dukhan': 44, 'Al-Jasiyah': 45, 'Al-Ahqaf': 46, 'Muhammad': 47, 'Al-Fath': 48, 'Al-Hujurat': 49, 'Qaf': 50, 'Adz-Dzariyat': 51, 'At-Tur': 52, 'An-Najm': 53, 'Al-Qamar': 54, 'Ar-Rahman': 55, 'Al-Waqi\'ah': 56, 'Al-Hadid': 57, 'Al-Mujadila': 58, 'Al-Hasyr': 59, 'Al-Mumtahanah': 60, 'As-Saff': 61, 'Al-Jumu\'ah': 62, 'Al-Munafiqun': 63, 'At-Taghabun': 64, 'At-Talaq': 65, 'At-Tahrim': 66, 'Al-Mulk': 67, 'Al-Qalam': 68, 'Al-Haqqah': 69, 'Al-Ma\'arij': 70, 'Nuh': 71, 'Al-Jinn': 72, 'Al-Muzzammil': 73, 'Al-Muddathir': 74, 'Al-Qiyamah': 75, 'Al-Insan': 76, 'Al-Mursalat': 77, 'An-Naba': 78, 'An-Nazi\'at': 79, 'Abasa': 80, 'At-Takwir': 81, 'Al-Infitar': 82, 'At-Tatfif': 83, 'Al-Insyiqaq': 84, 'Al-Buruj': 85, 'At-Tariq': 86, 'Al-A\'la': 87, 'Al-Ghashiyah': 88, 'Al-Fajr': 89, 'Al-Balad': 90, 'Asy-Syams': 91, 'Al-Lail': 92, 'Ad-Duha': 93, 'Al-Insyirah': 94, 'At-Tin': 95, 'Al-Alaq': 96, 'Al-Qadr': 97, 'Al-Bayyinah': 98, 'Az-Zalzalah': 99, 'Al-Adiyat': 100, 'Al-Qari\'ah': 101, 'At-Takatsur': 102, 'Al-Asr': 103, 'Al-Humazah': 104, 'Al-Fil': 105, 'Quraisy': 106, 'Al-Ma\'un': 107, 'Al-Kautsar': 108, 'Al-Kafirun': 109, 'An-Nasr': 110, 'Al-Lahab': 111, 'Al-Ikhlas': 112, 'Al-Falaq': 113, 'An-Nas': 114
    };
    let surahNum = surahMap[surah] || surah;
    const audioUrl = `https://quran-api-id.vercel.app/surah/${surahNum}/ayat/${ayat}/audio`;
    document.getElementById('audioMurottal').innerHTML = `<button id="playMurottal">▶️ Play Murottal</button><audio id="audioAyat" src="${audioUrl}"></audio>`;
    document.getElementById('playMurottal').onclick = function() {
        if (lastAudio) lastAudio.pause();
        const audio = document.getElementById('audioAyat');
        audio.play();
        lastAudio = audio;
    };
}
async function fetchQuranVerse() {
    const fallbackAyat = [
        {
            arab: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            indo: 'Sesungguhnya sesudah kesulitan itu ada kemudahan.',
            surah: 'Al-Insyirah',
            ayat: '6'
        },
        {
            arab: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
            indo: 'Karena sesungguhnya sesudah kesulitan itu ada kemudahan.',
            surah: 'Al-Insyirah',
            ayat: '5'
        },
        {
            arab: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
            indo: 'Allah, tidak ada Tuhan selain Dia, Yang Maha Hidup, Yang terus-menerus mengurus (makhluk-Nya).',
            surah: 'Al-Baqarah',
            ayat: '255'
        },
        {
            arab: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
            indo: 'Dan katakanlah: "Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan."',
            surah: 'Thaha',
            ayat: '114'
        }
    ];
    try {
        const response = await fetch('https://quran-api-id.vercel.app/random');
        const data = await response.json();
        const ayat = data.ayat;
        document.getElementById('quranVerse').innerHTML = `
            <div class=\"verse-text\">${ayat.arab}</div>
            <div class=\"verse-translation\">${ayat.idn}</div>
            <div class=\"verse-info\">
                <span class=\"surah-badge\">${data.surah.nama_latin}</span>
                <span class=\"ayat-badge\">Ayat ${ayat.nomor}</span>
            </div>
        `;
        showAudioMurottal(data.surah.nama_latin, ayat.nomor);
    } catch (error) {
        // fallback lokal
        const ayat = fallbackAyat[Math.floor(Math.random() * fallbackAyat.length)];
        document.getElementById('quranVerse').innerHTML = `
            <div class=\"verse-text\">${ayat.arab}</div>
            <div class=\"verse-translation\">${ayat.indo}</div>
            <div class=\"verse-info\">
                <span class=\"surah-badge\">${ayat.surah}</span>
                <span class=\"ayat-badge\">Ayat ${ayat.ayat}</span>
            </div>
        `;
        document.getElementById('audioMurottal').innerHTML = '';
    }
}

// Fetch daily quote from local API
async function fetchDailyQuote() {
    const fallbackQuotes = [
        {text: 'Jangan menyerah, setiap ujian pasti ada hikmahnya.', author: 'Anonim'},
        {text: 'Kebahagiaan bukanlah milik mereka yang hebat dalam segalanya, namun mereka yang mampu temukan hal sederhana dalam hidup dan tetap bersyukur.', author: 'Anonim'},
        {text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.', author: 'HR. Ahmad'},
        {text: 'Kesabaran itu ada dua: sabar atas sesuatu yang tidak kau ingin dan sabar menahan diri dari sesuatu yang kau inginkan.', author: 'Ali bin Abi Thalib'}
    ];
    try {
        // Quotes API lokal Indonesia (bebas CORS)
        const response = await fetch('https://api.akuari.my.id/hub/quotes');
        const data = await response.json();
        let quote = data.quotes || data.data || data.result || '';
        let author = data.author || 'Anonim';
        if (typeof quote === 'object') {
            quote = quote.quote || quote.text || '';
            author = quote.author || author;
        }
        if (!quote) throw new Error('No quote');
        document.getElementById('dailyQuote').innerHTML = `
            <div class="quote-text">"${quote}"</div>
            <div class="quote-author">- ${author}</div>
        `;
    } catch (error) {
        // Fallback ke quotes lokal random
        const q = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        document.getElementById('dailyQuote').innerHTML = `
            <div class="quote-text">"${q.text}"</div>
            <div class="quote-author">- ${q.author}</div>
        `;
    }
}

// Initial fetch
fetchPrayerTimes();
fetchQuranVerse();
fetchDailyQuote();

// Refresh prayer times every hour
setInterval(fetchPrayerTimes, 3600000);

// Refresh Quran verse and quote every 6 hours
setInterval(() => {
    fetchQuranVerse();
    fetchDailyQuote();
}, 21600000);

function setDynamicBackgroundAndMarquee() {
    const now = new Date();
    const hour = now.getHours();
    let bodyClass = 'morning';
    let greet = 'Selamat Pagi';
    let marquee = 'Semoga harimu penuh berkah dan semangat!';
    // Hide all sky anims first
    document.getElementById('sun').style.display = 'none';
    document.getElementById('moon').style.display = 'none';
    document.getElementById('cloud1').style.display = 'none';
    document.getElementById('cloud2').style.display = 'none';
    document.getElementById('stars').style.display = 'none';
    if (hour >= 4 && hour < 11) {
        bodyClass = 'morning';
        greet = 'Selamat Pagi';
        marquee = 'Selamat pagi! Jangan lupa sholat Subuh dan Dhuha.';
        document.getElementById('sun').style.display = 'block';
        document.getElementById('cloud1').style.display = 'block';
        document.getElementById('cloud2').style.display = 'block';
    } else if (hour >= 11 && hour < 15) {
        bodyClass = 'afternoon';
        greet = 'Selamat Siang';
        marquee = 'Selamat siang! Jangan lupa sholat Dzuhur dan tetap produktif.';
        document.getElementById('sun').style.display = 'block';
        document.getElementById('cloud1').style.display = 'block';
    } else if (hour >= 15 && hour < 18) {
        bodyClass = 'evening';
        greet = 'Selamat Sore';
        marquee = 'Selamat sore! Jangan lupa sholat Ashar dan istirahat sejenak.';
        document.getElementById('sun').style.display = 'block';
        document.getElementById('cloud2').style.display = 'block';
    } else {
        bodyClass = 'night';
        greet = 'Selamat Malam';
        marquee = 'Selamat malam! Jangan lupa sholat Maghrib, Isya, dan istirahat yang cukup.';
        document.getElementById('moon').style.display = 'block';
        document.getElementById('stars').style.display = 'block';
    }
    document.body.className = bodyClass;
    document.getElementById('greeting').textContent = greet;
    document.getElementById('marqueeText').textContent = marquee;
}

setInterval(setDynamicBackgroundAndMarquee, 1000 * 60); // update setiap menit
setDynamicBackgroundAndMarquee();

// Doa harian random
const doaList = [
    {
        arab: 'اللّهُـمَّ أَنْتَ رَبِّـي لا إِلـهَ إِلاّ أَنْتَ، خَلَقْتَني وَأَنَا عَبْـدُكَ...',
        latin: 'Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduka...',
        arti: 'Ya Allah, Engkau Tuhanku, tidak ada Tuhan selain Engkau, Engkaulah yang menciptakanku dan aku adalah hamba-Mu...'
    },
    {
        arab: 'رَبِّ زِدْنِي عِلْمًا',
        latin: 'Rabbi zidni ilma',
        arti: 'Ya Tuhanku, tambahkanlah kepadaku ilmu.'
    },
    {
        arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ',
        latin: 'Allahumma inni as-aluka al-‘afiyah',
        arti: 'Ya Allah, aku memohon kepada-Mu kesehatan.'
    },
    {
        arab: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        latin: 'Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah waqina ‘adhaban-nar',
        arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.'
    }
];
function showRandomDoa() {
    const doa = doaList[Math.floor(Math.random() * doaList.length)];
    document.getElementById('dailyDoa').innerHTML = `
        <div class="doa-arab">${doa.arab}</div>
        <div class="doa-latin">${doa.latin}</div>
        <div class="doa-arti">${doa.arti}</div>
    `;
}
showRandomDoa();

// --- Inspirasi Sunnah Harian Random ---
const sunnahList = [
    'Senyum adalah sedekah.',
    'Baca doa keluar rumah.',
    'Bersiwak sebelum sholat.',
    'Mengucapkan salam saat bertemu.',
    'Membaca Al-Quran setiap hari.',
    'Berwudhu sebelum tidur.',
    'Membiasakan sholat dhuha.',
    'Membantu orang tua dan tetangga.',
    'Berdoa sebelum dan sesudah makan.',
    'Mengucapkan "Alhamdulillah" setelah bersin.'
];
function showRandomSunnah() {
    const sunnah = sunnahList[Math.floor(Math.random() * sunnahList.length)];
    document.getElementById('sunnahInspirasi').textContent = sunnah;
}
showRandomSunnah();

// Widget Cuaca otomatis
async function showWeather() {
    if (!navigator.geolocation) {
        document.getElementById('weatherWidget').innerHTML = 'Tidak bisa mendapatkan lokasi.';
        return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
            const data = await res.json();
            const temp = data.current_weather.temperature;
            const weatherCode = data.current_weather.weathercode;
            const desc = weatherDesc(weatherCode);
            // Get city name
            let city = '';
            try {
                const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                const locData = await locRes.json();
                city = locData.address.city || locData.address.town || locData.address.village || locData.address.state || '';
            } catch {}
            document.getElementById('weatherWidget').innerHTML = `
                <div class="weather-city">${city}</div>
                <div class="weather-temp">${temp}°C</div>
                <div class="weather-desc">${desc}</div>
            `;
        } catch {
            document.getElementById('weatherWidget').innerHTML = 'Gagal memuat cuaca.';
        }
    }, () => {
        document.getElementById('weatherWidget').innerHTML = 'Izin lokasi ditolak.';
    });
}
function weatherDesc(code) {
    // Open-Meteo weather code simple mapping
    if ([0].includes(code)) return 'Cerah';
    if ([1,2,3].includes(code)) return 'Cerah Berawan';
    if ([45,48].includes(code)) return 'Berkabut';
    if ([51,53,55,56,57].includes(code)) return 'Gerimis';
    if ([61,63,65,66,67,80,81,82].includes(code)) return 'Hujan';
    if ([71,73,75,77,85,86].includes(code)) return 'Salju';
    if ([95,96,99].includes(code)) return 'Badai Petir';
    return 'Cuaca tidak diketahui';
}
showWeather();

// --- Countdown waktu sholat berikutnya ---
function getNextPrayerTime() {
    if (!prayerTimesData) return null;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const times = prayerTimesData;
    const prayerOrder = [
        {key: 'Fajr', label: 'Subuh'},
        {key: 'Sunrise', label: 'Terbit'},
        {key: 'Dhuhr', label: 'Dzuhur'},
        {key: 'Asr', label: 'Ashar'},
        {key: 'Maghrib', label: 'Maghrib'},
        {key: 'Isha', label: 'Isya'}
    ];
    for (let i = 0; i < prayerOrder.length; i++) {
        const t = times[prayerOrder[i].key];
        const [h, m] = t.split(':');
        const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
        if (prayerDate > now) {
            return {label: prayerOrder[i].label, time: prayerDate};
        }
    }
    // Jika sudah lewat semua, ambil Subuh besok
    const [h, m] = times['Fajr'].split(':');
    const besok = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m);
    return {label: 'Subuh', time: besok};
}
function updatePrayerCountdown() {
    const next = getNextPrayerTime();
    if (!next) return;
    const now = new Date();
    let diff = Math.floor((next.time - now) / 1000);
    if (diff < 0) diff = 0;
    const jam = String(Math.floor(diff / 3600)).padStart(2, '0');
    const menit = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const detik = String(diff % 60).padStart(2, '0');
    document.getElementById('prayerCountdown').innerHTML = `Menuju <b>${next.label}</b>: <span style="color:#00eaff">${jam}:${menit}:${detik}</span>`;
}
setInterval(updatePrayerCountdown, 1000); 