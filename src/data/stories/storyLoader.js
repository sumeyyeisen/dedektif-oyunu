// Story files - Import all stories
import story101 from './kolay/101-sivrisinek.json';
import story102 from './kolay/102-mutfak.json';
import story103 from './kolay/103-bar.json';
import story104 from './kolay/104-ayna.json';
import story105 from './kolay/105-telefon.json';
import story106 from './kolay/106-kapi.json';
import story107 from './kolay/107-fotograf.json';
import story108 from './kolay/108-mektup.json';
import story109 from './kolay/109-kirmizi-isik.json';
import story110 from './kolay/110-pencere.json';
import story111 from './kolay/111-su.json';
import story112 from './kolay/112-yagmur.json';
import story113 from './kolay/113-kitap.json';
import story114 from './kolay/114-elektrik.json';
import story115 from './kolay/115-para.json';
import story116 from './kolay/116-kapi-zili.json';
import story117 from './kolay/117-yemek.json';
import story118 from './kolay/118-kol-saati.json';
import story201 from './orta/201-asansor.json';
import story202 from './orta/202-tren.json';
import story203 from './orta/203-kol.json';
import story204 from './orta/204-saat.json';
import story205 from './orta/205-ayakkabi.json';
import story206 from './orta/206-koku.json';
import story207 from './orta/207-hastane.json';
import story208 from './orta/208-kazi.json';
import story209 from './orta/209-denizalti.json';
import story210 from './orta/210-kapi-kolu.json';
import story301 from './zor/301-marti.json';
import story302 from './zor/302-kum.json';
import story303 from './zor/303-piyano.json';
import story304 from './zor/304-kapi-kolu.json';
import story305 from './zor/305-cicek.json';
import story306 from './zor/306-anahtar.json';

// Story map
const storyFiles = {
  101: story101,
  102: story102,
  103: story103,
  104: story104,
  105: story105,
  106: story106,
  107: story107,
  108: story108,
  109: story109,
  110: story110,
  111: story111,
  112: story112,
  113: story113,
  114: story114,
  115: story115,
  116: story116,
  117: story117,
  118: story118,
  201: story201,
  202: story202,
  203: story203,
  204: story204,
  205: story205,
  206: story206,
  207: story207,
  208: story208,
  209: story209,
  210: story210,
  301: story301,
  302: story302,
  303: story303,
  304: story304,
  305: story305,
  306: story306,
};

