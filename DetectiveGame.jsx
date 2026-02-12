import { off, onValue, ref, remove, set, update } from 'firebase/database';
import { Brain, CheckCircle, Clock, HelpCircle, Lightbulb, Sparkles, Users } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { database } from './firebaseConfig';

// ============================================================
// HIKAYE VERİLERİ
// ============================================================
const stories = {
  kolay: [
    {
      id: 1,
      baslik: "Kayıp Yüzük",
      baslangic: "Bir kadın evinde kaybettiği değerli yüzüğü arıyor. Yüzük bulunduğunda kadın çok mutlu oluyor ama hemen ardından polisi arıyor.",
      cevap: "Yüzük bulaşık makinesinde bulunmuştur. Kadın yüzüğü çıkarırken makinede bir el parmağı görür ve kocasının başına bir şey geldiğini anlar.",
      ipuclari: [
        "Yüzük bir ev aletinin içinde bulundu",
        "Kadın yüzükle birlikte başka bir şey de buldu",
        "Bulunan şey kadını korkuttu"
      ]
    },
    {
      id: 2,
      baslik: "Garip Teslimat",
      baslangic: "Bir adam her gün aynı saatte kapısına gelen kurye karşısında şok olur ve polisi arar.",
      cevap: "Adam ölü kardeşinin organlarını bağışlamıştı. Kurye her gün kan tahlili için geliyordu ama adam kurye çantasında kardeşinin ismini görünce kurye çantasında kardeşinin organlarının geldiğini sanmıştı.",
      ipuclari: [
        "Kurye bir sağlık kuruluşundan geliyordu",
        "Adam yakın zamanda birini kaybetmişti",
        "Kargoda bir isim etiketi vardı"
      ]
    }
  ],
  orta: [
    {
      id: 3,
      baslik: "Geceyarısı Telefonu",
      baslangic: "Bir adam her gece saat 3'te telefonu çaldığında açıyor, hiçbir şey söylemiyor ve kapıyor. Bu durum 3 gün sürdükten sonra polise gidiyor.",
      cevap: "Adam bir kalp nakli olmuştu. Telefon eden kişi, kalbini bağışlayan kişinin eşiydi. Kalbin hala attığını duymak için arayıp sadece dinliyordu.",
      ipuclari: [
        "Adam yakın zamanda büyük bir ameliyat geçirmişti",
        "Arayan kişi birini kaybetmişti",
        "Telefonda ses yoktu ama bir şeyi 'duymak' istiyordu"
      ]
    }
  ],
  zor: [
    {
      id: 4,
      baslik: "İntihar Eden Adam",
      baslangic: "Bir adam bir otelin 10. katındaki odasında intihar etti. Cesedi binanın tam önünde bulundu. Odasında açık bir pencere vardı ama adam pencereden atlamadı.",
      cevap: "Adam odasında bir tabanca ile kendini vurdu. Ama kurşun kör bir kurşundu (boş). Adam bunun şok etkisiyle yine de geri tepti ve açık pencereden düştü.",
      ipuclari: [
        "Adam bir silah kullandı",
        "Silah ölümcül değildi",
        "Adamın tepkisi onu pencereden düşürdü"
      ]
    }
  ]
};

