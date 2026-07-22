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
import story119 from './kolay/119-arizali-otobus.json';
import story120 from './kolay/120-karavan-tatili.json';
import story121 from './kolay/121-yeni-koku.json';
import story122 from './kolay/122-merakli-dev.json';
import story123 from './kolay/123-hizli-cikis.json';
import story124 from './kolay/124-safari-uyarisi.json';
import story125 from './kolay/125-beklenmedik-karsilasma.json';
import story126 from './kolay/126-siparis.json';
import story127 from './kolay/127-ahirdaki-duman.json';
import story128 from './kolay/128-kirli-cam.json';
import story129 from './kolay/129-yuzen-ev.json';
import story130 from './kolay/130-kucuk-kesik.json';
import story131 from './kolay/131-sallanan-gemi.json';
import story211 from './orta/211-ertelenen-ucus.json';
import story212 from './orta/212-gorunmeyen-isik.json';
import story213 from './orta/213-sesli-mesaj.json';
import story214 from './orta/214-calar-saat.json';
import story215 from './orta/215-degerli-icat.json';
import story216 from './orta/216-cekilen-ses.json';
import story217 from './orta/217-duvarin-ardindan-gelen-ses.json';
import story218 from './orta/218-adanin-sirri.json';
import story219 from './orta/219-dikiz-aynasi.json';
import story220 from './orta/220-radyo-programi.json';
import story221 from './orta/221-sessiz-yolcu.json';
import story222 from './orta/222-tabuttaki-kibrit.json';
import story307 from './zor/307-gunluk-rutin.json';
import story308 from './zor/308-agir-yuk.json';
import story309 from './zor/309-agirlik-testi.json';
import story310 from './zor/310-eksik-odenen-bedel.json';
import story311 from './zor/311-el-yazisi.json';
import story312 from './zor/312-guleryuzlu-yabanci.json';
import story313 from './zor/313-kursudeki-itiraf.json';
import story314 from './zor/314-gec-gelen-haber.json';
import story315 from './zor/315-elindeki-cicek.json';
import story316 from './zor/316-yanlis-doz.json';
import story317 from './zor/317-degisen-guzergah.json';
import story318 from './zor/318-buzul-magarasi.json';
import story319 from './zor/319-aynadaki-not.json';
import story320 from './zor/320-cenazedeki-bakis.json';

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
  119: story119,
  120: story120,
  121: story121,
  122: story122,
  123: story123,
  124: story124,
  125: story125,
  126: story126,
  127: story127,
  128: story128,
  129: story129,
  130: story130,
  131: story131,
  211: story211,
  212: story212,
  213: story213,
  214: story214,
  215: story215,
  216: story216,
  217: story217,
  218: story218,
  219: story219,
  220: story220,
  221: story221,
  222: story222,
  307: story307,
  308: story308,
  309: story309,
  310: story310,
  311: story311,
  312: story312,
  313: story313,
  314: story314,
  315: story315,
  316: story316,
  317: story317,
  318: story318,
  319: story319,
  320: story320,
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
    {
      id: 119,
      baslik: "Arızalı Otobüs",
      onizleme: "Bir turist grubu, otobüsleri arızalandığı için ünlü bir meydanı gezmeye geç kaldı...",
      kategori: "Kaza",
      icon: "bus",
      tahminiSure: "5-8 dk",
      oynayanSayisi: 0,
    },
    {
      id: 120,
      baslik: "Karavan Tatili",
      onizleme: "Bir aile karavanla tatildeydi. Sabah olduğunda tüm aile üyeleri hayatını kaybetmiş halde bulundu...",
      kategori: "Kaza",
      icon: "truck",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
    {
      id: 121,
      baslik: "Yeni Koku",
      onizleme: "Bir adam, eşinin doğum günü hediyesi olan yeni bir koku sürdü ve dışarı çıktı...",
      kategori: "Kaza",
      icon: "bee",
      tahminiSure: "5-8 dk",
      oynayanSayisi: 0,
    },
    {
      id: 122,
      baslik: "Meraklı Dev",
      onizleme: "Bir tekne turundaki turistler renkli kıyafetler giymişti. Kısa süre sonra bazıları hayatını kaybetti...",
      kategori: "Kaza",
      icon: "waves",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
    {
      id: 123,
      baslik: "Hızlı Çıkış",
      onizleme: "Profesyonel bir dalgıç, işini iyi yaptığı için değil, tam tersine paniklediği için hayatını kaybetti...",
      kategori: "Kaza",
      icon: "swim",
      tahminiSure: "5-9 dk",
      oynayanSayisi: 0,
    },
    {
      id: 124,
      baslik: "Safari Uyarısı",
      onizleme: "Bir turist grubu, yerel rehberin uyarısını dinlemediği için hayatını kaybetti...",
      kategori: "Kaza",
      icon: "elephant",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
    {
      id: 125,
      baslik: "Beklenmedik Karşılaşma",
      onizleme: "Genç bir tıp öğrencisi, uzun zamandır görmediği bir akrabasını gördüğünde şoke oldu...",
      kategori: "Gizem",
      icon: "school",
      tahminiSure: "5-8 dk",
      oynayanSayisi: 0,
    },
    {
      id: 126,
      baslik: "Sipariş",
      onizleme: "Bir mahallede bir hafta içinde onlarca kişi hayatını kaybetti. Hepsinin ölümü aynı nedene bağlıydı...",
      kategori: "Cinayet",
      icon: "food",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
    {
      id: 127,
      baslik: "Ahırdaki Duman",
      onizleme: "Bir kadın, oğlunu korumak istedi ama bu yüzden kendisi de hapse girdi...",
      kategori: "Suç",
      icon: "fire",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
    {
      id: 128,
      baslik: "Kirli Cam",
      onizleme: "Bir kadın yolda araba sürüyordu. Camını temizlediği için hayatını kaybetti...",
      kategori: "Kaza",
      icon: "car",
      tahminiSure: "5-9 dk",
      oynayanSayisi: 0,
    },
    {
      id: 129,
      baslik: "Yüzen Ev",
      onizleme: "Bir kadın kendi evinde susuzluktan hayatını kaybetti...",
      kategori: "Kaza",
      icon: "sail-boat",
      tahminiSure: "5-8 dk",
      oynayanSayisi: 0,
    },
    {
      id: 130,
      baslik: "Küçük Kesik",
      onizleme: "Bir dalgıcın elinde küçük bir kesik oluştu. Bu küçük yaralanma onun ölümüne neden oldu...",
      kategori: "Kaza",
      icon: "waves",
      tahminiSure: "6-10 dk",
      oynayanSayisi: 0,
    },
    {
      id: 131,
      baslik: "Sallanan Gemi",
      onizleme: "Bir restoranda, o akşam yemek yiyen herkes kusmuştu. Ama yemekler zehirli değildi...",
      kategori: "Kaza",
      icon: "ferry",
      tahminiSure: "5-8 dk",
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
    {
      id: 211,
      baslik: "Ertelenen Uçuş",
      onizleme: "Bir kadın tatildeydi. Uçuş saati bir gün öne alındığı için hayatını kaybetti...",
      kategori: "Kaza",
      icon: "airplane",
      tahminiSure: "7-11 dk",
      oynayanSayisi: 0,
    },
    {
      id: 212,
      baslik: "Görünmeyen Işık",
      onizleme: "Bir motosiklet sürücüsü kaza yaptı. Bir tavşan ve bir çanta bu kazadan sorumluydu...",
      kategori: "Kaza",
      icon: "motorbike",
      tahminiSure: "7-11 dk",
      oynayanSayisi: 0,
    },
    {
      id: 213,
      baslik: "Sesli Mesaj",
      onizleme: "Bir adam uyanır, aracını çalıştırır ve kısa süre sonra birini öldürdüğünü fark eder...",
      kategori: "Kaza",
      icon: "ferry",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 0,
    },
    {
      id: 214,
      baslik: "Çalar Saat",
      onizleme: "Bir kadın yüzmeye gitti, bir ses duydu ve boğuldu...",
      kategori: "Kaza",
      icon: "alarm",
      tahminiSure: "7-11 dk",
      oynayanSayisi: 0,
    },
    {
      id: 215,
      baslik: "Değerli İcat",
      onizleme: "Bir kadın, resmi bir kuruma giderken öldürüldü...",
      kategori: "Cinayet",
      icon: "lightbulb",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 0,
    },
    {
      id: 216,
      baslik: "Çekilen Ses",
      onizleme: "Bir avcı, kasetçalarını çalıştırdıktan birkaç dakika sonra öldü...",
      kategori: "Kaza",
      icon: "paw",
      tahminiSure: "7-11 dk",
      oynayanSayisi: 0,
    },
    {
      id: 217,
      baslik: "Duvarın Ardından Gelen Ses",
      onizleme: "Bir adamın hayali zengin ve yalnız yaşamaktı. Ama küçük bir hayvan yüzünden her şey ortaya çıktı...",
      kategori: "Cinayet",
      icon: "cat",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 0,
    },
    {
      id: 218,
      baslik: "Adanın Sırrı",
      onizleme: "Bir adam tatile gitti. Eğer tatilde bir suç işlemeseydi hayatını kaybedecekti...",
      kategori: "Gizem",
      icon: "island",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 0,
    },
    {
      id: 219,
      baslik: "Dikiz Aynası",
      onizleme: "Bir adam bir taksiye bindi, dikiz aynasına baktı ve kendi hayatına son verdi...",
      kategori: "Gizem",
      icon: "taxi",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 0,
    },
    {
      id: 220,
      baslik: "Radyo Programı",
      onizleme: "Bir adam arabasını sürerken radyoyu açtı, birkaç dakika dinledi ve eşinden ayrılmaya karar verdi...",
      kategori: "Dram",
      icon: "radio",
      tahminiSure: "7-11 dk",
      oynayanSayisi: 0,
    },
    {
      id: 221,
      baslik: "Sessiz Yolcu",
      onizleme: "On kişi bir araca bindi. Araçtan inerken bir kişinin eksildiğini fark ettiler...",
      kategori: "Gizem",
      icon: "submarine",
      tahminiSure: "7-11 dk",
      oynayanSayisi: 0,
    },
    {
      id: 222,
      baslik: "Tabuttaki Kibrit",
      onizleme: "Bir mahkum, bir kibrit yaktı, bir ceset gördü ve artık asla özgür olamayacağını anladı...",
      kategori: "Gizem",
      icon: "coffin",
      tahminiSure: "8-12 dk",
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
    {
      id: 307,
      baslik: "Günlük Rutin",
      onizleme: "Yaşlı bir adam, günlük rutinini her zamanki gibi yaptı ve öldü. Doktor kalp durmasını teşhis etti...",
      kategori: "Cinayet",
      icon: "tooth",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 0,
    },
    {
      id: 308,
      baslik: "Ağır Yük",
      onizleme: "Bir adam arabasında uyuyakaldı ve boğularak öldü. Ama araba suya batmadı...",
      kategori: "Cinayet",
      icon: "truck",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
    },
    {
      id: 309,
      baslik: "Ağırlık Testi",
      onizleme: "Bir kadın, sadece kilolu ve belirli bir ülkeden olduğu için hayatını kaybetti...",
      kategori: "Suç",
      icon: "scale",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
    },
    {
      id: 310,
      baslik: "Eksik Ödenen Bedel",
      onizleme: "Bir adam metroda tek kollu birine rastladı. O adam silah çekip onu vurdu...",
      kategori: "Cinayet",
      icon: "subway",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
    },
    {
      id: 311,
      baslik: "El Yazısı",
      onizleme: "Bir bulmaca dergisi, bir katilin yakalanmasına neden oldu...",
      kategori: "Gizem",
      icon: "newspaper",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
    },
    {
      id: 312,
      baslik: "Güleryüzlü Yabancı",
      onizleme: "Şehrin en sevilen sokak eğlendiricisi tutuklandığında herkes şoke oldu...",
      kategori: "Suç",
      icon: "drama-masks",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 0,
    },
    {
      id: 313,
      baslik: "Kürsüdeki İtiraf",
      onizleme: "Bir rahip cenazede konuşma yaptı. Konuşmasının sonuna doğru belediye başkanı da orada konuştu...",
      kategori: "Gizem",
      icon: "church",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
    },
    {
      id: 314,
      baslik: "Geç Gelen Haber",
      onizleme: "Bir kadın çok sağlıklı olduğunu öğrendikten kısa süre sonra hayatını kaybetti...",
      kategori: "Dram",
      icon: "hospital",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
    },
    {
      id: 315,
      baslik: "Elindeki Çiçek",
      onizleme: "Olay yerinde iki kişi bulundu, bir mektup ve bir çiçek vardı...",
      kategori: "Dram",
      icon: "flower",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 0,
    },
    {
      id: 316,
      baslik: "Yanlış Doz",
      onizleme: "Bir doktor art arda birkaç gün aynı haberi okudu, bir gerçeği fark etti...",
      kategori: "Dram",
      icon: "pill",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
    },
    {
      id: 317,
      baslik: "Değişen Güzergah",
      onizleme: "Bir ülkenin veliahtı ve eşi bir şehir ziyaretindeydi. O gün o araçta olup, o yola sapmasalardı...",
      kategori: "Tarih",
      icon: "castle",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
    },
    {
      id: 318,
      baslik: "Buzul Mağarası",
      onizleme: "İki adam bir mağarada ölü bulundu. İkisinin de kafasında delik vardı...",
      kategori: "Gizem",
      icon: "snowflake",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
    },
    {
      id: 319,
      baslik: "Aynadaki Not",
      onizleme: "Bir adam bir sabah uyandı, tuvalete gitti, aynaya baktı ve hemen ölüm vasiyetini yazmaya başladı...",
      kategori: "Dram",
      icon: "mirror",
      tahminiSure: "8-12 dk",
      oynayanSayisi: 0,
    },
    {
      id: 320,
      baslik: "Cenazedeki Bakış",
      onizleme: "Bir kadın, annesinin cenazesinde tanımadığı bir adamı gördü. Birkaç gün sonra kız kardeşi hayatını kaybetti...",
      kategori: "Cinayet",
      icon: "grave-stone",
      tahminiSure: "9-13 dk",
      oynayanSayisi: 0,
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
