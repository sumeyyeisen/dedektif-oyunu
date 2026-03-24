import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from './src/config/firebaseConfig';
import { stories } from './src/data/stories';
import { loadRandomStory, loadStory } from './src/data/stories/storyLoader';
import AchievementsScreen from './src/features/achievements/components/AchievementsScreen';
import NotesPanel from './src/features/game/components/NotesPanel';
import QuestionHistoryPanel from './src/features/game/components/QuestionHistoryPanel';
import StorySelectionScreen from './src/features/game/components/StorySelectionScreen';
import SettingsScreen from './src/features/settings/components/SettingsScreen';
import StatsScreen from './src/features/stats/components/StatsScreen';
import AchievementNotification from './src/shared/components/AchievementNotification';
import { checkAchievements } from './src/shared/utils/achievementManager';
import { validatePlayerName, validateRoomCode } from './src/shared/utils/errorHandler';
import { playAchievementSound, playErrorSound, playHintSound, playMessageSound, playSuccessSound } from './src/shared/utils/soundManager';
import { getSettings, markStoryCompleted } from './src/shared/utils/storageManager';

// Font ve İkon Paketleri
import { SpecialElite_400Regular, useFonts } from '@expo-google-fonts/special-elite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const generateRoomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const DetectiveGame = () => {
  let [fontsLoaded] = useFonts({ 'SpecialElite': SpecialElite_400Regular });

  const [gameState, setGameState] = useState('menu');
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [currentStory, setCurrentStory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [showAnswer, setShowAnswer] = useState(false);
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
  const [guestList, setGuestList] = useState([]);
  
  // Yeni özellikler için state'ler
  const [notes, setNotes] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [showAchievementNotif, setShowAchievementNotif] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  
  // Ayarlar state'i
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    vibrationEnabled: true,
    darkMode: true,
    language: 'tr',
    fontSize: 'medium',
    showTimer: true,
    hintLimit: 'unlimited',
    notificationsEnabled: true,
  });

  const scrollViewRef = useRef(null);
  const roomListenerRef = useRef(null);
  const messagesListenerRef = useRef(null);
  const confettiRef = useRef(null);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getSettings();
        if (savedSettings) {
          setSettings(prev => ({ ...prev, ...savedSettings }));
        }
      } catch (error) {
        console.error('Ayarlar yüklenemedi:', error);
      }
    };
    loadSettings();
  }, []);
  
  // Ayarlar değiştiğinde soundManager'ı güncelle
  useEffect(() => {
    const { updateSoundSettings } = require('./src/shared/utils/soundManager');
    updateSoundSettings(settings);
  }, [settings]);

  useEffect(() => {
    let interval = null;
    if (gameState === 'playing' || gameState === 'online_playing') {
      interval = setInterval(() => { setNow(Date.now()); }, 1000);
    } else { clearInterval(interval); }
    return () => clearInterval(interval);
  }, [gameState]);

  // Android back button yönetimi
  useEffect(() => {
    if (Platform.OS !== 'android') return; // Sadece Android'de çalışır
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (gameState === 'playing' || gameState === 'online_playing') {
        confirmLeave();
        return true; // Event'i yakala
      }
      if (gameState === 'waiting') {
        confirmLeave();
        return true;
      }
      if (gameState !== 'menu') {
        setGameState('menu');
        return true;
      }
      return false; // Uygulamadan çık
    });

    return () => backHandler.remove();
  }, [gameState]);

  // Firebase listener cleanup on unmount
  useEffect(() => {
    return () => {
      removeListeners(); // Component unmount olduğunda listener'ları temizle
    };
  }, []);

  const formatTime = () => {
    if (!startTime) return '0:00';
    const seconds = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Font boyutu helper
  const getFontSize = (baseSize) => {
    const multipliers = { small: 0.85, medium: 1, large: 1.2 };
    return baseSize * (multipliers[settings.fontSize] || 1);
  };

  // ============================================================
  // OFFLINE SORU-CEVAP SİSTEMİ (AI yerine)
  // ============================================================

  const askOffline = (userQuestion) => {
    console.log('askOffline called with:', userQuestion);
    console.log('currentStory:', currentStory);
    console.log('currentStory.sorular:', currentStory?.sorular);
    
    if (!currentStory?.sorular) {
      console.log('No sorular found, returning Alakasız');
      return "Alakasız";
    }
    
    const question = userQuestion.toLowerCase().trim();
    console.log('Processed question:', question);
    
    // Hikayenin soru-cevap veritabanını kontrol et
    for (const [key, data] of Object.entries(currentStory.sorular)) {
      for (const keyword of data.keywords) {
        // Regex veya basit string match
        const regex = new RegExp(keyword, 'i');
        if (regex.test(question)) {
          console.log('Match found! keyword:', keyword, 'answer:', data.answer);
          return data.answer;
        }
      }
    }
    
    // Hiçbir keyword eşleşmezse
    console.log('No match found, returning Alakasız');
    return "Alakasız";
  };

  const checkOfflineAnswer = (userGuess) => {
    if (!currentStory?.cevap) return 'YANLIŞ';
    
    const guess = userGuess.toLowerCase().trim();
    const solution = currentStory.cevap.toLowerCase();
    
    // Ana kelimeleri çıkar
    const solutionWords = solution.split(/\s+/).filter(w => w.length > 3);
    const guessWords = guess.split(/\s+/).filter(w => w.length > 3);
    
    // Eşleşen kelime sayısı
    let matchCount = 0;
    for (const word of guessWords) {
      if (solutionWords.some(sw => sw.includes(word) || word.includes(sw))) {
        matchCount++;
      }
    }
    
    // %40'tan fazla eşleşme varsa doğru kabul et
    const matchRatio = matchCount / Math.max(solutionWords.length, guessWords.length);
    return matchRatio > 0.4 ? 'DOĞRU' : 'YANLIŞ';
  };

  const askQuestion = async () => {
    if (!questionInput.trim() || isLoading) return;
    
    const question = questionInput.trim(); // Değeri kaydet
    const newMessages = [...messages, { type: 'question', content: question }];
    setMessages(newMessages); 
    setIsLoading(true); 
    setQuestionInput(''); 
    setQuestionsAsked(prev => prev + 1);
    
    // Mesaj sesi
    await playMessageSound();
    
    // Offline cevap ver
    setTimeout(() => {
      try {
        const aiResponse = askOffline(question); // Kaydedilen değeri kullan
        setMessages(curr => [...curr, { type: 'answer', content: aiResponse }]);
      } catch (error) {
        console.error('askQuestion error:', error);
        setMessages(curr => [...curr, { type: 'answer', content: 'Alakasız' }]);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const checkAnswer = async () => {
    if (!answerInput.trim() || isLoading) return;
    
    const answer = answerInput.trim(); // Değeri kaydet
    setIsLoading(true);
    
    // Offline kontrol et
    setTimeout(async () => {
      try {
        const result = checkOfflineAnswer(answer); // Kaydedilen değeri kullan
        if (result === 'DOĞRU') {
          // Başarı sesi + confetti
          await playSuccessSound();
          if (confettiRef.current) {
            confettiRef.current.start();
          }
          
          // Oyun istatistiklerini hesapla
          const gameTime = Math.floor((Date.now() - startTime) / 1000); // saniye
          const stats = {
            time: gameTime,
            hintsUsed: hintsUsed,
            difficulty: difficulty,
            completedAt: Date.now(),
          };
          
          // Storage'a kaydet
          await markStoryCompleted(currentStory.id, stats);
          
          // Başarımları kontrol et
          const achievements = await checkAchievements();
          if (achievements.length > 0) {
            // İlk başarımı göster
            setNewAchievement(achievements[0]);
            setShowAchievementNotif(true);
            await playAchievementSound();
          }
          
          setGameState('solved'); 
        } else { 
          await playErrorSound();
          setMessages(curr => [...curr, { type: 'wrong', content: `❌ "${answer}" yanlış cevap.` }]); 
        }
      } catch (error) {
        console.error('checkAnswer error:', error);
        setMessages(curr => [...curr, { type: 'wrong', content: `❌ Bir hata oluştu.` }]);
      } finally {
        setIsLoading(false); 
        setAnswerInput('');
      }
    }, 500);
  };

  // ... (Firebase Functions) ...
  const createRoom = async () => {
    // Validation
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      Alert.alert('Hata', nameValidation.error);
      return;
    }
    if (!onlineDifficulty) {
      Alert.alert('Hata', 'Lütfen zorluk seviyesi seçin');
      return;
    }
    
    try {
      const code = generateRoomCode();
      const storyList = stories[onlineDifficulty];
      const randomStory = storyList[Math.floor(Math.random() * storyList.length)];
      setRoomCode(code); setIsHost(true); setCurrentStory(randomStory);
      setOnlineMessages([]); setOnlineHintsUsed(0); setGuestList([]);
      await set(ref(database, `rooms/${code}`), { 
        host: playerName.trim(), 
        guests: {}, 
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
    } catch (error) {
      console.error('createRoom error:', error);
      Alert.alert('Hata', 'Oda oluşturulamadı. Lütfen tekrar deneyin.');
    }
  };

  const joinRoom = async () => {
    // Validation
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      setJoinError(nameValidation.error);
      return;
    }
    
    const codeValidation = validateRoomCode(inputRoomCode);
    if (!codeValidation.valid) {
      setJoinError(codeValidation.error);
      return;
    }
    
    setJoinError(''); 
    setIsLoading(true);
    const code = inputRoomCode.trim();
    
    try {
      onValue(ref(database, `rooms/${code}`), async (snapshot) => {
        const data = snapshot.val();
        if (!data) { 
          setJoinError('Oda bulunamadı.'); 
          setIsLoading(false); 
          return; 
        }
        setIsHost(false); 
        setRoomCode(code); 
        setCurrentStory(data.story);
        setDifficulty(data.difficulty); 
        setOnlineMessages([]); 
        setOnlineHintsUsed(0);
        const newGuestRef = push(ref(database, `rooms/${code}/guests`));
        await set(newGuestRef, { name: playerName.trim(), joinedAt: Date.now() });
        setIsLoading(false); 
        setGameState('waiting'); 
        startListening(code);
      }, { once: true });
    } catch (error) {
      console.error('joinRoom error:', error);
      setJoinError('Odaya katılılamadı. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  };

  const startListening = (code) => {
    removeListeners();
    
    const roomRefPath = ref(database, `rooms/${code}`);
    const messagesRefPath = ref(database, `rooms/${code}/messages`);
    
    // Room listener
    const roomUnsubscribe = onValue(roomRefPath, (snapshot) => {
      const data = snapshot.val();
      if (!data) { 
        removeListeners(); 
        setGameState('menu'); 
        return; 
      }
      setRoomData(data); 
      setCurrentStory(data.story); 
      setDifficulty(data.difficulty); 
      setOnlineHintsUsed(data.hintsUsed || 0);
      if (data.guests) setGuestList(Object.values(data.guests)); 
      else setGuestList([]);
      if (data.status === 'playing' && gameState !== 'online_playing') { 
        setGameState('online_playing'); 
        if (!startTime) setStartTime(Date.now()); 
      }
      else if (data.status === 'solved') setGameState('online_solved');
    }, (error) => {
      console.error('Room listener error:', error);
      Alert.alert('Bağlantı Hatası', 'Oda bağlantısı kesildi.');
      removeListeners();
      setGameState('menu');
    });
    
    // Messages listener
    const messagesUnsubscribe = onValue(messagesRefPath, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOnlineMessages(Object.values(data).sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setOnlineMessages([]);
      }
    }, (error) => {
      console.error('Messages listener error:', error);
    });
    
    // Unsubscribe fonksiyonlarını sakla
    roomListenerRef.current = roomUnsubscribe;
    messagesListenerRef.current = messagesUnsubscribe;
  };

  const startOnlineGame = async () => { if (isHost) await update(ref(database, `rooms/${roomCode}`), { status: 'playing' }); };
  
  const sendOnlineQuestion = async () => { 
    if(!onlineQuestionInput.trim()) return; 
    await set(ref(database, `rooms/${roomCode}/messages/msg_${Date.now()}`), { 
      type: 'question', 
      content: onlineQuestionInput.trim(), 
      sender: playerName, 
      timestamp: Date.now() 
    }); 
    
    // Host değilse otomatik cevap ver
    if (!isHost) {
      const answer = askOffline(onlineQuestionInput.trim());
      setTimeout(async () => {
        await set(ref(database, `rooms/${roomCode}/messages/msg_${Date.now()}`), { 
          type: 'answer', 
          content: answer, 
          sender: 'Sistem', 
          timestamp: Date.now() 
        });
      }, 800);
    }
    
    setOnlineQuestionInput(''); 
  };
  
  const sendOnlineAnswer = async (ans) => { 
    await set(ref(database, `rooms/${roomCode}/messages/msg_${Date.now()}`), { 
      type: 'answer', 
      content: ans, 
      sender: playerName, 
      timestamp: Date.now() 
    }); 
  };
  const sendOnlineHint = async () => { if (!currentStory || onlineHintsUsed >= currentStory.ipuclari.length) return; await set(ref(database, `rooms/${roomCode}/messages/msg_${Date.now()}`), { type: 'hint', content: currentStory.ipuclari[onlineHintsUsed], timestamp: Date.now() }); await update(ref(database, `rooms/${roomCode}`), { hintsUsed: onlineHintsUsed + 1 }); };
  
  const checkOnlineAnswer = async () => {
    if (!onlineAnswerInput.trim() || isLoading) return;
    setIsLoading(true);
    
    // Offline kontrol et
    const result = checkOfflineAnswer(onlineAnswerInput);
    const msgKey = `msg_${Date.now()}`;
    if (result === 'DOĞRU') {
        // Başarı sesi + confetti
        await playSuccessSound();
        if (confettiRef.current) {
          confettiRef.current.start();
        }
        
        // Oyun istatistiklerini hesapla
        const gameTime = Math.floor((Date.now() - startTime) / 1000); // saniye
        const stats = {
          time: gameTime,
          hintsUsed: onlineHintsUsed,
          difficulty: difficulty,
          completedAt: Date.now(),
        };
        
        // Storage'a kaydet
        await markStoryCompleted(currentStory.id, stats);
        
        // Başarımları kontrol et
        const achievements = await checkAchievements();
        if (achievements.length > 0) {
          setNewAchievement(achievements[0]);
          setShowAchievementNotif(true);
          await playAchievementSound();
        }
        
        await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), { type: 'solved', content: `🎉 "${onlineAnswerInput.trim()}" - Doğru cevap!`, sender: playerName, timestamp: Date.now() });
        await update(ref(database, `rooms/${roomCode}`), { status: 'solved' });
    } else {
        await playErrorSound();
        await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), { type: 'wrong', content: `❌ "${onlineAnswerInput.trim()}" - Yanlış, tekrar dene!`, timestamp: Date.now() });
    }
    setIsLoading(false); setOnlineAnswerInput('');
  };

  const removeListeners = () => { 
    if (roomListenerRef.current) {
      roomListenerRef.current(); // Unsubscribe fonksiyonunu çağır
      roomListenerRef.current = null;
    }
    if (messagesListenerRef.current) {
      messagesListenerRef.current(); // Unsubscribe fonksiyonunu çağır
      messagesListenerRef.current = null;
    }
  };
  const leaveRoom = async () => { removeListeners(); if (isHost && roomCode) await remove(ref(database, `rooms/${roomCode}`)); setRoomCode(''); setInputRoomCode(''); setRoomData(null); setOnlineMessages([]); setOnlineHintsUsed(0); setCurrentStory(null); setIsHost(false); setGuestList([]); setGameState('menu'); setGameMode(null); setStartTime(null); };
  const confirmLeave = () => { Alert.alert("Vakayı Terk Et?", "Dosyayı kapatırsan ilerlemen kaybolacak.", [{ text: "Vazgeç", style: "cancel" }, { text: "Evet, Çık", onPress: leaveRoom, style: "destructive" }]); };
  
  const startGame = async (diff, mode = 'ai', storyId = null) => {
    try {
      let story;
      if (storyId) {
        // Belirli bir hikaye yükle
        story = await loadStory(diff, storyId);
      } else {
        // Rastgele hikaye yükle
        story = await loadRandomStory(diff);
      }
      
      setDifficulty(diff); 
      setCurrentStory(story); 
      setGameMode(mode);
      setNotes(''); // Notları sıfırla
      setQuestionsAsked(0); // Soru sayacını sıfırla
      if (mode === 'reader') { 
        setGameState('reader_playing'); 
        setShowAnswer(false); 
      } else { 
        setGameState('playing'); 
        setMessages([{ type: 'story', content: story.baslangic }]); 
      }
      setStartTime(Date.now()); 
      setNow(Date.now()); 
      setHintsUsed(0);
    } catch (error) {
      console.error('startGame error:', error);
      Alert.alert('Hata', 'Hikaye yüklenemedi. Lütfen tekrar deneyin.');
    }
  };
  
  const handleStorySelection = (storyId) => {
    startGame(difficulty, gameMode, storyId);
  };
  
  const getHint = async () => { 
    // İpucu limiti kontrolü
    const limit = settings.hintLimit;
    if (limit !== 'unlimited') {
      const maxHints = parseInt(limit);
      if (hintsUsed >= maxHints) {
        Alert.alert('İpucu Limiti', `Bu oyunda maksimum ${maxHints} ipucu kullanabilirsiniz.`);
        return;
      }
    }
    
    if (hintsUsed >= currentStory?.ipuclari.length) return; 
    if (gameState === 'playing') setMessages([...messages, { type: 'hint', content: currentStory.ipuclari[hintsUsed] }]); 
    setHintsUsed(prev => prev + 1); 
    await playHintSound();
  };

  if (!fontsLoaded) return null;

  // ============================================================
  // RENDER
  // ============================================================
  if (gameState === 'menu') {
    return (
      <SafeAreaView style={d.container} onLayout={onLayoutRootView}>
        <ScrollView contentContainerStyle={d.scrollContent}>
          <View style={d.header}>
            <MaterialCommunityIcons name="incognito" color="#E0E0E0" size={80} />
            <Text style={d.title}>Dedektif</Text>
            <Text style={d.sub}>Gizemli hikayeleri çöz, gerçeği ortaya çıkar.</Text>
            
            {/* Ayarlar, İstatistikler ve Başarımlar Butonları */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <TouchableOpacity 
                style={d.settingsButton} 
                onPress={() => setGameState('achievements')}
              >
                <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
                <Text style={[d.settingsButtonText, {fontSize: 12}]}>Başarılarım</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={d.settingsButton} 
                onPress={() => setGameState('stats')}
              >
                <MaterialCommunityIcons name="chart-line" size={20} color="#B0B0B0" />
                <Text style={[d.settingsButtonText, {fontSize: 12}]}>İstatistikler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={d.settingsButton} 
                onPress={() => setGameState('settings')}
              >
                <MaterialCommunityIcons name="cog" size={20} color="#B0B0B0" />
                <Text style={[d.settingsButtonText, {fontSize: 12}]}>Ayarlar</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={d.cardWrapper}>
            <Text style={d.cardHeader}>OYUN MODU SEÇ</Text>
            <TouchableOpacity style={d.card} onPress={() => { setGameMode('ai'); setGameState('difficulty'); }}><View style={[d.iconBox, {backgroundColor:'#1A237E'}]}><MaterialCommunityIcons name="robot" size={24} color="#90CAF9" /></View><View style={{ flex: 1, marginLeft: 15 }}><Text style={d.cardTitle}>Tek Oyunculu</Text><Text style={d.cardSub}>Sorular sor, gizemi çöz</Text></View><MaterialCommunityIcons name="chevron-right" size={24} color="#757575" /></TouchableOpacity>
            <TouchableOpacity style={d.card} onPress={() => { setGameMode('reader'); setGameState('reader_difficulty'); }}><View style={[d.iconBox, {backgroundColor:'#3E2723'}]}><MaterialCommunityIcons name="book-open-page-variant" size={24} color="#FFCC80" /></View><View style={{ flex: 1, marginLeft: 15 }}><Text style={d.cardTitle}>Hikaye Okuyucu</Text><Text style={d.cardSub}>Yüz yüze oyna</Text></View><MaterialCommunityIcons name="chevron-right" size={24} color="#757575" /></TouchableOpacity>
            <TouchableOpacity style={d.card} onPress={() => setGameState('online_menu')}><View style={[d.iconBox, {backgroundColor:'#1B5E20'}]}><MaterialCommunityIcons name="account-group" size={24} color="#A5D6A7" /></View><View style={{ flex: 1, marginLeft: 15 }}><Text style={d.cardTitle}>Online Çok Oyunculu</Text><Text style={d.cardSub}>Arkadaşla oda aç veya katıl</Text></View><MaterialCommunityIcons name="chevron-right" size={24} color="#757575" /></TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (gameState === 'online_menu') {
    const canCreateRoom = playerName.trim() && onlineDifficulty;
    const canJoinRoom = playerName.trim() && inputRoomCode.length === 6 && !isLoading;
    return (
      <SafeAreaView style={d.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <ScrollView contentContainerStyle={d.scrollContent}>
          <View style={{width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20}}><TouchableOpacity onPress={() => setGameState('menu')} style={{padding:10, marginRight:10}}><MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" /></TouchableOpacity><View style={{alignItems:'center', flex:1, marginRight:38}}><MaterialCommunityIcons name="typewriter" size={40} color="#90CAF9" /><Text style={[d.titleSmall, {color:'#90CAF9', marginTop:5, fontSize:24}]}>Online Mod</Text></View></View>
          <View style={d.cardWrapper}>
            <Text style={d.vintageLabel}>Adın</Text><TextInput style={d.modernInput} value={playerName} onChangeText={setPlayerName} placeholder="Adını yaz..." placeholderTextColor="#757575" /><View style={d.divider} />
            <View><View style={{flexDirection:'row', alignItems:'center', gap:8, marginBottom:4}}><MaterialCommunityIcons name="home-outline" size={20} color="#B0B0B0" /><Text style={d.cardHeader}>Oda Oluştur</Text></View><Text style={[d.cardSub, {marginBottom:15}]}>Sen anlatıcı olursun, arkadaşın soru sorar</Text><Text style={[d.vintageLabel, {fontSize:12, color:'#B0B0B0'}]}>Zorluk Seviyesi</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>{['kolay', 'orta', 'zor'].map(d_key => (<TouchableOpacity key={d_key} onPress={() => setOnlineDifficulty(d_key)} style={[d.chipBtn, onlineDifficulty === d_key && d.chipBtnActive, d_key==='zor' && onlineDifficulty===d_key && {backgroundColor:'#C62828', borderColor:'#C62828'}, d_key==='orta' && onlineDifficulty===d_key && {backgroundColor:'#F9A825', borderColor:'#F9A825'}, d_key==='kolay' && onlineDifficulty===d_key && {backgroundColor:'#2E7D32', borderColor:'#2E7D32'}]}><View style={[d.dot, {backgroundColor: d_key==='kolay'?'#2E7D32':d_key==='orta'?'#F9A825':'#C62828'}, onlineDifficulty === d_key && {backgroundColor:'white'}]} /><Text style={[d.chipText, onlineDifficulty === d_key && {color:'white'}]}>{d_key.charAt(0).toUpperCase() + d_key.slice(1)}</Text></TouchableOpacity>))}</View>
              <TouchableOpacity
                style={[
                  d.actionBtn,
                  {backgroundColor: canCreateRoom ? '#1565C0' : '#455A64'},
                  !canCreateRoom && d.disabledButton
                ]}
                onPress={canCreateRoom ? createRoom : undefined}
                disabled={!canCreateRoom}
              >
                <Text style={d.actionBtnText}>Oda Oluştur</Text>
              </TouchableOpacity>
            </View><View style={d.divider} />
            <View><View style={{flexDirection:'row', alignItems:'center', gap:8, marginBottom:4}}><MaterialCommunityIcons name="link-variant" size={20} color="#B0B0B0" /><Text style={d.cardHeader}>Odaya Katıl</Text></View><Text style={[d.cardSub, {marginBottom:15}]}>Arkadaşın oda kodunu yaz</Text><Text style={d.vintageLabel}>Oda Kodu</Text><TextInput style={d.modernInput} value={inputRoomCode} onChangeText={setInputRoomCode} placeholder="123456" placeholderTextColor="#757575" keyboardType="numeric" maxLength={6} /><TouchableOpacity
                style={[
                  d.actionBtn,
                  { backgroundColor: canJoinRoom ? '#2E7D32' : '#455A64', marginTop:10 },
                  !canJoinRoom && d.disabledButton
                ]}
                onPress={canJoinRoom ? joinRoom : undefined}
                disabled={!canJoinRoom}
              >
                <Text style={d.actionBtnText}>{isLoading ? 'Bağlanılıyor...' : 'Odaya Katıl'}</Text>
              </TouchableOpacity>{joinError ? <Text style={{ color: '#EF9A9A', fontSize: 12, marginTop: 10, textAlign:'center', fontFamily:'SpecialElite' }}>{joinError}</Text> : null}</View>
          </View>
        </ScrollView></KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (gameState === 'waiting') {
    return (
      <SafeAreaView style={d.container}>
        <View style={d.scrollContent}>
           <View style={{width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20}}><TouchableOpacity onPress={confirmLeave} style={{padding:10}}><MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" /></TouchableOpacity><Text style={[d.titleSmall, {flex:1, textAlign:'center', marginRight:30}]}>Bekleme Salonu</Text></View>
          <View style={d.cardWrapper}>
            <Text style={{textAlign:'center', color:'#B0B0B0', marginBottom:5}}>VAKA DOSYASI NO</Text><Text style={[d.titleSmall, {textAlign:'center', fontSize:36, color:'#90CAF9'}]}>{roomCode}</Text><View style={{borderBottomWidth:1, borderColor:'#333', marginVertical:15}} /><Text style={d.vintageLabel}>EKİP ({guestList.length + 1})</Text>
            <View style={{height: 200}}><ScrollView nestedScrollEnabled><View style={d.playerRow}><MaterialCommunityIcons name="account-tie" size={24} color="#90CAF9" /><Text style={d.playerText}>{roomData?.host || playerName} (Anlatıcı)</Text><MaterialCommunityIcons name="crown" size={16} color="#FFD700" style={{marginLeft:'auto'}} /></View>{guestList.length > 0 ? guestList.map((guest, index) => (<View key={index} style={d.playerRow}><MaterialCommunityIcons name="magnify" size={24} color="#A5D6A7" /><Text style={d.playerText}>{guest.name}</Text></View>)) : (<Text style={{color:'#555', fontStyle:'italic', marginTop:10, textAlign:'center'}}>Dedektifler bekleniyor...</Text>)}</ScrollView></View>
            {isHost ? (<TouchableOpacity onPress={startOnlineGame} style={[d.actionBtn, { backgroundColor: '#2E7D32', marginTop:20 }]}><Text style={d.actionBtnText}>Vakayı Başlat</Text></TouchableOpacity>) : (<View style={{marginTop:20, padding:10, backgroundColor:'#252525', borderRadius:8}}><Text style={{color:'#B0B0B0', textAlign:'center', fontStyle:'italic'}}>Anlatıcının dosyayı açması bekleniyor...</Text></View>)}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === 'playing' || gameState === 'online_playing') {
    const activeMessages = gameState === 'playing' ? messages : onlineMessages;
    const noMoreHints = gameState === 'online_playing'
      ? onlineHintsUsed >= (currentStory?.ipuclari.length || 0)
      : hintsUsed >= (currentStory?.ipuclari.length || 0);
    return (
      <SafeAreaView style={d.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>
            <View style={d.gameHeader}>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                <TouchableOpacity onPress={confirmLeave} style={{padding:5}}>
                  <MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={d.gameTitle}>{difficulty?.toUpperCase()} DOSYASI</Text>
                <View style={{flexDirection:'row', gap:8}}>
                  <TouchableOpacity onPress={() => setShowHistoryPanel(true)} style={{padding:5}}>
                    <MaterialCommunityIcons name="history" size={24} color="#90CAF9" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowNotesPanel(true)} style={{padding:5}}>
                    <MaterialCommunityIcons name="notebook" size={24} color="#FFCC80" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={d.storyTitle}>{currentStory?.baslik}</Text>
              {settings.showTimer && <Text style={d.timerText}>{formatTime()}</Text>}
            </View>
            <ScrollView ref={scrollViewRef} style={d.chatArea} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>{activeMessages.map((msg, idx) => (<View key={idx} style={[d.msgBox, msg.type === 'question' ? d.msgUser : msg.type === 'answer' ? d.msgAi : msg.type === 'hint' ? d.msgHint : msg.type === 'story' ? d.msgStory : d.msgAi]}>{msg.sender && msg.type !== 'story' && <Text style={d.senderName}>{msg.sender}</Text>}<Text style={[d.msgContent, (msg.type === 'question' || msg.type === 'story') && {color: '#E0E0E0'}]}>{msg.content}</Text></View>))}{isLoading && <Text style={{textAlign:'center', fontStyle:'italic', color:'#757575', margin:10, fontFamily:'serif'}}>Dedektif düşünüyor...</Text>}</ScrollView>
            <View style={d.inputSection}>
              {gameState === 'online_playing' && isHost ? (
                <View style={{width: '100%'}}><Text style={{textAlign:'center', marginBottom:5, fontSize:12, color:'#B0B0B0', fontFamily:'SpecialElite'}}>CEVAP VER:</Text><View style={{ flexDirection: 'row', gap: 10 }}><TouchableOpacity onPress={() => sendOnlineAnswer('Evet')} style={[d.stampBtn, { borderColor: '#2E7D32', backgroundColor:'#1B5E20' }]}><Text style={{ color: '#A5D6A7', fontFamily:'SpecialElite' }}>EVET</Text></TouchableOpacity><TouchableOpacity onPress={() => sendOnlineAnswer('Hayır')} style={[d.stampBtn, { borderColor: '#C62828', backgroundColor:'#B71C1C' }]}><Text style={{ color: '#EF9A9A', fontFamily:'SpecialElite' }}>HAYIR</Text></TouchableOpacity><TouchableOpacity onPress={() => sendOnlineAnswer('Alakasız')} style={[d.stampBtn, { borderColor: '#757575', backgroundColor:'#424242' }]}><Text style={{ color: '#BDBDBD', fontFamily:'SpecialElite' }}>A/S</Text></TouchableOpacity></View></View>
              ) : (
                <View style={{ width: '100%', gap: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems:'center' }}>
                    <TextInput
                      style={d.largeInput}
                      value={gameState === 'online_playing' ? onlineQuestionInput : questionInput}
                      onChangeText={gameState === 'online_playing' ? setOnlineQuestionInput : setQuestionInput}
                      placeholder="Bir soru sor..."
                      placeholderTextColor="#757575"
                    />
                    <TouchableOpacity
                      style={[d.sendIconBtn, isLoading && d.disabledButton]}
                      onPress={gameState === 'online_playing' ? sendOnlineQuestion : askQuestion}
                      disabled={isLoading}
                    >
                      <MaterialCommunityIcons name="send" size={24} color="#121212" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems:'center' }}>
                    <TextInput
                      style={[d.largeInput, {borderColor: '#2E7D32', backgroundColor:'#1B5E20'}]}
                      value={gameState === 'online_playing' ? onlineAnswerInput : answerInput}
                      onChangeText={gameState === 'online_playing' ? setOnlineAnswerInput : setAnswerInput}
                      placeholder="Cevabı tahmin et..."
                      placeholderTextColor="#A5D6A7"
                    />
                    <TouchableOpacity
                      style={[d.sendIconBtn, {backgroundColor: '#2E7D32'}, isLoading && d.disabledButton]}
                      onPress={gameState === 'online_playing' ? checkOnlineAnswer : checkAnswer}
                      disabled={isLoading}
                    >
                      <MaterialCommunityIcons name="check-bold" size={24} color="#121212" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
               {(gameState !== 'online_playing' || isHost) && (
                <TouchableOpacity
                  onPress={gameState === 'online_playing' ? sendOnlineHint : getHint}
                  disabled={noMoreHints}
                  style={[d.hintButton, noMoreHints && d.hintButtonDisabled]}
                >
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#FFCC80" />
                  <Text style={{color:'#FFCC80', fontFamily:'SpecialElite', marginLeft:5}}>
                    İpucu Al ({gameState === 'online_playing' ? onlineHintsUsed : hintsUsed}/{currentStory?.ipuclari.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Confetti */}
            <ConfettiCannon
              ref={confettiRef}
              count={200}
              origin={{x: -10, y: 0}}
              autoStart={false}
              fadeOut={true}
            />
            
            {/* Not Paneli */}
            <NotesPanel
              visible={showNotesPanel}
              onClose={() => setShowNotesPanel(false)}
              notes={notes}
              onSaveNotes={setNotes}
            />
            
            {/* Soru Geçmişi Paneli */}
            <QuestionHistoryPanel
              visible={showHistoryPanel}
              onClose={() => setShowHistoryPanel(false)}
              messages={activeMessages}
            />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (gameState === 'solved' || gameState === 'online_solved') {
      return (
        <SafeAreaView style={d.container}>
            <ScrollView contentContainerStyle={d.scrollContent}><View style={d.cardWrapper}><MaterialCommunityIcons name="checkbox-marked-circle-outline" size={80} color="#2E7D32" style={{alignSelf:'center', marginBottom:10}} /><Text style={[d.titleSmall, {color: '#2E7D32', textAlign:'center'}]}>VAKA ÇÖZÜLDÜ!</Text><Text style={[d.sub, {marginBottom:20}]}>Harika iş çıkardınız dedektif.</Text><View style={{backgroundColor:'#252525', padding:20, borderRadius:12, borderWidth:1, borderColor:'#333333'}}><Text style={d.cardHeader}>📜 Gerçek Hikaye:</Text><Text style={[d.msgContent, {marginTop:5}]}>{currentStory?.cevap}</Text></View><TouchableOpacity onPress={leaveRoom} style={[d.actionBtn, {marginTop:30, backgroundColor:'#1565C0'}]}><Text style={d.actionBtnText}>Dosyayı Kapat</Text></TouchableOpacity></View></ScrollView>
        </SafeAreaView>
      );
  }

  if (gameState === 'reader_playing') {
      return (
        <SafeAreaView style={d.container}>
            <ScrollView contentContainerStyle={d.scrollContent}>
              <View style={{width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20}}>
                <TouchableOpacity
                  onPress={() => {setGameState('menu'); setCurrentStory(null);}}
                  style={{padding:10, marginRight:10}}
                >
                  <MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={[d.titleSmall, {flex:1, textAlign:'center', marginRight:38, fontSize:22}]}>
                  Hikaye Okuyucu
                </Text>
              </View>
              <View style={d.cardWrapper}>
                <Text style={d.cardHeader}>📖 {currentStory?.baslik}</Text>
                <View style={{flexDirection:'row', alignItems:'center', gap:5, marginBottom:15}}>
                  <View style={[d.dot, {backgroundColor: difficulty==='kolay'?'#2E7D32':difficulty==='orta'?'#F9A825':'#C62828'}]} />
                  <Text style={d.gameSub}>{difficulty?.toUpperCase()}</Text>
                </View>
                <View style={{backgroundColor:'#252525', padding:20, borderRadius:12, borderWidth:1, borderColor:'#333333', marginBottom:20}}>
                  <Text style={[d.msgContent, {fontStyle:'italic', fontSize:16}]}>{currentStory?.baslangic}</Text>
                </View>
                <View style={{borderTopWidth:1, borderColor:'#333333', paddingTop:20}}>
                  <TouchableOpacity
                    onPress={() => setShowAnswer(!showAnswer)}
                    style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#1E1E1E', padding:10, borderRadius:8}}
                  >
                    <Text style={d.cardTitle}>🔒 Gizli Cevap</Text>
                    <MaterialCommunityIcons name={showAnswer ? "eye-off" : "eye"} size={24} color="#B0B0B0" />
                  </TouchableOpacity>
                  {showAnswer && (
                    <View style={{marginTop:15, padding:10}}>
                      <Text style={d.msgContent}>{currentStory?.cevap}</Text>
                      <Text style={[d.cardHeader, {marginTop:15, fontSize:14}]}>İpuçları:</Text>
                      {currentStory?.ipuclari.map((hint, i) => (
                        <Text key={i} style={d.cardSub}>• {hint}</Text>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => { startGame(difficulty, 'reader'); setShowAnswer(false); }}
                  style={[d.actionBtn, { marginTop:24, backgroundColor:'#1565C0' }]}
                >
                  <Text style={d.actionBtnText}>Yeni Hikaye</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
        </SafeAreaView>
      );
  }

  if (gameState === 'difficulty' || gameState === 'reader_difficulty') {
    return (
      <SafeAreaView style={d.container}>
        <View style={d.scrollContent}><View style={{width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20}}><TouchableOpacity onPress={() => setGameState('menu')} style={{padding:10}}><MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" /></TouchableOpacity><Text style={[d.titleSmall, {flex:1, textAlign:'center', marginRight:30}]}>Zorluk Seç</Text></View>{['kolay', 'orta', 'zor'].map(d_key => (<TouchableOpacity key={d_key} style={d.card} onPress={() => { setDifficulty(d_key); setGameState(gameState === 'reader_difficulty' ? 'reader_story_selection' : 'story_selection'); }}><View style={[d.iconBox, d_key==='kolay' ? {backgroundColor:'#1B5E20'} : d_key==='orta' ? {backgroundColor:'#F57F17'} : {backgroundColor:'#B71C1C'}]}><View style={[d.dot, {width:16, height:16, backgroundColor: d_key==='kolay' ? '#2E7D32' : d_key==='orta' ? '#F9A825' : '#C62828'}]} /></View><View style={{ flex: 1, marginLeft: 15 }}><Text style={d.cardTitle}>{d_key.charAt(0).toUpperCase() + d_key.slice(1)}</Text><Text style={d.cardSub}>{d_key === 'kolay' ? 'Başlangıç seviyesi' : d_key === 'orta' ? 'Biraz düşünmen gerekecek' : 'Gerçek dedektifler için'}</Text></View><MaterialCommunityIcons name="arrow-right" size={24} color="#757575" /></TouchableOpacity>))}</View>
      </SafeAreaView>
    );
  }

  // Ayarlar Ekranı
  if (gameState === 'settings') {
    return (
      <SettingsScreen 
        onBack={async () => {
          // Ayarları yeniden yükle
          const savedSettings = await getSettings();
          if (savedSettings) {
            setSettings(prev => ({ ...prev, ...savedSettings }));
          }
          setGameState('menu');
        }} 
      />
    );
  }

  // İstatistikler Ekranı
  if (gameState === 'stats') {
    return (
      <StatsScreen onBack={() => setGameState('menu')} />
    );
  }

  // Başarımlar Ekranı
  if (gameState === 'achievements') {
    return (
      <AchievementsScreen onBack={() => setGameState('menu')} />
    );
  }

  // Story Selection Ekranı
  if (gameState === 'story_selection' || gameState === 'reader_story_selection') {
    return (
      <StorySelectionScreen
        difficulty={difficulty}
        gameMode={gameMode}
        onBack={() => setGameState(gameState === 'reader_story_selection' ? 'reader_difficulty' : 'difficulty')}
        onSelectStory={handleStorySelection}
      />
    );
  }

  return (
    <>
      {/* Başarım Bildirimi */}
      <AchievementNotification
        achievement={newAchievement}
        visible={showAchievementNotif}
        onHide={() => {
          setShowAchievementNotif(false);
          setNewAchievement(null);
        }}
      />
      {null}
    </>
  );
};

// ============================================================
// DARK NOIR STYLE SHEET
// ============================================================
const d = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontFamily: 'SpecialElite', fontSize: 48, color: '#E0E0E0', marginTop:10 },
  titleSmall: { fontFamily: 'SpecialElite', fontSize: 28, color: '#E0E0E0', marginBottom: 20 },
  sub: { fontFamily: 'serif', fontSize: 14, color: '#B0B0B0', textAlign: 'center', marginTop:5 },
  settingsButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#1E1E1E', borderRadius: 20, borderWidth: 1, borderColor: '#333333' },
  settingsButtonText: { fontSize: 14, color: '#B0B0B0', fontFamily: 'SpecialElite' },
  cardWrapper: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4, borderWidth:1, borderColor:'#333' },
  cardHeader: { fontFamily: 'SpecialElite', fontSize: 16, color: '#E0E0E0', fontWeight:'bold' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#252525', borderRadius: 12, borderWidth: 1, borderColor: '#333333', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily:'SpecialElite' }, 
  cardSub: { fontSize: 12, color: '#B0B0B0', marginTop:2, fontFamily:'serif' },
  iconBox: { width:40, height:40, borderRadius:10, alignItems:'center', justifyContent:'center' },
  dot: { width:10, height:10, borderRadius:5 },
  vintageLabel: { fontSize: 14, color: '#B0B0B0', marginBottom: 8, marginTop:5, fontFamily: 'SpecialElite' },
  modernInput: { backgroundColor: '#2C2C2C', borderRadius: 10, padding: 15, fontSize: 15, color: '#E0E0E0', borderWidth:1, borderColor:'#333333', fontFamily:'serif' },
  largeInput: { flex: 1, height: 60, backgroundColor: '#2C2C2C', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#333333', fontFamily: 'serif', color: '#E0E0E0' },
  divider: { height:1, backgroundColor:'#333333', width:'100%', marginVertical:20 },
  chipBtn: { flex: 1, paddingVertical: 10, paddingHorizontal:5, borderRadius: 20, borderWidth: 1, borderColor: '#444444', alignItems: 'center', justifyContent:'center', flexDirection:'row', gap:6, backgroundColor:'#252525' },
  chipBtnActive: { borderColor: 'transparent' },
  chipText: { fontSize: 12, color: '#B0B0B0', fontWeight:'bold', fontFamily:'SpecialElite' },
  actionBtn: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent:'center', width:'100%' },
  actionBtnText: { color: '#121212', fontWeight: 'bold', fontSize:15, fontFamily:'SpecialElite' }, 
  backBtn: { marginTop: 20 },
  backText: { color: '#B0B0B0', fontSize:14, fontWeight:'500', fontFamily:'SpecialElite' },
  gameHeader: { padding: 20, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#333333' },
  gameTitle: { fontFamily: 'SpecialElite', fontSize: 14, color: '#B0B0B0', textAlign: 'center', letterSpacing:1 },
  storyTitle: { fontFamily: 'SpecialElite', fontSize: 20, color: '#E0E0E0', textAlign: 'center', marginTop:5 },
  timerText: { textAlign:'center', marginTop:5, color:'#EF9A9A', fontFamily:'SpecialElite' },
  chatArea: { flex: 1, padding: 15, backgroundColor:'#121212' },
  msgBox: { padding: 14, borderRadius: 16, marginBottom: 10, maxWidth: '85%' },
  msgStory: { backgroundColor: '#423716', alignSelf: 'center', width: '100%', borderRadius:8, borderLeftWidth:4, borderLeftColor:'#FFC107' },
  msgAi: { alignSelf: 'flex-start', backgroundColor: '#1E1E1E', borderBottomLeftRadius:2, borderWidth:1, borderColor:'#333333' },
  msgUser: { alignSelf: 'flex-end', backgroundColor: '#37474F', borderBottomRightRadius:2 },
  msgHint: { alignSelf: 'center', backgroundColor: '#1A237E', paddingVertical:8, paddingHorizontal:15, borderRadius:20 },
  msgContent: { fontSize: 15, lineHeight: 22, fontFamily:'serif', color:'#E0E0E0' },
  senderName: { fontSize: 10, color: '#B0B0B0', marginBottom: 2, fontWeight:'bold', fontFamily:'SpecialElite' },
  inputSection: { padding: 15, backgroundColor: '#1E1E1E', borderTopWidth: 1, borderTopColor: '#333333', gap:10 },
  sendIconBtn: { width: 60, height: 60, backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  stampBtn: { flex: 1, height: 45, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  hintButton: { alignSelf:'center', flexDirection:'row', alignItems:'center', padding:10, backgroundColor:'#263238', borderRadius:20, borderWidth:1, borderColor:'#37474F', marginTop:5 },
  hintButtonDisabled: { opacity: 0.5, borderColor:'#555555' },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333333' },
  playerText: { fontSize: 16, color: '#E0E0E0', fontWeight:'600', fontFamily:'SpecialElite', marginLeft:10 },
  disabledButton: { opacity: 0.6 },
});

export default DetectiveGame;