// Story metadata - Kart görünümü için genişletilmiş bilgiler
const storyMetadata = {
  kolay: [
    { 
      id: 101,
      baslik: "Sivrisinek ve Kaza",
      onizleme: "Bir sivrisinek yüzünden onlarca insan hayatını kaybetti...",
      kategori: "Gizem",
      icon: "bug",
      tahminiSure: "5-10 dk",
      oynayanSayisi: 1200,
    },
    { 
      id: 102,
      baslik: "Mutfaktaki Alevler",
      onizleme: "Kadın sadece yemek yapmak istiyordu. Ama su kullandığı için feci şekilde can verdi...",
      kategori: "Kaza",
      icon: "fire",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 850,
    },
    { 
      id: 103,
      baslik: "Barda Tek Kurşun",
      onizleme: "Bir kadın bara girip içki istedi. Barmen ona içki vermek yerine silahını çekip kadını vurdu...",
      kategori: "Cinayet",
      icon: "glass-cocktail",
      tahminiSure: "7-12 dk",
      oynayanSayisi: 950,
    },
    { 
      id: 104,
      baslik: "Kırık Ayna",
      onizleme: "Bir adam aynaya baktı ve kendini öldürdü...",
      kategori: "Dram",
      icon: "mirror",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 720,
    },
    { 
      id: 105,
      baslik: "Sessiz Telefon",
      onizleme: "Bir kadın telefonla konuştu ve hemen ardından öldü. Telefonda kimse konuşmadı...",
      kategori: "Kaza",
      icon: "phone",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 680,
    },
    { 
      id: 106,
      baslik: "Kilitli Kapı",
      onizleme: "Bir adam odasına girdi, kapıyı içeriden kilitledi ve ertesi gün ölü bulundu...",
      kategori: "Gizem",
      icon: "door-closed-lock",
      tahminiSure: "10-15 dk",
      oynayanSayisi: 890,
    },
    { 
      id: 107,
      baslik: "Son Fotoğraf",
      onizleme: "Bir adam fotoğrafını çekti, fotoğrafa baktı ve öldü...",
      kategori: "Kaza",
      icon: "camera",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 760,
    },
    { 
      id: 108,
      baslik: "Ölümcül Mektup",
      onizleme: "Bir kadın mektup aldı, okudu ve öldü. Mektupta sadece 'Seni seviyorum' yazıyordu...",
      kategori: "Dram",
      icon: "email",
      tahminiSure: "7-11 dk",
      oynayanSayisi: 820,
    },
    { 
      id: 109,
      baslik: "Kırmızı Işık",
      onizleme: "Bir adam kırmızı ışıkta geçti ama polis onu durdurmadı...",
      kategori: "Mantık",
      icon: "traffic-light",
      tahminiSure: "5-8 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 110,
      baslik: "Açık Pencere",
      onizleme: "Bir kadın 20. kattan düştü ama yaralanmadı...",
      kategori: "İş Güvenliği",
      icon: "window-open",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 111,
      baslik: "Susuz Ölüm",
      onizleme: "Bir adam çölde susuzluktan öldü. Yanında 5 litre su vardı ama içmedi...",
      kategori: "Hayatta Kalma",
      icon: "water",
      tahminiSure: "7-12 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 112,
      baslik: "Yağmurda Kuru",
      onizleme: "Bir adam şemsiyesiz yağmurda 10 dakika yürüdü ama hiç ıslanmadı...",
      kategori: "Mantık",
      icon: "weather-rainy",
      tahminiSure: "5-9 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 113,
      baslik: "Okunamayan Kitap",
      onizleme: "Bir kadın kitabı aldı, okudu ve geri verdi. Ama hiçbir kelime okumadı...",
      kategori: "Teknoloji",
      icon: "book-open",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 114,
      baslik: "Karanlıkta Okuma",
      onizleme: "Elektrikler kesildi ama adam kitap okumaya devam etti. Mum veya fener kullanmadı...",
      kategori: "Engelli Hakları",
      icon: "lightbulb-off",
      tahminiSure: "7-11 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 115,
      baslik: "Kayıp Para",
      onizleme: "Bir adam 100 lira kaybetti ama mutlu oldu...",
      kategori: "Psikoloji",
      icon: "cash",
      tahminiSure: "5-9 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 116,
      baslik: "Çalmayan Zil",
      onizleme: "Bir adam kapı zilini çaldı ama ses çıkmadı. Zil bozuk değildi...",
      kategori: "Engelli Hakları",
      icon: "bell",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 117,
      baslik: "Soğuk Yemek",
      onizleme: "Bir kadın yemeği ısıtmadan soğuk yedi ve çok memnun kaldı...",
      kategori: "Yemek",
      icon: "ice-cream",
      tahminiSure: "5-8 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 118,
      baslik: "Aksesuar Saat",
      onizleme: "Bir adamın kol saati durdu ama adam saati tamir ettirmedi ve kullanmaya devam etti...",
      kategori: "Modern Yaşam",
      icon: "watch",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
  ],
  orta: [
    { 
      id: 201,
      baslik: "Asansördeki Adam",
      onizleme: "Bir adam 20. katta oturuyor. İşe giderken zemin kata iniyor ama eve dönerken asansörle 10. kata çıkıp gerisini yürüyor...",
      kategori: "Mantık",
      icon: "elevator",
      tahminiSure: "10-15 dk",
      oynayanSayisi: 720,
    },
    { 
      id: 202,
      baslik: "Tren Yolculuğu",
      onizleme: "Bir adam trene bindi, tünele girdi ve çığlık attı. Tünelden çıktığında ölmüştü...",
      kategori: "Dram",
      icon: "train",
      tahminiSure: "12-18 dk",
      oynayanSayisi: 650,
    },
    { 
      id: 203,
      baslik: "Kopan Kol",
      onizleme: "Bir adam ormanda yürürken kolunu kesti ve kaçtı...",
      kategori: "Hayatta Kalma",
      icon: "arm-flex",
      tahminiSure: "10-15 dk",
      oynayanSayisi: 580,
    },
    { 
      id: 204,
      baslik: "Duran Saat",
      onizleme: "Bir kadın saatine baktı ve kocasının öldüğünü anladı. Saat çalışıyordu...",
      kategori: "Gizem",
      icon: "clock",
      tahminiSure: "11-16 dk",
      oynayanSayisi: 690,
    },
    { 
      id: 205,
      baslik: "Yanlış Ayakkabı",
      onizleme: "Bir adam ayakkabılarını giydi ve öldü. Ayakkabılar zehirli değildi...",
      kategori: "Kaza",
      icon: "shoe-formal",
      tahminiSure: "12-17 dk",
      oynayanSayisi: 620,
    },
    { 
      id: 206,
      baslik: "Tatlı Koku",
      onizleme: "Bir adam tatlı bir koku aldı ve hemen kaçmaya başladı...",
      kategori: "Tehlike",
      icon: "flower",
      tahminiSure: "10-14 dk",
      oynayanSayisi: 710,
    },
    { 
      id: 207,
      baslik: "Hastanede Ölüm",
      onizleme: "Bir doktor hastasını öldürdü ama kimse onu suçlamadı. Hatta ailesi teşekkür etti...",
      kategori: "Tıp Etiği",
      icon: "hospital",
      tahminiSure: "12-18 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 208,
      baslik: "Kazı Alanı",
      onizleme: "Arkeologlar bir mezar kazdılar ve içinde hiçbir kemik bulamadılar. Mezar boş değildi...",
      kategori: "Arkeoloji",
      icon: "shovel",
      tahminiSure: "11-16 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 209,
      baslik: "Denizaltı Faciası",
      onizleme: "Bir denizaltıdaki tüm mürettebat boğularak öldü ama denizaltı hiç batmadı...",
      kategori: "Denizcilik",
      icon: "ferry",
      tahminiSure: "13-19 dk",
      oynayanSayisi: 0,
    },
    { 
      id: 210,
      baslik: "Sıcak Kapı Kolu",
      onizleme: "Bir adam eve geldi, kapı koluna dokundu ve hemen itfaiyeyi aradı. Kapı kolu çok sıcaktı...",
      kategori: "Yangın Güvenliği",
      icon: "fire",
      tahminiSure: "10-15 dk",
      oynayanSayisi: 0,
    },
  ],
  zor: [
    { 
      id: 301,
      baslik: "Martı Eti",
      onizleme: "Bir adam restoranda martı eti yedi, tadına baktı ve dışarı çıkıp intihar etti...",
      kategori: "Dram",
      icon: "bird",
      tahminiSure: "15-25 dk",
      oynayanSayisi: 450,
    },
    { 
      id: 302,
      baslik: "Kumda İzler",
      onizleme: "Bir adam sahilde yürüyordu. Arkasına baktığında sadece tek ayak izi gördü...",
      kategori: "Psikolojik",
      icon: "foot-print",
      tahminiSure: "18-25 dk",
      oynayanSayisi: 420,
    },
    { 
      id: 303,
      baslik: "Son Konser",
      onizleme: "Bir piyanist konser verdi, alkış aldı ve sahne arkasında öldü. Kimse onu öldürmedi...",
      kategori: "Dram",
      icon: "piano",
      tahminiSure: "16-22 dk",
      oynayanSayisi: 480,
    },
    { 
      id: 304,
      baslik: "Soğuk Kapı Kolu",
      onizleme: "Bir kadın eve geldi, kapı koluna dokundu ve kocasının öldüğünü anladı...",
      kategori: "Mantık",
      icon: "door",
      tahminiSure: "20-28 dk",
      oynayanSayisi: 390,
    },
    { 
      id: 305,
      baslik: "Solmuş Çiçek",
      onizleme: "Bir adam çiçeğe baktı ve ağlamaya başladı. Çiçek solmuştu...",
      kategori: "Dram",
      icon: "flower-tulip",
      tahminiSure: "17-24 dk",
      oynayanSayisi: 440,
    },
    { 
      id: 306,
      baslik: "Kayıp Anahtar",
      onizleme: "Bir adam anahtarını bulamadı ve intihar etti. Anahtar evdeydi...",
      kategori: "Psikolojik",
      icon: "key",
      tahminiSure: "19-26 dk",
      oynayanSayisi: 410,
    },
  ],
};

// Cache için
const storyCache = {};

/**
 * Hikaye yükle (lazy loading)
 * @param {string} difficulty - 'kolay', 'orta', 'zor'
 * @param {number} id - Hikaye ID
 * @returns {Promise<Object>} Hikaye objesi
 */
export const loadStory = async (difficulty, id) => {
  const cacheKey = `${difficulty}-${id}`;
  
  // Cache'de varsa direkt dön
  if (storyCache[cacheKey]) {
    return storyCache[cacheKey];
  }
  
  // Story map'ten al
  const story = storyFiles[id];
  if (!story) {
    throw new Error(`Hikaye bulunamadı: ${difficulty}/${id}`);
  }
  
  // Cache'e ekle
  storyCache[cacheKey] = story;
  
  return story;
};

/**
 * Rastgele hikaye seç (sadece metadata)
 * @param {string} difficulty - 'kolay', 'orta', 'zor'
 * @returns {Object} Hikaye metadata
 */
export const getRandomStoryMetadata = (difficulty) => {
  const stories = storyMetadata[difficulty];
  if (!stories || stories.length === 0) {
    throw new Error(`${difficulty} seviyesinde hikaye yok`);
  }
  return stories[Math.floor(Math.random() * stories.length)];
};

/**
 * Rastgele hikaye yükle
 * @param {string} difficulty - 'kolay', 'orta', 'zor'
 * @returns {Promise<Object>} Hikaye objesi
 */
export const loadRandomStory = async (difficulty) => {
  const metadata = getRandomStoryMetadata(difficulty);
  return await loadStory(difficulty, metadata.id);
};

/**
 * Tüm hikayeleri yükle (opsiyonel - preload için)
 * @param {string} difficulty - 'kolay', 'orta', 'zor'
 * @returns {Promise<Array>} Hikaye listesi
 */
export const loadAllStories = async (difficulty) => {
  const metadata = storyMetadata[difficulty];
  const promises = metadata.map(m => loadStory(difficulty, m.id));
  return await Promise.all(promises);
};

/**
 * Hikaye sayısını al
 * @param {string} difficulty - 'kolay', 'orta', 'zor'
 * @returns {number} Hikaye sayısı
 */
export const getStoryCount = (difficulty) => {
  return storyMetadata[difficulty]?.length || 0;
};

/**
 * Tüm hikaye metadata'larını al (kart görünümü için)
 * @param {string} difficulty - 'kolay', 'orta', 'zor'
 * @returns {Array} Hikaye metadata listesi
 */
export const getAllStoryMetadata = (difficulty) => {
  return storyMetadata[difficulty] || [];
};

/**
 * Tüm zorluk seviyelerindeki hikaye sayıları
 * @returns {Object} { kolay: 3, orta: 1, zor: 1 }
 */
export const getAllStoryCounts = () => {
  return {
    kolay: getStoryCount('kolay'),
    orta: getStoryCount('orta'),
    zor: getStoryCount('zor'),
  };
};

// Eski API ile uyumluluk için (geçici)
export const stories = {
  kolay: storyMetadata.kolay,
  orta: storyMetadata.orta,
  zor: storyMetadata.zor,
};
