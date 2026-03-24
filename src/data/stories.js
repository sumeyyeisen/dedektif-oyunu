export const stories = {
    kolay: [
      {
        id: 101,
        baslik: "Sivrisinek ve Kaza",
        baslangic: "Bir sivrisinek yüzünden onlarca insan hayatını kaybetti. Bu küçücük hayvan nasıl böyle bir felakete yol açtı?",
        cevap: "Bir turist otobüsü şoförü, odasındaki sivrisinek yüzünden gece boyu uyuyamamıştı. Ertesi gün direksiyon başında uykusuzluktan sızdı ve otobüs şarampole yuvarlandı.",
        ipuclari: ["Olay bir araçta gerçekleşti", "Sivrisinek kimseyi ısırmadı", "Asıl sorun 'uykusuzluk'tu"],
        sorular: {
          "sivrisinek": { keywords: ["sivrisinek", "böcek", "haşere"], answer: "Evet" },
          "sivrisinek ısırdı": { keywords: ["ısır", "sok"], answer: "Hayır" },
          "araç": { keywords: ["araç", "otobüs", "araba", "taşıt"], answer: "Evet" },
          "kaza": { keywords: ["kaza", "çarp", "devril"], answer: "Evet" },
          "şoför": { keywords: ["şoför", "sürücü", "kaptan"], answer: "Evet" },
          "uyku": { keywords: ["uyku", "uyu", "uyuma", "yorgun", "uykusuz"], answer: "Evet" },
          "zehir": { keywords: ["zehir", "hastalık", "virüs"], answer: "Hayır" }
        }
      },
      {
        id: 102,
        baslik: "Mutfaktaki Alevler",
        baslangic: "Kadın sadece yemek yapmak istiyordu. Ama su kullandığı için feci şekilde can verdi. Su onu neden öldürdü?",
        cevap: "Kadın kızartma yaparken yağ alev aldı. Panikle yanan yağın üzerine su döktü. Su, kızgın yağla temas edince devasa bir patlama yarattı.",
        ipuclari: ["Olay mutfakta geçti", "Yanan şey normal bir ateş değildi", "Su yangını söndürmedi, büyüttü"],
        sorular: {
          "mutfak": { keywords: ["mutfak", "yemek", "pişir"], answer: "Evet" },
          "su": { keywords: ["su"], answer: "Evet" },
          "yangın": { keywords: ["yangın", "ateş", "alev"], answer: "Evet" },
          "yağ": { keywords: ["yağ", "kızart"], answer: "Evet" },
          "patlama": { keywords: ["patlama", "patla"], answer: "Evet" },
          "boğul": { keywords: ["boğul"], answer: "Hayır" },
          "zehir": { keywords: ["zehir"], answer: "Hayır" }
        }
      },
      {
        id: 103,
        baslik: "Barda Tek Kurşun",
        baslangic: "Bir kadın bara girip içki istedi. Barmen ona içki vermek yerine silahını çekip kadını vurdu. Neden?",
        cevap: "Tezgahtaki adam barmen değil, o sırada barı soyan bir hırsızdı. Kadın onu barmen sanıp sipariş verince, hırsız panikledi ve tek görgü tanığını öldürdü.",
        ipuclari: ["Adam aslında orada çalışmıyordu", "Kadın yanlış zamanda yanlış yerdeydi", "Adamın amacı hizmet etmek değildi"],
        sorular: {
          "bar": { keywords: ["bar", "içki"], answer: "Evet" },
          "barmen": { keywords: ["barmen"], answer: "Hayır" },
          "hırsız": { keywords: ["hırsız", "soygun", "soy"], answer: "Evet" },
          "silah": { keywords: ["silah", "tabanca", "vur"], answer: "Evet" },
          "tanık": { keywords: ["tanık", "gör"], answer: "Evet" },
          "çalışan": { keywords: ["çalış", "personel"], answer: "Hayır" }
        }
      },
      {
        id: 104,
        baslik: "Telefon Bağımlısı",
        baslangic: "Bir kadın telefonda çok uzun süre konuştuğu için trafik kazasında öldü. Ama telefon elinde değildi.",
        cevap: "Tamirci, kadının lastik vidalarını sıkmayı unutmuştu. Hatasını fark edip kadını defalarca aradı ama hat sürekli meşguldü. Tamirci ulaşamadan lastik fırladı.",
        ipuclari: ["Biri onu uyarmaya çalışıyordu", "Araba servisten yeni çıkmıştı", "Hattın meşgul olması ölümüne sebep oldu"],
        sorular: {
          "telefon": { keywords: ["telefon", "ara"], answer: "Evet" },
          "araba": { keywords: ["araba", "araç"], answer: "Evet" },
          "tamirci": { keywords: ["tamirci", "servis", "tamir"], answer: "Evet" },
          "lastik": { keywords: ["lastik", "tekerlek"], answer: "Evet" },
          "uyarı": { keywords: ["uyar", "haber"], answer: "Evet" },
          "meşgul": { keywords: ["meşgul"], answer: "Evet" }
        }
      },
      {
        id: 105,
        baslik: "Ucuz Lüks Araba",
        baslangic: "Bir kadın, kocasının gıcır gıcır Porsche'sini piyasa değerinin %1'ine satıyor. Araba sağlam. Neden bu kadar ucuza?",
        cevap: "Kocası o arabanın içinde intihar etmişti. Arabaya sinen çürümüş ceset kokusu ne yapılırsa yapılsın çıkmıyordu.",
        ipuclari: ["Arabanın motoru sağlam ama 'havası' bozuk", "Kimse o arabaya binmek istemiyor", "Temizlenemeyecek bir iz var"],
        sorular: {
          "araba": { keywords: ["araba", "porsche"], answer: "Evet" },
          "ölüm": { keywords: ["ölüm", "öl", "ölü"], answer: "Evet" },
          "intihar": { keywords: ["intihar"], answer: "Evet" },
          "koku": { keywords: ["koku", "koksun"], answer: "Evet" },
          "ceset": { keywords: ["ceset", "cesed"], answer: "Evet" },
          "bozuk": { keywords: ["bozuk", "arıza"], answer: "Hayır" }
        }
      },
      {
        id: 106,
        baslik: "Kehanet",
        baslangic: "Bir kadın güneşli bir sabaha uyandı, pencereden dışarı baktı ve intihar etti. Neden?",
        cevap: "Kadın bir tarikat lideriydi ve o gün kıyametin kopacağını iddia etmişti. Müritleri intihar etmişti. Sabah uyanıp dünyanın yok olmadığını görünce utancından intihar etti.",
        ipuclari: ["Kadının bir takipçi kitlesi vardı", "Beklediği şey gerçekleşmedi", "Vicdan azabı duydu"],
        sorular: {
          "tarikat": { keywords: ["tarikat", "lider", "mürit"], answer: "Evet" },
          "kıyamet": { keywords: ["kıyamet", "son"], answer: "Evet" },
          "kehanet": { keywords: ["kehanet", "tahmin"], answer: "Evet" },
          "takipçi": { keywords: ["takipçi", "mürit"], answer: "Evet" },
          "utanç": { keywords: ["utanç", "vicdan"], answer: "Evet" },
          "güneş": { keywords: ["güneş"], answer: "Alakasız" }
        }
      }
    ],
    orta: [
      {
        id: 201,
        baslik: "Asansördeki Adam",
        baslangic: "Bir adam 20. katta oturuyor. İşe giderken zemin kata iniyor ama eve dönerken asansörle 10. kata çıkıp gerisini yürüyor. Neden?",
        cevap: "Adam bir cüce. Boyu, asansör panelinde ancak 10. katın düğmesine kadar yetişebiliyor. 20. kata basamadığı için kalanını yürümek zorunda kalıyor.",
        ipuclari: ["Asansör bozuk değil", "Yağmurlu günlerde şemsiyesiyle basabiliyor", "Sorun adamın fiziksel özelliği"],
        sorular: {
          "asansör": { keywords: ["asansör", "lift"], answer: "Evet" },
          "cüce": { keywords: ["cüce", "kısa", "boy"], answer: "Evet" },
          "düğme": { keywords: ["düğme", "buton", "bas"], answer: "Evet" },
          "yürü": { keywords: ["yürü", "merdiven"], answer: "Evet" },
          "şemsiye": { keywords: ["şemsiye", "yağmur"], answer: "Evet" },
          "bozuk": { keywords: ["bozuk", "arıza"], answer: "Hayır" }
        }
      },
      {
        id: 202,
        baslik: "Deniz Feneri",
        baslangic: "Adam ışığı kapattı ve yatağına gitti. Sabah uyandığında yüzlerce insanın öldüğünü görüp intihar etti.",
        cevap: "Adam bir deniz feneri bekçisiydi. Yanlışlıkla fenerin ışığını kapattı. Karanlıkta rotasını kaybeden büyük bir gemi kayalıklara çarpıp battı.",
        ipuclari: ["Adamın işi 'ışık'la ilgiliydi", "Ölenler denizdeydi", "Bir kaza sonucu felaket oldu"],
        sorular: {
          "deniz": { keywords: ["deniz", "gemi", "tekne"], answer: "Evet" },
          "fener": { keywords: ["fener", "ışık"], answer: "Evet" },
          "bekçi": { keywords: ["bekçi", "görevli"], answer: "Evet" },
          "kapat": { keywords: ["kapat", "söndür"], answer: "Evet" },
          "kaza": { keywords: ["kaza", "çarp", "bat"], answer: "Evet" },
          "elektrik": { keywords: ["elektrik", "kesinti"], answer: "Hayır" }
        }
      },
      {
        id: 203,
        baslik: "Mısır Tarlası",
        baslangic: "Bir çiftçi tarlasında çalışırken aracı durdurdu, aşağı indi ve gördüğü şey yüzünden oracıkta canına kıydı.",
        cevap: "Çiftçi biçerdöverle mısır hasadı yapıyordu. Mısırların arasında saklambaç oynayan çocukları fark etmeyip onları ezdiğini, motor boğulunca anladı.",
        ipuclari: ["Tarlada yalnız değildi", "Araç bir şeye çarptı", "Kurbanlar çok küçüktü"],
        sorular: {
          "tarla": { keywords: ["tarla", "mısır"], answer: "Evet" },
          "çiftçi": { keywords: ["çiftçi"], answer: "Evet" },
          "biçerdöver": { keywords: ["biçerdöver", "makine"], answer: "Evet" },
          "çocuk": { keywords: ["çocuk", "küçük"], answer: "Evet" },
          "ez": { keywords: ["ez", "çarp"], answer: "Evet" },
          "saklambaç": { keywords: ["saklambaç", "oyun"], answer: "Evet" }
        }
      },
      {
        id: 204,
        baslik: "Canlı Yayın",
        baslangic: "Bir DJ canlı yayında şarkı açtı, eve gidip karısını öldürdü ve geri döndü. Şarkı bitince konuşmaya başladı ama polis onu hemen tutukladı.",
        cevap: "Şarkı plaktan değil radyodan çalıyordu. DJ yokken yayın kesildi. Radyodaki sessizlik onun o sırada stüdyoda olmadığını kanıtladı.",
        ipuclari: ["DJ kendine yalancı şahit (alibi) yaratmaya çalıştı", "Teknoloji ona ihanet etti", "Radyodaki sessizlik onu ele verdi"],
        sorular: {
          "dj": { keywords: ["dj", "radyo"], answer: "Evet" },
          "şarkı": { keywords: ["şarkı", "müzik"], answer: "Evet" },
          "yayın": { keywords: ["yayın", "canlı"], answer: "Evet" },
          "sessizlik": { keywords: ["sessizlik", "kesil"], answer: "Evet" },
          "alibi": { keywords: ["alibi", "kanıt"], answer: "Evet" },
          "plak": { keywords: ["plak"], answer: "Hayır" }
        }
      },
      {
        id: 205,
        baslik: "Yarım Senfoni",
        baslangic: "Ünlü bir orkestra şefi konserin ortasında müziği kesti, kulise gitti ve hayatına son verdi.",
        cevap: "Şef o an sağır olduğunu fark etti. Müziği duyamadığını anlayınca, hayatının anlamını yitirdiğini düşünüp intihar etti.",
        ipuclari: ["Fiziksel bir sorunu vardı", "Müzik onun her şeyiydi", "Seyirciler anlamamıştı"],
        sorular: {
          "orkestra": { keywords: ["orkestra", "müzik"], answer: "Evet" },
          "şef": { keywords: ["şef", "yönetmen"], answer: "Evet" },
          "sağır": { keywords: ["sağır", "duy", "işit"], answer: "Evet" },
          "müzik": { keywords: ["müzik", "ses"], answer: "Evet" },
          "hastalık": { keywords: ["hastalık", "rahatsız"], answer: "Evet" }
        }
      },
      {
        id: 206,
        baslik: "Arkeolog",
        baslangic: "Ünlü arkeolog, elinde paha biçilemez bir elmasla tapınağın girişinde ölü bulundu. Yara izi yoktu.",
        cevap: "Tapınağın tavanı elmasın ağırlığına bağlıydı. Elması alınca mekanizma çalıştı ve odadaki oksijeni vakumladı. Arkeolog havasızlıktan öldü.",
        ipuclari: ["Ölüm sebebi nefesle ilgili", "Bir tuzak tetiklendi", "Elması almaması gerekiyordu"],
        sorular: {
          "arkeolog": { keywords: ["arkeolog"], answer: "Evet" },
          "elmas": { keywords: ["elmas", "taş"], answer: "Evet" },
          "tapınak": { keywords: ["tapınak", "mabet"], answer: "Evet" },
          "tuzak": { keywords: ["tuzak", "mekanizma"], answer: "Evet" },
          "oksijen": { keywords: ["oksijen", "hava", "nefes"], answer: "Evet" },
          "zehir": { keywords: ["zehir"], answer: "Hayır" }
        }
      }
    ],
    zor: [
      {
        id: 301,
        baslik: "Martı Eti",
        baslangic: "Bir adam restoranda martı eti yedi, tadına baktı ve dışarı çıkıp intihar etti. Neden?",
        cevap: "Yıllar önce ıssız adada mahsur kalmışlardı. Arkadaşı ona 'martı eti' diye, ölen karısının etini yedirmişti. Gerçek martı etini tadınca gerçeği anladı.",
        ipuclari: ["Geçmişte karanlık bir anı var", "Daha önce yediği şey martı değildi", "Yamyamlık söz konusu"],
        sorular: {
          "martı": { keywords: ["martı", "kuş"], answer: "Evet" },
          "restoran": { keywords: ["restoran", "yemek"], answer: "Evet" },
          "ada": { keywords: ["ada", "mahsur"], answer: "Evet" },
          "karı": { keywords: ["karı", "eş"], answer: "Evet" },
          "yamyam": { keywords: ["yamyam", "insan eti"], answer: "Evet" },
          "zehir": { keywords: ["zehir"], answer: "Hayır" }
        }
      },
      {
        id: 302,
        baslik: "Tren Tüneli",
        baslangic: "Göz ameliyatından yeni çıkan adam trenle eve dönüyordu. Tren tünele girince adam kendini aşağı attı.",
        cevap: "Adam kördü ve ameliyat olmuştu. Bandajı çıkardığı an tren tünele girdi. Karanlığı görünce ameliyatın başarısız olduğunu sanıp umutsuzluğa kapıldı.",
        ipuclari: ["Görmekle ilgili bir sorunu vardı", "Karanlık olması normaldi", "Psikolojik bir çöküş yaşadı"],
        sorular: {
          "tren": { keywords: ["tren"], answer: "Evet" },
          "tünel": { keywords: ["tünel", "karanlık"], answer: "Evet" },
          "ameliyat": { keywords: ["ameliyat", "operasyon"], answer: "Evet" },
          "kör": { keywords: ["kör", "göz"], answer: "Evet" },
          "bandaj": { keywords: ["bandaj", "sargı"], answer: "Evet" },
          "başarısız": { keywords: ["başarısız"], answer: "Hayır" }
        }
      },
      {
        id: 303,
        baslik: "Çöldeki Kibrit",
        baslangic: "Çölün ortasında çıplak bir adam ölü bulundu. Elinde kırık bir kibrit çöpü vardı.",
        cevap: "Arkadaşlarıyla balondaydılar ve balon düşüyordu. Ağırlık atmak için soyundular, yetmeyince kura çektiler. Kısa çöpü çeken atladı.",
        ipuclari: ["Oraya yürüyerek gelmedi, düştü", "Kibrit çöpü bir kura sonucuydu", "Kıyafetleri ağırlık yapmasın diye atılmıştı"],
        sorular: {
          "çöl": { keywords: ["çöl"], answer: "Evet" },
          "balon": { keywords: ["balon", "uç"], answer: "Evet" },
          "düş": { keywords: ["düş", "atla"], answer: "Evet" },
          "kura": { keywords: ["kura", "çek"], answer: "Evet" },
          "kibrit": { keywords: ["kibrit"], answer: "Evet" },
          "çıplak": { keywords: ["çıplak", "soyun"], answer: "Evet" }
        }
      },
      {
        id: 304,
        baslik: "Kar Maskesi",
        baslangic: "Adamın yüzünde kar maskesi vardı. Radyoda çalan şarkı biter bitmez intihar etti.",
        cevap: "Adam bir soyguncuydu. Soygun sırasında elektrikler kesildi ve kör olduğunu sandı. Radyo çalınca elektrik var sandı. Spiker konuşunca gerçekten kör olduğunu anladı.",
        ipuclari: ["Adam kör olup olmadığını test ediyordu", "Radyo onun için bir umuttu", "Aslında elektrikler kesilmemişti"],
        sorular: {
          "maske": { keywords: ["maske"], answer: "Evet" },
          "soygun": { keywords: ["soygun", "hırsız"], answer: "Evet" },
          "kör": { keywords: ["kör", "göz"], answer: "Evet" },
          "elektrik": { keywords: ["elektrik"], answer: "Evet" },
          "radyo": { keywords: ["radyo"], answer: "Evet" }
        }
      },
      {
        id: 305,
        baslik: "Donmuş Çay",
        baslangic: "Soğuk bir kulübede donarak ölmüş bir adam bulundu. Ama yanındaki masada dumanı tüten sıcak bir çay vardı.",
        cevap: "Adam buz ticareti yapıyordu. Çay donmuştu. Hava aniden ısınmaya başlayınca donmuş çay çözülüp buharlaşmaya başladı (süblimleşme), sanki sıcakmış gibi göründü.",
        ipuclari: ["Çay aslında sıcak değildi", "Fiziksel bir hal değişimi var", "Adam çoktan ölmüştü"],
        sorular: {
          "çay": { keywords: ["çay"], answer: "Evet" },
          "don": { keywords: ["don", "buz"], answer: "Evet" },
          "sıcak": { keywords: ["sıcak"], answer: "Hayır" },
          "buhar": { keywords: ["buhar", "duman"], answer: "Evet" },
          "süblim": { keywords: ["süblim"], answer: "Evet" }
        }
      },
      {
        id: 306,
        baslik: "Donmuş Göl",
        baslangic: "Donmuş gölün ortasında, buz kırılmamış olmasına rağmen bir adam ölü bulundu. Etrafta ayak izi yoktu.",
        cevap: "Adam gökyüzünden düştü (muhtemelen bir uçaktan veya balondan). Buzun üzerine sertçe çakıldı.",
        ipuclari: ["Yürüyerek gelmedi", "Yukarıdan geldi", "Yer çekimi etkili oldu"],
        sorular: {
          "göl": { keywords: ["göl", "buz"], answer: "Evet" },
          "düş": { keywords: ["düş"], answer: "Evet" },
          "uçak": { keywords: ["uçak", "balon"], answer: "Evet" },
          "ayak izi": { keywords: ["ayak", "iz"], answer: "Hayır" },
          "gökyüzü": { keywords: ["gökyüzü", "yukarı"], answer: "Evet" }
        }
      },
      {
        id: 307,
        baslik: "Doğum Günü",
        baslangic: "Adama bir paket geldi. Paketi açtı, içine baktı ve intihar etti.",
        cevap: "Issız adada hayatta kalmak için sırayla kollarını kesip yemişlerdi. Bu adam hile yapıp kolunu kesmemişti. Yıllar sonra arkadaşları kesik bir kol gönderip 'borcunu' hatırlattı.",
        ipuclari: ["Paketin içinde bir uzuv vardı", "Geçmişte bir anlaşma yapmışlardı", "Adam hile yapmıştı"],
        sorular: {
          "paket": { keywords: ["paket", "kutu"], answer: "Evet" },
          "kol": { keywords: ["kol", "uzuv"], answer: "Evet" },
          "ada": { keywords: ["ada", "mahsur"], answer: "Evet" },
          "yamyam": { keywords: ["yamyam", "ye"], answer: "Evet" },
          "hile": { keywords: ["hile", "aldatma"], answer: "Evet" }
        }
      },
      {
        id: 308,
        baslik: "Kayıp Dağcı",
        baslangic: "Bir grup dağcı sığınakta sabahladı. Sabah biri ölü bulundu, vücudu morluk içindeydi ama kimse saldırmamıştı.",
        cevap: "Gece donmamak için 'köşe kapmaca' oynamışlardı. Herkes bir köşeden diğerine koşup arkadaşına dokunacaktı. Ama gruptan biri eksilince (ölünce), karanlıkta fazladan bir 'şey' oyuna dahil olmuştu.",
        ipuclari: ["Gece uyumadılar, hareket ettiler", "Sayıları tutmuyordu", "Doğaüstü veya halüsinasyon olabilir"],
        sorular: {
          "dağ": { keywords: ["dağ", "dağcı"], answer: "Evet" },
          "oyun": { keywords: ["oyun", "kapmaca"], answer: "Evet" },
          "don": { keywords: ["don", "soğuk"], answer: "Evet" },
          "fazladan": { keywords: ["fazla", "ekstra"], answer: "Evet" },
          "doğaüstü": { keywords: ["doğaüstü", "hayalet"], answer: "Evet" }
        }
      }
    ]
  };
