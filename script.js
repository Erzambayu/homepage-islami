/**
 * Homepage Islami - Remastered JavaScript
 * ========================================
 * Optimized, refactored, and feature-enhanced
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    API: {
        PRAYER_TIMES: 'https://api.aladhan.com/v1/timingsByCity',
        QURAN_AYAH: 'https://api.alquran.cloud/v1/ayah',
        QURAN_AUDIO_BASE: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy',
        WEATHER: 'https://api.open-meteo.com/v1/forecast',
        GEOCODING: 'https://nominatim.openstreetmap.org/reverse',
        QUOTES: 'https://api.akuari.my.id/hub/quotes'
    },
    DEFAULT_CITY: 'Jakarta',
    DEFAULT_COUNTRY: 'Indonesia',
    TOTAL_AYAT: 6236,  // Total ayat in Quran
    REFRESH_INTERVALS: {
        DATETIME: 1000,
        PRAYER_TIMES: 3600000,      // 1 hour
        QURAN_QUOTE: 3600000,       // 1 hour (more frequent updates)
        BACKGROUND: 60000           // 1 minute
    }
};

// ============================================
// STATE MANAGEMENT
// ============================================
let state = {
    prayerTimesData: null,
    lastAudio: null,
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    tasbihCount: parseInt(localStorage.getItem('tasbihCount')) || 0
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

async function fetchWithFallback(url, fallbackData, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.warn(`Fetch failed for ${url}:`, error.message);
        return fallbackData;
    }
}

function formatTime(hours, minutes, seconds) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ============================================
// DATE & TIME FUNCTIONS
// ============================================
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

    $('#dateTime').textContent = now.toLocaleDateString('id-ID', options);

    // Update greeting
    const hour = now.getHours();
    let greet = 'Selamat Datang';

    if (hour >= 4 && hour < 11) greet = 'Selamat Pagi';
    else if (hour >= 11 && hour < 15) greet = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greet = 'Selamat Sore';
    else greet = 'Selamat Malam';

    $('#greeting').textContent = greet;
}

// Hijri Date Calculation (approximate)
function updateHijriDate() {
    const now = new Date();
    // Simple Hijri conversion (approximate)
    const hijriMonths = [
        'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
        'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban',
        'Ramadhan', 'Syawal', 'Dzulqaidah', 'Dzulhijjah'
    ];

    // Approximate calculation
    const gregorianDays = Math.floor((now - new Date(622, 6, 16)) / (1000 * 60 * 60 * 24));
    const hijriDays = Math.floor(gregorianDays / 0.970224);
    const hijriYear = Math.floor(hijriDays / 354.36667) + 1;
    const dayInYear = hijriDays % 354;
    const hijriMonth = Math.floor(dayInYear / 29.5);
    const hijriDay = Math.floor(dayInYear % 29.5) + 1;

    const hijriElement = $('#hijriDate');
    if (hijriElement) {
        hijriElement.textContent = `${hijriDay} ${hijriMonths[hijriMonth]} ${hijriYear} H`;
    }
}

// ============================================
// DYNAMIC BACKGROUND & SKY ANIMATION
// ============================================
function setDynamicBackground() {
    const now = new Date();
    const hour = now.getHours();

    // Remove all time classes
    document.body.classList.remove('morning', 'afternoon', 'evening', 'night');

    // Hide all sky elements
    ['sun', 'moon', 'cloud1', 'cloud2', 'stars'].forEach(id => {
        const el = $(`#${id}`);
        if (el) el.style.display = 'none';
    });

    let bodyClass = 'night';
    let marquee = 'Selamat malam! Jangan lupa sholat Maghrib, Isya, dan istirahat yang cukup.';

    if (hour >= 4 && hour < 11) {
        bodyClass = 'morning';
        marquee = 'Selamat pagi! Jangan lupa sholat Subuh dan Dhuha. ☀️';
        $('#sun').style.display = 'block';
        $('#cloud1').style.display = 'block';
        $('#cloud2').style.display = 'block';
    } else if (hour >= 11 && hour < 15) {
        bodyClass = 'afternoon';
        marquee = 'Selamat siang! Jangan lupa sholat Dzuhur dan tetap produktif. 🌤️';
        $('#sun').style.display = 'block';
        $('#cloud1').style.display = 'block';
    } else if (hour >= 15 && hour < 18) {
        bodyClass = 'evening';
        marquee = 'Selamat sore! Jangan lupa sholat Ashar dan istirahat sejenak. 🌅';
        $('#sun').style.display = 'block';
        $('#cloud2').style.display = 'block';
    } else {
        bodyClass = 'night';
        marquee = 'Selamat malam! Jangan lupa sholat Maghrib, Isya, dan istirahat yang cukup. 🌙';
        $('#moon').style.display = 'block';
        $('#stars').style.display = 'block';
    }

    // Don't override dark mode
    if (!state.isDarkMode) {
        document.body.classList.add(bodyClass);
    }

    $('#marqueeText').textContent = marquee;
}

// ============================================
// DARK MODE
// ============================================
function initDarkMode() {
    const toggle = $('#darkModeToggle');

    if (state.isDarkMode) {
        document.body.classList.add('dark-mode');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    toggle.addEventListener('click', () => {
        state.isDarkMode = !state.isDarkMode;
        document.body.classList.toggle('dark-mode', state.isDarkMode);
        toggle.innerHTML = state.isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', state.isDarkMode);

        if (!state.isDarkMode) {
            setDynamicBackground();
        }
    });
}

// ============================================
// PRAYER TIMES
// ============================================
const PRAYER_NAMES = {
    Fajr: 'Subuh',
    Sunrise: 'Terbit',
    Dhuhr: 'Dzuhur',
    Asr: 'Ashar',
    Maghrib: 'Maghrib',
    Isha: 'Isya'
};

async function fetchPrayerTimes() {
    const url = `${CONFIG.API.PRAYER_TIMES}?city=${CONFIG.DEFAULT_CITY}&country=${CONFIG.DEFAULT_COUNTRY}&method=11`;

    try {
        const data = await fetchWithFallback(url, null);
        if (!data || !data.data) throw new Error('Invalid data');

        state.prayerTimesData = data.data.timings;
        renderPrayerTimes();
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        $('#prayerTimes').innerHTML = '<p style="text-align:center;color:var(--color-secondary);">Gagal memuat jadwal sholat. <button onclick="fetchPrayerTimes()" style="background:var(--color-primary);border:none;padding:0.5rem 1rem;border-radius:20px;cursor:pointer;margin-left:0.5rem;">Coba Lagi</button></p>';
    }
}

function renderPrayerTimes() {
    const container = $('#prayerTimes');
    container.innerHTML = '';

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Find next prayer
    let nextPrayerKey = null;
    for (const key of Object.keys(PRAYER_NAMES)) {
        const [h, m] = state.prayerTimesData[key].split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        if (prayerMinutes > currentMinutes) {
            nextPrayerKey = key;
            break;
        }
    }

    for (const [key, label] of Object.entries(PRAYER_NAMES)) {
        const time = state.prayerTimesData[key];
        const isActive = key === nextPrayerKey;

        const prayerEl = document.createElement('div');
        prayerEl.className = `prayer-time fade-in ${isActive ? 'active' : ''}`;
        prayerEl.innerHTML = `
            <div class="prayer-name">${label}</div>
            <div class="prayer-time-value">${time}</div>
        `;
        container.appendChild(prayerEl);
    }

    updatePrayerCountdown();
}

function getNextPrayerTime() {
    if (!state.prayerTimesData) return null;

    const now = new Date();
    const prayerOrder = Object.keys(PRAYER_NAMES);

    for (const key of prayerOrder) {
        const [h, m] = state.prayerTimesData[key].split(':').map(Number);
        const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);

        if (prayerDate > now) {
            return { label: PRAYER_NAMES[key], time: prayerDate };
        }
    }

    // If all prayers passed, return Fajr tomorrow
    const [h, m] = state.prayerTimesData['Fajr'].split(':').map(Number);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m);
    return { label: 'Subuh', time: tomorrow };
}

function updatePrayerCountdown() {
    const next = getNextPrayerTime();
    if (!next) return;

    const now = new Date();
    let diff = Math.max(0, Math.floor((next.time - now) / 1000));

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    $('#prayerCountdown').innerHTML = `
        Menuju <b>${next.label}</b>: 
        <span class="countdown-time">${formatTime(hours, minutes, seconds)}</span>
    `;
}

// ============================================
// QURAN VERSE
// ============================================
const FALLBACK_AYAT = [
    {
        arab: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        indo: 'Sesungguhnya sesudah kesulitan itu ada kemudahan.',
        surah: 'Al-Insyirah',
        ayat: 6
    },
    {
        arab: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
        indo: 'Karena sesungguhnya sesudah kesulitan itu ada kemudahan.',
        surah: 'Al-Insyirah',
        ayat: 5
    },
    {
        arab: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
        indo: 'Dan katakanlah: "Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan."',
        surah: 'Thaha',
        ayat: 114
    },
    {
        arab: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        indo: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat.',
        surah: 'Al-Baqarah',
        ayat: 201
    }
];

// Surah name to number mapping
const SURAH_MAP = {
    'Al-Fatihah': 1, 'Al-Baqarah': 2, 'Ali Imran': 3, 'An-Nisa': 4, 'Al-Ma\'idah': 5,
    'Al-An\'am': 6, 'Al-A\'raf': 7, 'Al-Anfal': 8, 'At-Taubah': 9, 'Yunus': 10,
    'Hud': 11, 'Yusuf': 12, 'Ar-Ra\'d': 13, 'Ibrahim': 14, 'Al-Hijr': 15,
    'An-Nahl': 16, 'Al-Isra': 17, 'Al-Kahfi': 18, 'Maryam': 19, 'Ta-Ha': 20,
    'Al-Anbiya': 21, 'Al-Hajj': 22, 'Al-Mu\'minun': 23, 'An-Nur': 24, 'Al-Furqan': 25,
    'Asy-Syu\'ara': 26, 'An-Naml': 27, 'Al-Qasas': 28, 'Al-Ankabut': 29, 'Ar-Rum': 30,
    'Luqman': 31, 'As-Sajda': 32, 'Al-Ahzab': 33, 'Saba': 34, 'Fatir': 35,
    'Yasin': 36, 'As-Saffat': 37, 'Sad': 38, 'Az-Zumar': 39, 'Ghafir': 40,
    'Fussilat': 41, 'Asy-Syura': 42, 'Az-Zukhruf': 43, 'Ad-Dukhan': 44, 'Al-Jasiyah': 45,
    'Al-Ahqaf': 46, 'Muhammad': 47, 'Al-Fath': 48, 'Al-Hujurat': 49, 'Qaf': 50,
    'Adz-Dzariyat': 51, 'At-Tur': 52, 'An-Najm': 53, 'Al-Qamar': 54, 'Ar-Rahman': 55,
    'Al-Waqi\'ah': 56, 'Al-Hadid': 57, 'Al-Mujadila': 58, 'Al-Hasyr': 59, 'Al-Mumtahanah': 60,
    'As-Saff': 61, 'Al-Jumu\'ah': 62, 'Al-Munafiqun': 63, 'At-Taghabun': 64, 'At-Talaq': 65,
    'At-Tahrim': 66, 'Al-Mulk': 67, 'Al-Qalam': 68, 'Al-Haqqah': 69, 'Al-Ma\'arij': 70,
    'Nuh': 71, 'Al-Jinn': 72, 'Al-Muzzammil': 73, 'Al-Muddathir': 74, 'Al-Qiyamah': 75,
    'Al-Insan': 76, 'Al-Mursalat': 77, 'An-Naba': 78, 'An-Nazi\'at': 79, 'Abasa': 80,
    'At-Takwir': 81, 'Al-Infitar': 82, 'At-Tatfif': 83, 'Al-Insyiqaq': 84, 'Al-Buruj': 85,
    'At-Tariq': 86, 'Al-A\'la': 87, 'Al-Ghashiyah': 88, 'Al-Fajr': 89, 'Al-Balad': 90,
    'Asy-Syams': 91, 'Al-Lail': 92, 'Ad-Duha': 93, 'Al-Insyirah': 94, 'At-Tin': 95,
    'Al-Alaq': 96, 'Al-Qadr': 97, 'Al-Bayyinah': 98, 'Az-Zalzalah': 99, 'Al-Adiyat': 100,
    'Al-Qari\'ah': 101, 'At-Takatsur': 102, 'Al-Asr': 103, 'Al-Humazah': 104, 'Al-Fil': 105,
    'Quraisy': 106, 'Al-Ma\'un': 107, 'Al-Kautsar': 108, 'Al-Kafirun': 109, 'An-Nasr': 110,
    'Al-Lahab': 111, 'Al-Ikhlas': 112, 'Al-Falaq': 113, 'An-Nas': 114
};

async function fetchQuranVerse() {
    try {
        // Generate random ayat number (1-6236)
        const randomAyat = Math.floor(Math.random() * CONFIG.TOTAL_AYAT) + 1;

        // Fetch from Al-Quran Cloud API with Indonesian translation
        const url = `${CONFIG.API.QURAN_AYAH}/${randomAyat}/editions/quran-uthmani,id.indonesian`;
        const data = await fetchWithFallback(url, null, 8000);

        if (data && data.code === 200 && data.data && data.data.length >= 2) {
            const arabicData = data.data[0];
            const translationData = data.data[1];

            const verseData = {
                arab: arabicData.text,
                indo: translationData.text,
                surah: arabicData.surah.englishName,
                surahArabic: arabicData.surah.name,
                ayat: arabicData.numberInSurah,
                surahNumber: arabicData.surah.number,
                globalNumber: arabicData.number
            };

            renderQuranVerse(verseData);
            showAudioMurottal(verseData.globalNumber, verseData.surah, verseData.ayat);
        } else {
            throw new Error('Invalid data from API');
        }
    } catch (error) {
        console.warn('Using fallback Quran verse:', error);
        const fallback = FALLBACK_AYAT[Math.floor(Math.random() * FALLBACK_AYAT.length)];
        renderQuranVerse(fallback);
        $('#audioMurottal').innerHTML = `
            <button onclick="fetchQuranVerse()" style="background:var(--color-primary);border:none;padding:0.5rem 1rem;border-radius:20px;cursor:pointer;color:#fff;">
                <i class="fas fa-sync"></i> Coba Lagi
            </button>
        `;
    }
}

function renderQuranVerse(verse) {
    const surahName = verse.surahArabic || verse.surah;
    $('#quranVerse').innerHTML = `
        <div class="verse-text">${verse.arab}</div>
        <div class="verse-translation">${verse.indo}</div>
        <div class="verse-info">
            <span class="surah-badge">${verse.surah}</span>
            <span class="ayat-badge">Ayat ${verse.ayat}</span>
        </div>
        <button onclick="fetchQuranVerse()" class="btn-refresh-ayat" style="margin-top:1rem;background:transparent;border:1px solid var(--color-glass-border);color:var(--color-text);padding:0.4rem 1rem;border-radius:20px;cursor:pointer;font-size:0.85rem;">
            <i class="fas fa-sync-alt"></i> Ayat Lain
        </button>
    `;
}

function showAudioMurottal(globalAyatNumber, surahName, ayatNumber) {
    // Using Al-Afasy recitation from Islamic Network CDN
    const audioUrl = `${CONFIG.API.QURAN_AUDIO_BASE}/${globalAyatNumber}.mp3`;

    $('#audioMurottal').innerHTML = `
        <div class="audio-controls">
            <button id="playMurottal">
                <i class="fas fa-play"></i> Play Murottal
            </button>
            <span class="reciter-info" style="display:block;font-size:0.8rem;opacity:0.7;margin-top:0.5rem;">Qari: Mishary Rashid Alafasy</span>
        </div>
        <audio id="audioAyat" src="${audioUrl}" preload="auto"></audio>
    `;

    const playBtn = $('#playMurottal');
    const audio = $('#audioAyat');

    playBtn.addEventListener('click', function () {
        if (state.lastAudio && state.lastAudio !== audio) {
            state.lastAudio.pause();
        }

        if (audio.paused) {
            audio.play().then(() => {
                state.lastAudio = audio;
                this.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }).catch(err => {
                console.error('Audio play failed:', err);
                this.innerHTML = '<i class="fas fa-exclamation-circle"></i> Gagal Memutar';
            });
        } else {
            audio.pause();
            this.innerHTML = '<i class="fas fa-play"></i> Play Murottal';
        }
    });

    audio.addEventListener('ended', () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play Murottal';
    });
}

// ============================================
// DAILY DOA
// ============================================
const DOA_LIST = [
    {
        arab: 'اللّهُـمَّ أَنْتَ رَبِّـي لا إِلـهَ إِلاّ أَنْتَ، خَلَقْتَني وَأَنَا عَبْـدُكَ',
        latin: 'Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduka',
        arti: 'Ya Allah, Engkau Tuhanku, tidak ada Tuhan selain Engkau, Engkaulah yang menciptakanku dan aku adalah hamba-Mu.'
    },
    {
        arab: 'رَبِّ زِدْنِي عِلْمًا',
        latin: 'Rabbi zidni ilma',
        arti: 'Ya Tuhanku, tambahkanlah kepadaku ilmu.'
    },
    {
        arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ',
        latin: 'Allahumma inni as-aluka al-\'afiyah',
        arti: 'Ya Allah, aku memohon kepada-Mu kesehatan.'
    },
    {
        arab: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        latin: 'Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah waqina \'adhaban-nar',
        arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.'
    },
    {
        arab: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ',
        latin: 'Bismillahil-ladzi la yadhurru ma\'asmihi syai\'un fil ardhi wa la fis-sama\'',
        arti: 'Dengan menyebut nama Allah yang tidak ada sesuatu pun di bumi dan di langit yang membahayakan dengan nama-Nya.'
    }
];

function showRandomDoa() {
    const doa = DOA_LIST[Math.floor(Math.random() * DOA_LIST.length)];
    $('#dailyDoa').innerHTML = `
        <div class="doa-arab">${doa.arab}</div>
        <div class="doa-latin">${doa.latin}</div>
        <div class="doa-arti">${doa.arti}</div>
    `;
}

// ============================================
// SUNNAH INSPIRASI
// ============================================
const SUNNAH_LIST = [
    'Senyum adalah sedekah. 😊',
    'Baca doa keluar rumah.',
    'Bersiwak sebelum sholat.',
    'Mengucapkan salam saat bertemu.',
    'Membaca Al-Quran setiap hari. 📖',
    'Berwudhu sebelum tidur.',
    'Membiasakan sholat dhuha.',
    'Membantu orang tua dan tetangga.',
    'Berdoa sebelum dan sesudah makan.',
    'Mengucapkan "Alhamdulillah" setelah bersin.',
    'Tidur dalam keadaan suci.',
    'Mendahulukan kanan dalam hal kebaikan.',
    'Membaca Ayat Kursi sebelum tidur.'
];

function showRandomSunnah() {
    const sunnah = SUNNAH_LIST[Math.floor(Math.random() * SUNNAH_LIST.length)];
    $('#sunnahInspirasi').textContent = sunnah;
}

// ============================================
// DAILY QUOTE
// ============================================
const FALLBACK_QUOTES = [
    { text: 'Jangan menyerah, setiap ujian pasti ada hikmahnya.', author: 'Anonim' },
    { text: 'Kebahagiaan bukanlah milik mereka yang hebat dalam segalanya, namun mereka yang mampu temukan hal sederhana dalam hidup dan tetap bersyukur.', author: 'Anonim' },
    { text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.', author: 'HR. Ahmad' },
    { text: 'Kesabaran itu ada dua: sabar atas sesuatu yang tidak kau ingin dan sabar menahan diri dari sesuatu yang kau inginkan.', author: 'Ali bin Abi Thalib' },
    { text: 'Ilmu tanpa amal bagaikan pohon tanpa buah.', author: 'Imam Ghazali' }
];

async function fetchDailyQuote() {
    try {
        const data = await fetchWithFallback(CONFIG.API.QUOTES, null);

        let quote = data?.quotes || data?.data || data?.result || '';
        let author = data?.author || 'Anonim';

        if (typeof quote === 'object') {
            author = quote.author || author;
            quote = quote.quote || quote.text || '';
        }

        if (!quote) throw new Error('No quote');

        renderQuote({ text: quote, author });
    } catch (error) {
        console.warn('Using fallback quote');
        const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        renderQuote(fallback);
    }
}

function renderQuote(quote) {
    $('#dailyQuote').innerHTML = `
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-author">— ${quote.author}</div>
    `;
}

// ============================================
// WEATHER WIDGET
// ============================================
const WEATHER_CODES = {
    0: { desc: 'Cerah', icon: '☀️' },
    1: { desc: 'Cerah Berawan', icon: '🌤️' },
    2: { desc: 'Berawan', icon: '⛅' },
    3: { desc: 'Mendung', icon: '☁️' },
    45: { desc: 'Berkabut', icon: '🌫️' },
    48: { desc: 'Berkabut', icon: '🌫️' },
    51: { desc: 'Gerimis', icon: '🌧️' },
    53: { desc: 'Gerimis', icon: '🌧️' },
    55: { desc: 'Gerimis', icon: '🌧️' },
    61: { desc: 'Hujan', icon: '🌧️' },
    63: { desc: 'Hujan', icon: '🌧️' },
    65: { desc: 'Hujan Lebat', icon: '⛈️' },
    80: { desc: 'Hujan', icon: '🌧️' },
    81: { desc: 'Hujan', icon: '🌧️' },
    82: { desc: 'Hujan Lebat', icon: '⛈️' },
    95: { desc: 'Badai Petir', icon: '⛈️' },
    96: { desc: 'Badai Petir', icon: '⛈️' },
    99: { desc: 'Badai Petir', icon: '⛈️' }
};

function getWeatherInfo(code) {
    return WEATHER_CODES[code] || { desc: 'Tidak diketahui', icon: '🌡️' };
}

async function showWeather() {
    const widget = $('#weatherWidget');

    // Check for saved location first
    const savedLocation = localStorage.getItem('userLocation');

    if (savedLocation) {
        const { lat, lon, city } = JSON.parse(savedLocation);
        await fetchWeatherData(lat, lon, city, widget);
        return;
    }

    if (!navigator.geolocation) {
        widget.innerHTML = '<p>Geolokasi tidak didukung browser Anda.</p>';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude: lat, longitude: lon } = pos.coords;

            // Get city name first
            let city = CONFIG.DEFAULT_CITY;
            try {
                const locData = await fetchWithFallback(
                    `${CONFIG.API.GEOCODING}?lat=${lat}&lon=${lon}&format=json`,
                    null
                );
                city = locData?.address?.city || locData?.address?.town ||
                    locData?.address?.village || locData?.address?.state || city;
            } catch (e) { }

            // Save location to localStorage
            localStorage.setItem('userLocation', JSON.stringify({ lat, lon, city }));

            await fetchWeatherData(lat, lon, city, widget);
        },
        () => {
            widget.innerHTML = '<p>Izin lokasi ditolak. <button onclick="clearLocationAndRetry()" style="background:var(--color-primary);border:none;padding:0.3rem 0.8rem;border-radius:15px;cursor:pointer;">Coba Lagi</button></p>';
        }
    );
}

async function fetchWeatherData(lat, lon, city, widget) {
    try {
        const weatherData = await fetchWithFallback(
            `${CONFIG.API.WEATHER}?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
            null
        );

        if (!weatherData?.current_weather) throw new Error('No weather data');

        const { temperature, weathercode } = weatherData.current_weather;
        const weather = getWeatherInfo(weathercode);

        widget.innerHTML = `
            <div class="weather-icon">${weather.icon}</div>
            <div class="weather-temp">${temperature}°C</div>
            <div class="weather-desc">${weather.desc}</div>
            <div class="weather-city">${city}</div>
            <button onclick="clearLocationAndRetry()" style="background:transparent;border:1px solid var(--color-glass-border);color:var(--color-text);padding:0.3rem 0.8rem;border-radius:15px;cursor:pointer;margin-top:0.5rem;font-size:0.8rem;opacity:0.7;">
                <i class="fas fa-location-crosshairs"></i> Perbarui Lokasi
            </button>
        `;
    } catch (error) {
        widget.innerHTML = '<p>Gagal memuat cuaca. <button onclick="showWeather()" style="background:var(--color-primary);border:none;padding:0.3rem 0.8rem;border-radius:15px;cursor:pointer;">Coba Lagi</button></p>';
    }
}

function clearLocationAndRetry() {
    localStorage.removeItem('userLocation');
    showWeather();
}

// ============================================
// TASBIH COUNTER
// ============================================
function initTasbih() {
    const countDisplay = $('#tasbihCount');
    const countBtn = $('#tasbihBtn');
    const resetBtn = $('#tasbihReset');

    // Load saved count
    countDisplay.textContent = state.tasbihCount;

    countBtn.addEventListener('click', () => {
        state.tasbihCount++;
        countDisplay.textContent = state.tasbihCount;
        localStorage.setItem('tasbihCount', state.tasbihCount);

        // Add pulse animation
        countDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            countDisplay.style.transform = 'scale(1)';
        }, 100);

        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Reset hitungan tasbih?')) {
            state.tasbihCount = 0;
            countDisplay.textContent = 0;
            localStorage.setItem('tasbihCount', 0);
        }
    });
}

// ============================================
// REFRESH BUTTON
// ============================================
function initRefreshButton() {
    $('#refreshBtn').addEventListener('click', async () => {
        const btn = $('#refreshBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        await Promise.all([
            fetchPrayerTimes(),
            fetchQuranVerse(),
            fetchDailyQuote(),
            showWeather()
        ]);

        showRandomDoa();
        showRandomSunnah();

        btn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    });
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Initial updates
    updateDateTime();
    updateHijriDate();
    setDynamicBackground();

    // Initialize features
    initDarkMode();
    initTasbih();
    initRefreshButton();

    // Fetch data
    fetchPrayerTimes();
    fetchQuranVerse();
    fetchDailyQuote();
    showWeather();
    showRandomDoa();
    showRandomSunnah();

    // Set up intervals
    setInterval(updateDateTime, CONFIG.REFRESH_INTERVALS.DATETIME);
    setInterval(updatePrayerCountdown, CONFIG.REFRESH_INTERVALS.DATETIME);
    setInterval(setDynamicBackground, CONFIG.REFRESH_INTERVALS.BACKGROUND);
    setInterval(fetchPrayerTimes, CONFIG.REFRESH_INTERVALS.PRAYER_TIMES);
    setInterval(() => {
        fetchQuranVerse();
        fetchDailyQuote();
    }, CONFIG.REFRESH_INTERVALS.QURAN_QUOTE);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);