// ============================================================
// YARDIMCI FONKSİYONLAR
// ============================================================
const generateRoomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// ANA KOMPONENT
// ============================================================
const DetectiveGame = () => {
  // --- Genel State ---
  const [gameState, setGameState] = useState('menu');
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [currentStory, setCurrentStory] = useState(null);

  // --- AI Modu State ---
  const [messages, setMessages] = useState([]);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // --- Reader Modu State ---
  const [showAnswer, setShowAnswer] = useState(false);

  // --- Online Mod State ---
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [onlineMessages, setOnlineMessages] = useState([]);
  const [onlineQuestionInput, setOnlineQuestionInput] = useState('');
  const [onlineAnswerInput, setOnlineAnswerInput] = useState('');
  const [onlineHintsUsed, setOnlineHintsUsed] = useState(0);
  const [joinError, setJoinError] = useState('');
  const [onlineDifficulty, setOnlineDifficulty] = useState(null);

  // --- Refs ---
  const scrollViewRef = useRef(null);
  const roomListenerRef = useRef(null);
  const messagesListenerRef = useRef(null);

  // ============================================================
  // CLEANUP
  // ============================================================
  const removeListeners = () => {
    if (roomListenerRef.current) {
      off(roomListenerRef.current);
      roomListenerRef.current = null;
    }
    if (messagesListenerRef.current) {
      off(messagesListenerRef.current);
      messagesListenerRef.current = null;
    }
  };

  useEffect(() => {
    return () => removeListeners();
  }, []);

  // ============================================================
  // ONLINE MOD: Firebase Dinleme
  // ============================================================
  const startListening = (code) => {
    removeListeners();

    const roomRefPath = ref(database, `rooms/${code}`);
    roomListenerRef.current = roomRefPath;

    onValue(roomRefPath, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        // Oda silindi
        removeListeners();
        setGameState('menu');
        return;
      }
      setRoomData(data);
      setCurrentStory(data.story);
      setDifficulty(data.difficulty);
      setOnlineHintsUsed(data.hintsUsed || 0);

      if (data.status === 'playing') {
        setGameState('online_playing');
      } else if (data.status === 'solved') {
        setGameState('online_solved');
      }
    });

    const messagesRefPath = ref(database, `rooms/${code}/messages`);
    messagesListenerRef.current = messagesRefPath;

    onValue(messagesRefPath, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgArray = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setOnlineMessages(msgArray);
      } else {
        setOnlineMessages([]);
      }
    });
  };

  // ============================================================
  // ONLINE MOD: Oda Oluştur (Host)
  // ============================================================
  const createRoom = async () => {
    if (!playerName.trim() || !onlineDifficulty) return;

    const code = generateRoomCode();
    const storyList = stories[onlineDifficulty];
    const randomStory = storyList[Math.floor(Math.random() * storyList.length)];

    setRoomCode(code);
    setIsHost(true);
    setCurrentStory(randomStory);
    setOnlineMessages([]);
    setOnlineHintsUsed(0);

    await set(ref(database, `rooms/${code}`), {
      host: playerName.trim(),
      guest: null,
      status: 'waiting',
      difficulty: onlineDifficulty,
      story: randomStory,
      hintsUsed: 0,
      createdAt: Date.now()
    });

    await set(ref(database, `rooms/${code}/messages/msg_0`), {
      type: 'story',
      content: randomStory.baslangic,
      timestamp: Date.now()
    });

    setGameState('waiting');
    startListening(code);
  };

  // ============================================================
  // ONLINE MOD: Odaya Katıl (Guest)
  // ============================================================
  const joinRoom = async () => {
    if (!playerName.trim() || inputRoomCode.length !== 6) return;
    setJoinError('');
    setIsLoading(true);

    const code = inputRoomCode.trim();

    onValue(ref(database, `rooms/${code}`), (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setJoinError('Oda bulunamadı. Kodu kontrol et.');
        setIsLoading(false);
        return;
      }

      if (data.guest) {
        setJoinError('Oda dolu. Başka bir oda dene.');
        setIsLoading(false);
        return;
      }

      // Odaya katıl
      setIsHost(false);
      setRoomCode(code);
      setCurrentStory(data.story);
      setDifficulty(data.difficulty);
      setOnlineMessages([]);
      setOnlineHintsUsed(0);

      update(ref(database, `rooms/${code}`), {
        guest: playerName.trim(),
        status: 'playing'
      });

      setIsLoading(false);
      setGameState('waiting');
      startListening(code);
    }, { once: true });
  };

  // ============================================================
  // ONLINE MOD: Soru Gönder (Guest)
  // ============================================================
  const sendOnlineQuestion = async () => {
    if (!onlineQuestionInput.trim()) return;

    const msgKey = `msg_${Date.now()}`;
    await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), {
      type: 'question',
      content: onlineQuestionInput.trim(),
      sender: playerName,
      timestamp: Date.now()
    });

    setOnlineQuestionInput('');
  };

  // ============================================================
  // ONLINE MOD: Cevap Ver (Host)
  // ============================================================
  const sendOnlineAnswer = async (answer) => {
    const msgKey = `msg_${Date.now()}`;
    await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), {
      type: 'answer',
      content: answer,
      sender: playerName,
      timestamp: Date.now()
    });
  };

  // ============================================================
  // ONLINE MOD: İpucu Ver (Host)
  // ============================================================
  const sendOnlineHint = async () => {
    if (!currentStory || onlineHintsUsed >= currentStory.ipuclari.length) return;

    const msgKey = `msg_${Date.now()}`;
    await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), {
      type: 'hint',
      content: currentStory.ipuclari[onlineHintsUsed],
      timestamp: Date.now()
    });

    const newHints = onlineHintsUsed + 1;
    setOnlineHintsUsed(newHints);
    await update(ref(database, `rooms/${roomCode}`), { hintsUsed: newHints });
  };

  // ============================================================
  // ONLINE MOD: Cevabı Kontrol Et (Guest)
  // ============================================================
  const checkOnlineAnswer = async () => {
    if (!onlineAnswerInput.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Gerçek cevap: ${currentStory.cevap}\n\nOyuncunun cevabı: ${onlineAnswerInput}\n\nOyuncunun cevabı hikayenin özünü yakalamış mı? Sadece "DOĞRU" veya "YANLIŞ" yaz. Eğer ana fikir aynıysa (kelime kelime aynı olması gerekmiyor) DOĞRU yaz.`
          }]
        })
      });

      const data = await response.json();
      const result = data.content[0].text.trim();

      if (result.includes('DOĞRU')) {
        const msgKey = `msg_${Date.now()}`;
        await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), {
          type: 'solved',
          content: `🎉 "${onlineAnswerInput.trim()}" - Doğru cevap!`,
          sender: playerName,
          timestamp: Date.now()
        });
        await update(ref(database, `rooms/${roomCode}`), { status: 'solved' });
      } else {
        const msgKey = `msg_${Date.now()}`;
        await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), {
          type: 'wrong',
          content: `❌ "${onlineAnswerInput.trim()}" - Yanlış, tekrar dene!`,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      const msgKey = `msg_${Date.now()}`;
      await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), {
        type: 'wrong',
        content: 'Bir hata oluştu, tekrar dene.',
        timestamp: Date.now()
      });
    }

    setIsLoading(false);
    setOnlineAnswerInput('');
  };

  // ============================================================
  // ONLINE MOD: Odadan Çıkış
  // ============================================================
  const leaveRoom = async () => {
    removeListeners();

    if (isHost && roomCode) {
      await remove(ref(database, `rooms/${roomCode}`));
    }

    setRoomCode('');
    setInputRoomCode('');
    setRoomData(null);
    setOnlineMessages([]);
    setOnlineHintsUsed(0);
    setCurrentStory(null);
    setIsHost(false);
    setJoinError('');
    setGameState('menu');
    setGameMode(null);
  };

  // ============================================================
  // AI MOD: Oyun başlatma
  // ============================================================
  const startGame = (diff, mode = 'ai') => {
    const storyList = stories[diff];
    const randomStory = storyList[Math.floor(Math.random() * storyList.length)];

    setDifficulty(diff);
    setCurrentStory(randomStory);
    setGameMode(mode);

    if (mode === 'reader') {
      setGameState('reader_playing');
      setShowAnswer(false);
    } else {
      setGameState('playing');
      setMessages([{ type: 'story', content: randomStory.baslangic }]);
    }

    setStartTime(Date.now());
    setQuestionsAsked(0);
    setHintsUsed(0);
  };

  // ============================================================
  // AI MOD: Soru Sor
  // ============================================================
  const askQuestion = async () => {
    if (!questionInput.trim() || isLoading) return;

    const newMessages = [...messages, { type: 'question', content: questionInput }];
    setMessages(newMessages);
    setQuestionsAsked(prev => prev + 1);
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Sen bir hikaye tamamlama oyununda yardımcı yapay zekasın. İşte hikaye:\n\nBaşlangıç: ${currentStory.baslangic}\nGerçek Cevap: ${currentStory.cevap}\n\nOyuncu şu soruyu sordu: "${questionInput}"\n\nBu soruya sadece şu şekillerde cevap ver:\n- "Evet" (soru doğru bir yöne gidiyorsa)\n- "Hayır" (soru yanlış yönde)\n- "Alakasız" (soru hikayle alakalı değil)\n\nSADECE bu üç kelimeden birini yaz, başka hiçbir şey ekleme.`
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.content[0].text.trim();
      setMessages([...newMessages, { type: 'answer', content: aiResponse }]);
    } catch (error) {
      setMessages([...newMessages, { type: 'answer', content: 'Hayır' }]);
    }

    setIsLoading(false);
    setQuestionInput('');
  };

  // ============================================================
  // AI MOD: İpucu
  // ============================================================
  const getHint = () => {
    if (hintsUsed >= currentStory?.ipuclari.length) return;
    setMessages([...messages, { type: 'hint', content: currentStory.ipuclari[hintsUsed] }]);
    setHintsUsed(prev => prev + 1);
  };

  // ============================================================
  // AI MOD: Cevap Kontrol
  // ============================================================
  const checkAnswer = async () => {
    if (!answerInput.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Gerçek cevap: ${currentStory.cevap}\n\nOyuncunun cevabı: ${answerInput}\n\nOyuncunun cevabı hikayenin özünü yakalamış mı? Sadece "DOĞRU" veya "YANLIŞ" yaz. Eğer ana fikir aynıysa (kelime kelime aynı olması gerekmiyor) DOĞRU yaz.`
          }]
        })
      });

      const data = await response.json();
      const result = data.content[0].text.trim();

      if (result.includes('DOĞRU')) {
        setGameState('solved');
      } else {
        setMessages([...messages, { type: 'wrong', content: 'Yanlış cevap! Tekrar dene veya daha fazla soru sor.' }]);
      }
    } catch (error) {
      setMessages([...messages, { type: 'wrong', content: 'Bir hata oluştu, tekrar dene.' }]);
    }

    setIsLoading(false);
    setAnswerInput('');
  };

  // ============================================================
  // Süre formatı
  // ============================================================
  const formatTime = () => {
    if (!startTime) return '0:00';
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================
  // EKRANLAR
  // ============================================================

  // --- ANA MENU ---
  if (gameState === 'menu') {
    return (
      <SafeAreaView className="flex-1 bg-amber-50">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, justifyContent: 'center', minHeight: '100%' }}>
          <View className="items-center mb-10">
            <View className="flex-row items-center gap-3 mb-4">
              <Brain color="#92400e" size={56} strokeWidth={1.5} />
              <Text className="text-5xl font-bold text-amber-900" style={{ fontFamily: 'serif' }}>
                Dedektif
              </Text>
            </View>
            <Text className="text-lg text-amber-800 text-center leading-relaxed" style={{ fontFamily: 'serif' }}>
              Gizemli hikayeleri çöz, sorular sor, gerçeği ortaya çıkar
            </Text>
          </View>

          <View className="bg-white/80 rounded-3xl p-5 mb-4">
            <Text className="text-xl font-semibold text-amber-900 mb-4" style={{ fontFamily: 'serif' }}>
              Oyun Modu Seç
            </Text>

            <TouchableOpacity
              onPress={() => { setGameMode('ai'); setGameState('difficulty'); }}
              className="bg-purple-600 p-5 rounded-xl mb-3 shadow-md"
            >
              <View className="flex-row items-center gap-3">
                <Sparkles color="white" size={28} />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">🤖 Yapay Zeka Modu</Text>
                  <Text className="text-xs text-purple-100 mt-0.5">Tek başına AI ile oyna</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setGameMode('reader'); setGameState('reader_difficulty'); }}
              className="bg-amber-600 p-5 rounded-xl mb-3 shadow-md"
            >
              <View className="flex-row items-center gap-3">
                <Brain color="white" size={28} />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">📖 Hikaye Okuyucu</Text>
                  <Text className="text-xs text-amber-100 mt-0.5">Arkadaşlarına oku, yüz yüze oyna</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setGameMode('online'); setGameState('online_menu'); }}
              className="bg-blue-600 p-5 rounded-xl shadow-md"
            >
              <View className="flex-row items-center gap-3">
                <Users color="white" size={28} />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">🌐 Online Çok Oyunculu</Text>
                  <Text className="text-xs text-blue-100 mt-0.5">Arkadaşla oda aç veya kodla katıl</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- ONLINE MENU ---
  if (gameState === 'online_menu') {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <ScrollView className="flex-1 p-4">
          <View className="items-center mb-6 mt-6">
            <Users color="#1d4ed8" size={48} />
            <Text className="text-3xl font-bold text-blue-900 mt-3" style={{ fontFamily: 'serif' }}>
              Online Mod
            </Text>
            <Text className="text-blue-700 text-center mt-1 text-sm">Oda oluştur veya mevcut odaya katıl</Text>
          </View>

          {/* İsim */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-sm font-semibold text-blue-800 mb-2">Adın</Text>
            <TextInput
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Adını yaz..."
              placeholderTextColor="#93c5fd"
              className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-base"
            />
          </View>

          {/* Oda Oluştur */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-blue-900 mb-1">🏠 Oda Oluştur</Text>
            <Text className="text-xs text-blue-600 mb-3">Sen anlatıcı olursun, arkadaşın soru sorar</Text>

            <Text className="text-sm font-semibold text-blue-800 mb-2">Zorluk Seviyesi</Text>
            <View className="flex-row gap-2 mb-4">
              {['kolay', 'orta', 'zor'].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => setOnlineDifficulty(diff)}
                  className={`flex-1 py-2 rounded-lg border ${
                    onlineDifficulty === diff ? 'bg-blue-600 border-blue-600' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <Text className={`text-center text-xs font-semibold ${onlineDifficulty === diff ? 'text-white' : 'text-blue-800'}`}>
                    {diff === 'kolay' ? '🟢 Kolay' : diff === 'orta' ? '🟡 Orta' : '🔴 Zor'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={createRoom}
              disabled={!playerName.trim() || !onlineDifficulty}
              className={`py-3 rounded-xl ${playerName.trim() && onlineDifficulty ? 'bg-blue-600' : 'bg-blue-300'}`}
            >
              <Text className="text-white font-semibold text-center">Oda Oluştur</Text>
            </TouchableOpacity>
          </View>

          {/* Odaya Katıl */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-blue-900 mb-1">🔗 Odaya Katıl</Text>
            <Text className="text-xs text-blue-600 mb-3">Arkadaşın oda kodunu yaz</Text>

            <Text className="text-sm font-semibold text-blue-800 mb-2">Oda Kodu</Text>
            <TextInput
              value={inputRoomCode}
              onChangeText={(text) => { setInputRoomCode(text); setJoinError(''); }}
              placeholder="123456"
              placeholderTextColor="#93c5fd"
              keyboardType="numeric"
              maxLength={6}
              className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-base mb-3"
            />

            {joinError ? (
              <Text className="text-red-600 text-sm mb-3">{joinError}</Text>
            ) : null}

            <TouchableOpacity
              onPress={joinRoom}
              disabled={!playerName.trim() || inputRoomCode.length !== 6 || isLoading}
              className={`py-3 rounded-xl ${playerName.trim() && inputRoomCode.length === 6 ? 'bg-green-600' : 'bg-green-300'}`}
            >
              <Text className="text-white font-semibold text-center">
                {isLoading ? 'Katılıyor...' : 'Odaya Katıl'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setGameState('menu')} className="py-3">
            <Text className="text-blue-700 text-center font-medium">← Ana Menü</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- BEKLEME EKRANI ---
  if (gameState === 'waiting') {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
          <View className="bg-white rounded-3xl p-8 shadow-sm">
            <View className="items-center mb-6">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-2xl font-bold text-blue-900 mt-4" style={{ fontFamily: 'serif' }}>
                {isHost ? 'Oda Hazır!' : 'Katılım Bekliyor...'}
              </Text>
            </View>

            {/* Oda Kodu */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-5 items-center">
              <Text className="text-sm text-blue-600 mb-1">Oda Kodu</Text>
              <Text className="text-4xl font-bold text-blue-900 tracking-widest">{roomCode}</Text>
              <Text className="text-xs text-blue-500 mt-1">Arkadaşına bu kodu ver</Text>
            </View>

            {/* Oyuncular */}
            <View className="mb-5">
              <View className="flex-row items-center gap-3 py-3 border-b border-blue-100">
                <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
                  <Text className="text-white text-sm font-bold">H</Text>
                </View>
                <Text className="text-blue-900 font-semibold flex-1">{roomData?.host || playerName}</Text>
                <Text className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Anlatıcı</Text>
              </View>

              <View className="flex-row items-center gap-3 py-3">
                {roomData?.guest ? (
                  <>
                    <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center">
                      <Text className="text-white text-sm font-bold">G</Text>
                    </View>
                    <Text className="text-blue-900 font-semibold flex-1">{roomData.guest}</Text>
                    <Text className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Dedektif</Text>
                  </>
                ) : (
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center">
                      <Text className="text-gray-500 text-sm">?</Text>
                    </View>
                    <Text className="text-gray-400 flex-1">Beklendiyor...</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Zorluk */}
            <View className="bg-blue-50 rounded-xl p-3 mb-5 flex-row items-center justify-between">
              <Text className="text-blue-700 text-sm">Zorluk</Text>
              <Text className="text-blue-900 font-semibold text-sm">
                {roomData?.difficulty === 'kolay' ? '🟢 Kolay' : roomData?.difficulty === 'orta' ? '🟡 Orta' : '🔴 Zor'}
              </Text>
            </View>

            <TouchableOpacity onPress={leaveRoom} className="py-3 border border-red-300 rounded-xl">
              <Text className="text-red-600 font-semibold text-center">Odadan Çıkış</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- ONLINE OYUN EKRANI ---
  if (gameState === 'online_playing') {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 p-3">
          {/* Header */}
          <View className="bg-blue-900/40 rounded-2xl p-3 mb-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-base font-bold text-blue-100 flex-1" style={{ fontFamily: 'serif' }}>
                {currentStory?.baslik}
              </Text>
              <View className="px-2 py-1 bg-blue-800/50 rounded-full">
                <Text className="text-blue-100 text-xs font-semibold">
                  {isHost ? '🏠 Anlatıcı' : '🔍 Dedektif'}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <Text className="text-blue-300 text-xs">
                {difficulty === 'kolay' ? '🟢 Kolay' : difficulty === 'orta' ? '🟡 Orta' : '🔴 Zor'}
              </Text>
              <Text className="text-blue-300 text-xs">👥 {roomData?.host} vs {roomData?.guest}</Text>
            </View>
          </View>

          {/* Mesajlar */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 bg-slate-800/50 rounded-2xl p-3 mb-3"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {onlineMessages.map((msg, idx) => (
              <View
                key={idx}
                className={`mb-2 p-3 rounded-xl ${
                  msg.type === 'story' ? 'bg-blue-900/40 border-l-4 border-blue-500'
                  : msg.type === 'question' ? 'bg-green-900/30 border-l-4 border-green-500'
                  : msg.type === 'answer' ? 'bg-amber-900/30 border-l-4 border-amber-500'
                  : msg.type === 'hint' ? 'bg-yellow-900/30 border-l-4 border-yellow-500'
                  : msg.type === 'wrong' ? 'bg-red-900/30 border-l-4 border-red-500'
                  : msg.type === 'solved' ? 'bg-green-900/40 border-l-4 border-green-400'
                  : 'bg-slate-700/30'
                }`}
              >
                {msg.sender && msg.type !== 'story' && (
                  <Text className="text-xs text-slate-400 mb-0.5">{msg.sender}</Text>
                )}
                <Text className="text-slate-100 text-sm leading-relaxed">{msg.content}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Input */}
          <View className="bg-slate-800/60 rounded-2xl p-3 mb-2">
            {isHost ? (
              <>
                <Text className="text-blue-200 text-xs mb-2 font-semibold">Cevabını Ver:</Text>
                <View className="flex-row gap-2 mb-2">
                  <TouchableOpacity onPress={() => sendOnlineAnswer('Evet')} className="flex-1 py-2.5 bg-green-600 rounded-lg">
                    <Text className="text-white font-bold text-center text-sm">✅ Evet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => sendOnlineAnswer('Hayır')} className="flex-1 py-2.5 bg-red-600 rounded-lg">
                    <Text className="text-white font-bold text-center text-sm">❌ Hayır</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => sendOnlineAnswer('Alakasız')} className="flex-1 py-2.5 bg-gray-600 rounded-lg">
                    <Text className="text-white font-bold text-center text-sm">➡️ A/S</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={sendOnlineHint}
                  disabled={onlineHintsUsed >= (currentStory?.ipuclari.length || 0)}
                  className={`py-2 rounded-lg border ${
                    onlineHintsUsed >= (currentStory?.ipuclari.length || 0) ? 'border-gray-600 bg-gray-800' : 'border-yellow-600 bg-yellow-900/30'
                  }`}
                >
                  <Text className={`font-semibold text-center text-sm ${
                    onlineHintsUsed >= (currentStory?.ipuclari.length || 0) ? 'text-gray-500' : 'text-yellow-200'
                  }`}>
                    💡 İpucu Ver ({onlineHintsUsed}/{currentStory?.ipuclari.length || 0})
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-green-200 text-xs mb-1.5 font-semibold">Soru Sor:</Text>
                <View className="flex-row gap-2 mb-2">
                  <TextInput
                    value={onlineQuestionInput}
                    onChangeText={setOnlineQuestionInput}
                    placeholder="Evet/Hayır sorusu yaz..."
                    placeholderTextColor="#64748b"
                    className="flex-1 px-3 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-slate-100 text-sm"
                    onSubmitEditing={sendOnlineQuestion}
                  />
                  <TouchableOpacity onPress={sendOnlineQuestion} className="px-4 py-2.5 bg-green-600 rounded-lg">
                    <Text className="text-white font-semibold text-sm">Sor</Text>
                  </TouchableOpacity>
                </View>

                <Text className="text-amber-200 text-xs mb-1.5 font-semibold">Cevabını Yaz:</Text>
                <View className="flex-row gap-2">
                  <TextInput
                    value={onlineAnswerInput}
                    onChangeText={setOnlineAnswerInput}
                    placeholder="Hikayenin cevabını yaz..."
                    placeholderTextColor="#64748b"
                    className="flex-1 px-3 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-slate-100 text-sm"
                    onSubmitEditing={checkOnlineAnswer}
                  />
                  <TouchableOpacity onPress={checkOnlineAnswer} disabled={isLoading} className="px-4 py-2.5 bg-amber-600 rounded-lg">
                    <Text className="text-white font-semibold text-sm">{isLoading ? '...' : '✓'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity onPress={leaveRoom} className="py-2 border border-red-800 rounded-lg">
            <Text className="text-red-400 font-semibold text-center text-sm">← Odadan Çıkış</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- ONLINE ÇÖZÜLDÜ ---
  if (gameState === 'online_solved') {
    return (
      <SafeAreaView className="flex-1 bg-green-50">
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
          <View className="bg-white/90 rounded-3xl p-8 shadow-sm">
            <View className="items-center mb-6">
              <CheckCircle color="#16a34a" size={80} strokeWidth={1.5} />
              <Text className="text-3xl font-bold text-green-900 mt-3" style={{ fontFamily: 'serif' }}>Tebrikler! 🎉</Text>
              <Text className="text-base text-green-800 mt-1 text-center">Hikaye başarıyla çözüldü!</Text>
            </View>

            <View className="bg-green-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-green-800 font-semibold text-sm">Anlatıcı</Text>
                <Text className="text-green-900 font-bold">{roomData?.host}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-green-800 font-semibold text-sm">Dedektif</Text>
                <Text className="text-green-900 font-bold">{roomData?.guest}</Text>
              </View>
            </View>

            <View className="bg-amber-50 rounded-2xl p-5 mb-5 border border-amber-200">
              <Text className="font-bold text-amber-900 mb-2">📖 Tam Hikaye:</Text>
              <Text className="text-amber-800 leading-relaxed text-sm">{currentStory?.cevap}</Text>
            </View>

            <TouchableOpacity
              onPress={() => { leaveRoom(); }}
              className="bg-green-600 py-3 rounded-xl mb-3"
            >
              <Text className="text-white font-semibold text-center">Ana Menü</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- ZORLUK SEÇİMİ (AI) ---
  if (gameState === 'difficulty') {
    return (
      <SafeAreaView className="flex-1 bg-amber-50">
        <ScrollView className="flex-1 p-4">
          <View className="items-center mb-8 mt-8">
            <Text className="text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'serif' }}>Zorluk Seç</Text>
            <Text className="text-amber-700 text-sm">Hangi seviyede oynamak istersin?</Text>
          </View>

          {[
            { key: 'kolay', label: '🟢 Kolay', sub: 'Başlangıç seviyesi', border: 'border-green-400', textMain: 'text-green-900', textSub: 'text-green-700' },
            { key: 'orta', label: '🟡 Orta', sub: 'Biraz düşünmen gerekecek', border: 'border-orange-400', textMain: 'text-orange-900', textSub: 'text-orange-700' },
            { key: 'zor', label: '🔴 Zor', sub: 'Gerçek dedektifler için', border: 'border-red-400', textMain: 'text-red-900', textSub: 'text-red-700' }
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => startGame(item.key, 'ai')}
              className={`bg-white p-5 rounded-2xl mb-3 border-2 ${item.border}`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className={`text-xl font-bold ${item.textMain}`}>{item.label}</Text>
                  <Text className={`text-sm mt-0.5 ${item.textSub}`}>{item.sub}</Text>
                </View>
                <Text className="text-3xl text-gray-400">→</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => setGameState('menu')} className="mt-4 p-3">
            <Text className="text-amber-700 text-center font-medium">← Geri Dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- ZORLUK SEÇİMİ (Reader) ---
  if (gameState === 'reader_difficulty') {
    return (
      <SafeAreaView className="flex-1 bg-amber-50">
        <ScrollView className="flex-1 p-4">
          <View className="items-center mb-8 mt-8">
            <Text className="text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'serif' }}>Zorluk Seç</Text>
            <Text className="text-amber-700 text-center text-sm">Arkadaşların için hangi zorlukta hikaye?</Text>
          </View>

          {[
            { key: 'kolay', label: '🟢 Kolay', sub: 'Başlangıç seviyesi', border: 'border-green-400', textMain: 'text-green-900', textSub: 'text-green-700' },
            { key: 'orta', label: '🟡 Orta', sub: 'Biraz düşünmeleri gerekecek', border: 'border-orange-400', textMain: 'text-orange-900', textSub: 'text-orange-700' },
            { key: 'zor', label: '🔴 Zor', sub: 'Gerçek dedektifler için', border: 'border-red-400', textMain: 'text-red-900', textSub: 'text-red-700' }
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => startGame(item.key, 'reader')}
              className={`bg-white p-5 rounded-2xl mb-3 border-2 ${item.border}`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className={`text-xl font-bold ${item.textMain}`}>{item.label}</Text>
                  <Text className={`text-sm mt-0.5 ${item.textSub}`}>{item.sub}</Text>
                </View>
                <Text className="text-3xl text-gray-400">→</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => setGameState('menu')} className="mt-4 p-3">
            <Text className="text-amber-700 text-center font-medium">← Geri Dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- HİKAYE OKUYUCU ---
  if (gameState === 'reader_playing') {
    return (
      <SafeAreaView className="flex-1 bg-amber-50">
        <ScrollView className="flex-1 p-4">
          <View className="bg-white/80 rounded-3xl p-5 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-amber-900 flex-1" style={{ fontFamily: 'serif' }}>
                📖 {currentStory?.baslik}
              </Text>
              <View className="px-2 py-1 bg-amber-600 rounded-full">
                <Text className="text-white font-semibold text-xs">
                  {difficulty === 'kolay' ? '🟢 Kolay' : difficulty === 'orta' ? '🟡 Orta' : '🔴 Zor'}
                </Text>
              </View>
            </View>
            <Text className="text-amber-700 text-sm">Aşağıdaki hikayeyi arkadaşlarına oku!</Text>
          </View>

          <View className="bg-amber-100 rounded-3xl p-5 mb-4 border-2 border-amber-300">
            <Text className="text-3xl mb-2">📜</Text>
            <Text className="text-base font-bold text-amber-900 mb-2">Hikaye:</Text>
            <Text className="text-amber-900 text-sm leading-relaxed">{currentStory?.baslangic}</Text>
          </View>

          <View className="bg-white/80 rounded-3xl p-5 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-amber-900">🔒 Gizli Cevap</Text>
              <TouchableOpacity onPress={() => setShowAnswer(!showAnswer)} className="px-3 py-1.5 bg-amber-600 rounded-lg">
                <Text className="text-white font-semibold text-sm">{showAnswer ? '🙈 Gizle' : '👁️ Göster'}</Text>
              </TouchableOpacity>
            </View>

            {showAnswer ? (
              <View className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300">
                <Text className="text-amber-900 text-sm leading-relaxed mb-3">{currentStory?.cevap}</Text>
                <View className="mt-3 pt-3 border-t border-amber-200">
                  <Text className="font-bold text-amber-900 mb-2 text-sm">💡 İpuçları:</Text>
                  {currentStory?.ipuclari.map((ipucu, idx) => (
                    <Text key={idx} className="text-amber-800 text-sm mb-1">{idx + 1}. {ipucu}</Text>
                  ))}
                </View>
              </View>
            ) : (
              <View className="bg-amber-900 rounded-2xl p-6">
                <Text className="text-amber-100 text-center text-sm">👆 Cevabı görmek için "Göster" butonuna tıkla</Text>
              </View>
            )}
          </View>

          <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200">
            <Text className="font-bold text-blue-900 mb-2 text-sm">📝 Nasıl Oynanır?</Text>
            <Text className="text-blue-800 text-sm mb-1">1️⃣ Hikayeyi arkadaşlarına sesli oku</Text>
            <Text className="text-blue-800 text-sm mb-1">2️⃣ Evet/Hayır soruları soracaklar</Text>
            <Text className="text-blue-800 text-sm mb-1">3️⃣ Sen cevaba bakıp yanıtla</Text>
            <Text className="text-blue-800 text-sm">4️⃣ Gerekirse ipuçlarını kullan</Text>
          </View>

          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() => { setGameState('reader_difficulty'); setCurrentStory(null); setShowAnswer(false); }}
              className="flex-1 bg-green-600 p-3 rounded-xl"
            >
              <Text className="text-white font-semibold text-center text-sm">🔄 Yeni Hikaye</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setGameState('menu'); setCurrentStory(null); setShowAnswer(false); }}
              className="px-5 py-3 bg-amber-600 rounded-xl"
            >
              <Text className="text-white font-semibold text-sm">← Menü</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- AI OYUN EKRANI ---
  if (gameState === 'playing') {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 p-3">
          <View className="bg-amber-800/40 rounded-2xl p-3 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-amber-100 flex-1" style={{ fontFamily: 'serif' }}>
                {currentStory?.baslik}
              </Text>
              <View className="px-2 py-1 bg-amber-700/50 rounded-full">
                <Text className="text-amber-100 font-semibold text-xs">
                  {difficulty === 'kolay' ? '🟢' : difficulty === 'orta' ? '🟡' : '🔴'}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-row items-center gap-1">
                <HelpCircle color="#fef3c7" size={14} />
                <Text className="text-amber-200 text-xs">{questionsAsked} soru</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Lightbulb color="#fef3c7" size={14} />
                <Text className="text-amber-200 text-xs">{hintsUsed}/{currentStory?.ipuclari.length}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock color="#fef3c7" size={14} />
                <Text className="text-amber-200 text-xs">{formatTime()}</Text>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 bg-stone-900/50 rounded-2xl p-3 mb-3">
            {messages.map((msg, idx) => (
              <View
                key={idx}
                className={`mb-2 p-3 rounded-xl ${
                  msg.type === 'question' ? 'bg-amber-700/30 border-l-4 border-amber-500'
                  : msg.type === 'answer' ? 'bg-stone-800/50 border-l-4 border-orange-500'
                  : msg.type === 'hint' ? 'bg-yellow-900/30 border-l-4 border-yellow-500'
                  : msg.type === 'wrong' ? 'bg-red-900/30 border-l-4 border-red-500'
                  : 'bg-amber-800/20 border-l-4 border-amber-600'
                }`}
              >
                <Text className="text-amber-50 text-sm leading-relaxed">{msg.content}</Text>
              </View>
            ))}
            {isLoading && <Text className="text-amber-300 text-center text-sm">⚙️ Düşünüyor...</Text>}
          </ScrollView>

          <View className="bg-stone-900/50 rounded-2xl p-3 mb-2">
            <Text className="text-amber-200 mb-1.5 font-semibold text-xs">Soru Sor:</Text>
            <View className="flex-row gap-2 mb-2">
              <TextInput
                value={questionInput}
                onChangeText={setQuestionInput}
                placeholder="Olay bir evde mi geçti?"
                placeholderTextColor="#78350f"
                className="flex-1 px-3 py-2.5 bg-stone-800/50 border border-amber-700/30 rounded-xl text-amber-100 text-sm"
                onSubmitEditing={askQuestion}
              />
              <TouchableOpacity onPress={askQuestion} disabled={isLoading} className="px-4 py-2.5 bg-amber-600 rounded-xl">
                <Text className="text-white font-semibold text-sm">Sor</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-amber-200 mb-1.5 font-semibold text-xs">Cevabını Yaz:</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={answerInput}
                onChangeText={setAnswerInput}
                placeholder="Cevabını yaz..."
                placeholderTextColor="#78350f"
                className="flex-1 px-3 py-2.5 bg-stone-800/50 border border-amber-700/30 rounded-xl text-amber-100 text-sm"
                onSubmitEditing={checkAnswer}
              />
              <TouchableOpacity onPress={checkAnswer} disabled={isLoading} className="px-4 py-2.5 bg-green-600 rounded-xl">
                <Text className="text-white font-semibold text-sm">✓</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={getHint}
              disabled={hintsUsed >= currentStory?.ipuclari.length}
              className="flex-1 py-2.5 bg-yellow-700/30 rounded-xl border border-yellow-600/30"
            >
              <Text className="text-yellow-100 font-semibold text-center text-sm">
                💡 İpucu ({hintsUsed}/{currentStory?.ipuclari.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setGameState('menu'); setMessages([]); setCurrentStory(null); }}
              className="px-4 py-2.5 bg-stone-800/50 rounded-xl border border-amber-700/30"
            >
              <Text className="text-amber-200 font-semibold text-sm">← Çıkış</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- AI ÇÖZÜLDÜ ---
  if (gameState === 'solved') {
    return (
      <SafeAreaView className="flex-1 bg-green-50">
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
          <View className="bg-white/90 rounded-3xl p-8 shadow-sm">
            <View className="items-center mb-6">
              <CheckCircle color="#16a34a" size={80} strokeWidth={1.5} />
              <Text className="text-3xl font-bold text-green-900 mt-3" style={{ fontFamily: 'serif' }}>Tebrikler! 🎉</Text>
              <Text className="text-base text-green-800 mt-1">Hikayeyi başarıyla çözdün!</Text>
            </View>

            <View className="bg-green-50 rounded-2xl p-5 mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold text-green-900 text-sm">Sorduğun Soru:</Text>
                <Text className="text-xl font-bold text-green-900">{questionsAsked}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold text-green-900 text-sm">Kullanılan İpucu:</Text>
                <Text className="text-xl font-bold text-green-900">{hintsUsed}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-green-900 text-sm">Süre:</Text>
                <Text className="text-xl font-bold text-green-900">{formatTime()}</Text>
              </View>
            </View>

            <View className="bg-amber-50 rounded-2xl p-5 mb-5 border border-amber-200">
              <Text className="font-bold text-amber-900 mb-2">📖 Tam Hikaye:</Text>
              <Text className="text-amber-800 leading-relaxed text-sm">{currentStory?.cevap}</Text>
            </View>

            <TouchableOpacity
              onPress={() => { setGameState('difficulty'); setMessages([]); setCurrentStory(null); }}
              className="bg-green-600 py-3 rounded-xl mb-3"
            >
              <Text className="text-white font-semibold text-center">Yeni Oyun</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setGameState('menu'); setMessages([]); setCurrentStory(null); }}
              className="py-2"
            >
              <Text className="text-green-700 font-medium text-center">Ana Menü</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
};

export default DetectiveGame;
