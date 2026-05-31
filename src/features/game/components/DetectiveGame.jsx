import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../../../config/firebaseConfig';
import { stories } from '../../../data/stories';
import { loadRandomStory, loadStory } from '../../../data/stories/storyLoader';
import AchievementNotification from '../../../shared/components/AchievementNotification';
import AppText from '../../../shared/components/AppText';
import { checkAchievements } from '../../../shared/utils/achievementManager';
import { validatePlayerName, validateRoomCode } from '../../../shared/utils/errorHandler';
import { playAchievementSound, playErrorSound, playHintSound, playMessageSound, playSuccessSound } from '../../../shared/utils/soundManager';
import { getSettings, markStoryCompleted } from '../../../shared/utils/storageManager';
import AchievementsScreen from '../../achievements/components/AchievementsScreen';
import SettingsScreen from '../../settings/components/SettingsScreen';
import StatsScreen from '../../stats/components/StatsScreen';
import NotesPanel from './NotesPanel';
import QuestionHistoryPanel from './QuestionHistoryPanel';
import StorySelectionScreen from './StorySelectionScreen';

// Font ve İkon Paketleri
import { SpecialElite_400Regular, useFonts } from '@expo-google-fonts/special-elite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import IntroScreen from './IntroScreen';
import { useOfflineEngine } from '../hooks/useOfflineEngine';

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
  const [inputMode, setInputMode] = useState('question');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const questionInputRef = useRef(null);
  const answerInputRef = useRef(null);
  const headerAnim = useRef(new Animated.Value(1)).current;
  const vakaAnim = useRef(new Animated.Value(0)).current;
  const vakaHeight = useRef(new Animated.Value(1)).current;
  
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

  const { askOffline, checkOfflineAnswer } = useOfflineEngine(currentStory);
  const scrollViewRef = useRef(null);
  const roomListenerRef = useRef(null);
  const messagesListenerRef = useRef(null);
  const confettiRef = useRef(null);

  const [showIntro, setShowIntro] = useState(true);
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (!fontsLoaded) return;

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
    const { updateSoundSettings } = require('../../../shared/utils/soundManager');
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
    try { if (settings.vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
    
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
        const result = await checkOfflineAnswer(answer); // Kaydedilen değeri kullan
        if (result === 'DOĞRU') {
          // Başarı sesi + confetti
          await playSuccessSound();
          try { if (settings.vibrationEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
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
          try { if (settings.vibrationEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch(e) {}
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
        setStartTime(prev => prev || Date.now()); 
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
    const result = await checkOfflineAnswer(onlineAnswerInput);
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
  const confirmLeave = () => { setShowLeaveModal(true); };
  
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
      setNotes('');
      setInputMode('question');
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
      <SafeAreaView style={d.container} onLayout={onLayoutRootView} pointerEvents={showIntro ? "none" : "auto"}>
        <ScrollView contentContainerStyle={{paddingBottom:40}}>

          <View style={{alignItems:'center', paddingTop:48, paddingBottom:32, paddingHorizontal:24}}>
            <MaterialCommunityIcons name="incognito" color="#E0E0E0" size={72} />
            <AppText style={{fontFamily:'SpecialElite', fontSize:44, color:'#E0E0E0', marginTop:12, letterSpacing:2}}>Dedektif</AppText>
            <AppText style={{fontFamily:'serif', fontSize:13, color:'#555', marginTop:6, letterSpacing:1}}>GIZEMLI HIKAYELERI COZ</AppText>
          </View>

          <View style={{paddingHorizontal:20, gap:12}}>
            <TouchableOpacity onPress={() => { setGameMode('ai'); setGameState('difficulty'); }} style={{backgroundColor:'#1E1E1E', borderRadius:16, padding:20, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#2a2a2a'}}>
              <View style={{width:52, height:52, borderRadius:14, backgroundColor:'#0D1757', alignItems:'center', justifyContent:'center'}}>
                <MaterialCommunityIcons name="magnify" size={28} color="#90CAF9" />
              </View>
              <View style={{flex:1, marginLeft:16}}>
                <AppText style={{fontFamily:'SpecialElite', fontSize:18, color:'#E0E0E0'}}>Tek Oyunculu</AppText>
                <AppText style={{fontFamily:'serif', fontSize:12, color:'#7986CB', marginTop:3}}>Sorular sor, gizemi coz</AppText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#444" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setGameMode('reader'); setGameState('reader_difficulty'); }} style={{backgroundColor:'#1E1E1E', borderRadius:16, padding:20, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#2a2a2a'}}>
              <View style={{width:52, height:52, borderRadius:14, backgroundColor:'#2C1810', alignItems:'center', justifyContent:'center'}}>
                <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#FFCC80" />
              </View>
              <View style={{flex:1, marginLeft:16}}>
                <AppText style={{fontFamily:'SpecialElite', fontSize:18, color:'#E0E0E0'}}>Hikaye Okuyucu</AppText>
                <AppText style={{fontFamily:'serif', fontSize:12, color:'#A1887F', marginTop:3}}>Yuz yuze oyna, sen anlat</AppText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#444" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setGameState('online_menu')} style={{backgroundColor:'#1E1E1E', borderRadius:16, padding:20, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#2a2a2a'}}>
              <View style={{width:52, height:52, borderRadius:14, backgroundColor:'#0A3D0F', alignItems:'center', justifyContent:'center'}}>
                <MaterialCommunityIcons name="account-group" size={28} color="#A5D6A7" />
              </View>
              <View style={{flex:1, marginLeft:16}}>
                <AppText style={{fontFamily:'SpecialElite', fontSize:18, color:'#E0E0E0'}}>Online Cok Oyunculu</AppText>
                <AppText style={{fontFamily:'serif', fontSize:12, color:'#66BB6A', marginTop:3}}>Arkadasla oda ac veya katil</AppText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#444" />
            </TouchableOpacity>
          </View>

          <View style={{flexDirection:'row', marginTop:24, paddingHorizontal:20, gap:10}}>
            <TouchableOpacity onPress={() => setGameState('achievements')} style={{flex:1, backgroundColor:'#1E1E1E', borderRadius:12, padding:14, alignItems:'center', borderWidth:1, borderColor:'#333', gap:6}}>
              <MaterialCommunityIcons name="trophy" size={22} color="#FFD700" />
              <AppText style={{fontFamily:'SpecialElite', fontSize:11, color:'#B0B0B0'}}>Basarimlar</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGameState('stats')} style={{flex:1, backgroundColor:'#1E1E1E', borderRadius:12, padding:14, alignItems:'center', borderWidth:1, borderColor:'#333', gap:6}}>
              <MaterialCommunityIcons name="chart-line" size={22} color="#90CAF9" />
              <AppText style={{fontFamily:'SpecialElite', fontSize:11, color:'#B0B0B0'}}>Istatistikler</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGameState('settings')} style={{flex:1, backgroundColor:'#1E1E1E', borderRadius:12, padding:14, alignItems:'center', borderWidth:1, borderColor:'#333', gap:6}}>
              <MaterialCommunityIcons name="cog" size={22} color="#B0B0B0" />
              <AppText style={{fontFamily:'SpecialElite', fontSize:11, color:'#B0B0B0'}}>Ayarlar</AppText>
            </TouchableOpacity>
          </View>

        </ScrollView>
        {showIntro && <IntroScreen onFinish={() => setShowIntro(false)} />}
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
          <View style={{width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20}}><TouchableOpacity onPress={() => setGameState('menu')} style={{padding:10, marginRight:10}}><MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" /></TouchableOpacity><View style={{alignItems:'center', flex:1, marginRight:38}}><MaterialCommunityIcons name="typewriter" size={40} color="#90CAF9" /><AppText style={[d.titleSmall, {color:'#90CAF9', marginTop:5, fontSize:24}]}>Online Mod</AppText></View></View>
          <View style={d.cardWrapper}>
            <AppText style={d.vintageLabel}>Adın</AppText><TextInput style={d.modernInput} value={playerName} onChangeText={setPlayerName} placeholder="Adını yaz..." placeholderTextColor="#757575" /><View style={d.divider} />
            <View><View style={{flexDirection:'row', alignItems:'center', gap:8, marginBottom:4}}><MaterialCommunityIcons name="home-outline" size={20} color="#B0B0B0" /><AppText style={d.cardHeader}>Oda Oluştur</AppText></View><AppText style={[d.cardSub, {marginBottom:15}]}>Sen anlatıcı olursun, arkadaşın soru sorar</AppText><AppText style={[d.vintageLabel, {fontSize:12, color:'#B0B0B0'}]}>Zorluk Seviyesi</AppText>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>{['kolay', 'orta', 'zor'].map(d_key => (<TouchableOpacity key={d_key} onPress={() => setOnlineDifficulty(d_key)} style={[d.chipBtn, onlineDifficulty === d_key && d.chipBtnActive, d_key==='zor' && onlineDifficulty===d_key && {backgroundColor:'#C62828', borderColor:'#C62828'}, d_key==='orta' && onlineDifficulty===d_key && {backgroundColor:'#F9A825', borderColor:'#F9A825'}, d_key==='kolay' && onlineDifficulty===d_key && {backgroundColor:'#2E7D32', borderColor:'#2E7D32'}]}><View style={[d.dot, {backgroundColor: d_key==='kolay'?'#2E7D32':d_key==='orta'?'#F9A825':'#C62828'}, onlineDifficulty === d_key && {backgroundColor:'white'}]} /><AppText style={[d.chipText, onlineDifficulty === d_key && {color:'white'}]}>{d_key.charAt(0).toUpperCase() + d_key.slice(1)}</AppText></TouchableOpacity>))}</View>
              <TouchableOpacity
                style={[
                  d.actionBtn,
                  {backgroundColor: canCreateRoom ? '#1565C0' : '#455A64'},
                  !canCreateRoom && d.disabledButton
                ]}
                onPress={canCreateRoom ? createRoom : undefined}
                disabled={!canCreateRoom}
              >
                <AppText style={d.actionBtnText}>Oda Oluştur</AppText>
              </TouchableOpacity>
            </View><View style={d.divider} />
            <View><View style={{flexDirection:'row', alignItems:'center', gap:8, marginBottom:4}}><MaterialCommunityIcons name="link-variant" size={20} color="#B0B0B0" /><AppText style={d.cardHeader}>Odaya Katıl</AppText></View><AppText style={[d.cardSub, {marginBottom:15}]}>Arkadaşın oda kodunu yaz</AppText><AppText style={d.vintageLabel}>Oda Kodu</AppText><TextInput style={d.modernInput} value={inputRoomCode} onChangeText={setInputRoomCode} placeholder="123456" placeholderTextColor="#757575" keyboardType="numeric" maxLength={6} /><TouchableOpacity
                style={[
                  d.actionBtn,
                  { backgroundColor: canJoinRoom ? '#2E7D32' : '#455A64', marginTop:10 },
                  !canJoinRoom && d.disabledButton
                ]}
                onPress={canJoinRoom ? joinRoom : undefined}
                disabled={!canJoinRoom}
              >
                <AppText style={d.actionBtnText}>{isLoading ? 'Bağlanılıyor...' : 'Odaya Katıl'}</AppText>
              </TouchableOpacity>{joinError ? <AppText style={{ color: '#EF9A9A', fontSize: 12, marginTop: 10, textAlign:'center', fontFamily:'SpecialElite' }}>{joinError}</AppText> : null}</View>
          </View>
        </ScrollView></KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (gameState === 'waiting') {
    return (
      <SafeAreaView style={d.container}>
        <View style={d.scrollContent}>
           <View style={{width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20}}><TouchableOpacity onPress={confirmLeave} style={{padding:10}}><MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" /></TouchableOpacity><AppText style={[d.titleSmall, {flex:1, textAlign:'center', marginRight:30}]}>Bekleme Salonu</AppText></View>
          <View style={d.cardWrapper}>
            <AppText style={{textAlign:'center', color:'#B0B0B0', marginBottom:5}}>VAKA DOSYASI NO</AppText><AppText style={[d.titleSmall, {textAlign:'center', fontSize:36, color:'#90CAF9'}]}>{roomCode}</AppText><View style={{borderBottomWidth:1, borderColor:'#333', marginVertical:15}} /><AppText style={d.vintageLabel}>EKİP ({guestList.length + 1})</AppText>
            <View style={{height: 200}}><ScrollView nestedScrollEnabled><View style={d.playerRow}><MaterialCommunityIcons name="account-tie" size={24} color="#90CAF9" /><AppText style={d.playerText}>{roomData?.host || playerName} (Anlatıcı)</AppText><MaterialCommunityIcons name="crown" size={16} color="#FFD700" style={{marginLeft:'auto'}} /></View>{guestList.length > 0 ? guestList.map((guest, index) => (<View key={index} style={d.playerRow}><MaterialCommunityIcons name="magnify" size={24} color="#A5D6A7" /><AppText style={d.playerText}>{guest.name}</AppText></View>)) : (<AppText style={{color:'#555', fontStyle:'italic', marginTop:10, textAlign:'center'}}>Dedektifler bekleniyor...</AppText>)}</ScrollView></View>
            {isHost ? (<TouchableOpacity onPress={startOnlineGame} style={[d.actionBtn, { backgroundColor: '#2E7D32', marginTop:20 }]}><AppText style={d.actionBtnText}>Vakayı Başlat</AppText></TouchableOpacity>) : (<View style={{marginTop:20, padding:10, backgroundColor:'#252525', borderRadius:8}}><AppText style={{color:'#B0B0B0', textAlign:'center', fontStyle:'italic'}}>Anlatıcının dosyayı açması bekleniyor...</AppText></View>)}
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
            <View style={{backgroundColor:'#1E1E1E', borderBottomWidth:1, borderBottomColor:'#2a2a2a', paddingHorizontal:16, paddingTop:12, paddingBottom:14}}>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
                <TouchableOpacity onPress={confirmLeave} style={{padding:4, width:70}}>
                  <MaterialCommunityIcons name="arrow-left" size={26} color="#E0E0E0" />
                </TouchableOpacity>
                <View style={{flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6}}>
                  <View style={{width:7, height:7, borderRadius:4, backgroundColor: difficulty==='kolay'?'#2E7D32':difficulty==='orta'?'#F9A825':'#C62828'}} />
                  <AppText style={{fontFamily:'SpecialElite', fontSize:11, color:'#757575', letterSpacing:2}}>{difficulty?.toUpperCase()} DOSYASI</AppText>
                </View>
                <View style={{flexDirection:'row', gap:6, width:70, justifyContent:'flex-end', alignItems:'center'}}>
                  <TouchableOpacity onPress={() => setShowNotesPanel(true)} style={{padding:4}}>
                    <MaterialCommunityIcons name="notebook-outline" size={21} color="#555" />
                  </TouchableOpacity>
                </View>
              </View>
              <AppText style={{fontFamily:'SpecialElite', fontSize:19, color:'#E0E0E0', textAlign:'center'}} numberOfLines={1}>{currentStory?.baslik}</AppText>
              <View style={{flexDirection:'row', alignItems:'center', marginTop:4}}>
                <View style={{width:32}} />
                <AppText style={{fontFamily:'SpecialElite', fontSize:15, color: settings.showTimer ? '#EF9A9A' : 'transparent', flex:1, textAlign:'center'}}>{formatTime()}</AppText>
                <TouchableOpacity
                  onPress={gameState === 'online_playing' ? sendOnlineHint : getHint}
                  disabled={noMoreHints}
                  style={{width:32, height:32, borderRadius:16, backgroundColor: noMoreHints ? '#1E1E1E' : '#1C1A00', borderWidth:1.5, borderColor: noMoreHints ? '#333' : '#FFC107', alignItems:'center', justifyContent:'center', opacity: noMoreHints ? 0.4 : 1}}
                >
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={noMoreHints ? '#444' : '#FFC107'} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{marginHorizontal:12, marginTop:10, marginBottom:4, padding:16, backgroundColor:'#181818', borderTopWidth:2, borderTopColor:'#444', borderWidth:1, borderColor:'#2a2a2a'}}>
              <AppText style={{fontFamily:'serif', fontSize:15, color:'#C8C8C8', lineHeight:24, fontStyle:'italic'}}>{currentStory?.baslangic}</AppText>
            </View>
            <ScrollView ref={scrollViewRef} style={d.chatArea} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>{activeMessages.filter(msg => msg.type !== 'story').map((msg, idx) => (<View key={idx} style={[d.msgBox, msg.type === 'question' ? d.msgUser : msg.type === 'answer' ? d.msgAi : msg.type === 'hint' ? d.msgHint : d.msgAi]}>{msg.type === 'hint' ? (
              <View style={{flexDirection:'row', alignItems:'flex-start', gap:10}}>
                <View style={{width:22, height:22, borderRadius:11, backgroundColor:'#2a2000', borderWidth:1, borderColor:'#FFC107', alignItems:'center', justifyContent:'center', marginTop:1, backgroundColor:'#2C2000'}}>
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={13} color="#FFC107" />
                </View>
                <View style={{flex:1}}>
                  <AppText style={{fontFamily:'SpecialElite', fontSize:9, color:'#8a7000', letterSpacing:2, marginBottom:4}}>IPUCU</AppText>
                  <AppText style={{fontFamily:'serif', fontSize:14, color:'#D4AA40', lineHeight:21}}>{msg.content}</AppText>
                </View>
              </View>
            ) : (
              <>{msg.sender && msg.type !== 'story' && <AppText style={d.senderName}>{msg.sender}</AppText>}<AppText style={[d.msgContent, { fontSize: getFontSize(15), lineHeight: getFontSize(22) }, (msg.type === 'question' || msg.type === 'story') && {color: '#E0E0E0'}]}>{msg.content}</AppText></>
            )}</View>))}{isLoading && <AppText style={{textAlign:'center', fontStyle:'italic', color:'#757575', margin:10, fontFamily:'serif'}}>Dedektif düşünüyor...</AppText>}</ScrollView>
            <View style={{backgroundColor:'#111111', borderTopWidth:1, borderTopColor:'#222', padding:12}}>
              {gameState === 'online_playing' && isHost ? (
                <View style={{width:'100%'}}>
                  <AppText style={{textAlign:'center', marginBottom:8, fontSize:11, color:'#B0B0B0', fontFamily:'SpecialElite', letterSpacing:1}}>CEVAP VER</AppText>
                  <View style={{flexDirection:'row', gap:8}}>
                    <TouchableOpacity onPress={() => sendOnlineAnswer('Evet')} style={[d.stampBtn, {borderColor:'#2E7D32', backgroundColor:'#1B5E20'}]}>
                      <AppText style={{color:'#A5D6A7', fontFamily:'SpecialElite'}}>EVET</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => sendOnlineAnswer('Hayir')} style={[d.stampBtn, {borderColor:'#C62828', backgroundColor:'#B71C1C'}]}>
                      <AppText style={{color:'#EF9A9A', fontFamily:'SpecialElite'}}>HAYIR</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => sendOnlineAnswer('Alakasiz')} style={[d.stampBtn, {borderColor:'#757575', backgroundColor:'#424242'}]}>
                      <AppText style={{color:'#BDBDBD', fontFamily:'SpecialElite'}}>A/S</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{gap:10}}>
                  <View style={{flexDirection:'row', gap:8}}>
                    <TouchableOpacity
                      onPress={() => setInputMode('question')}
                      style={{flex:1, paddingVertical:10, alignItems:'center', borderRadius:8, backgroundColor: inputMode==='question' ? '#141E33' : '#161616', borderWidth:1, borderColor: inputMode==='question' ? '#90CAF9' : '#2a3f6a'}}
                    >
                      <AppText style={{fontFamily:'SpecialElite', fontSize:12, color: inputMode==='question' ? '#90CAF9' : '#5a8abd', letterSpacing:1}}>SORU SOR</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setInputMode('answer')}
                      style={{flex:1, paddingVertical:10, alignItems:'center', borderRadius:8, backgroundColor: inputMode==='answer' ? '#111A11' : '#161616', borderWidth:1, borderColor: inputMode==='answer' ? '#4CAF50' : '#2a4a2a'}}
                    >
                      <AppText style={{fontFamily:'SpecialElite', fontSize:12, color: inputMode==='answer' ? '#4CAF50' : '#4a9a5a', letterSpacing:1}}>CEVAP VER</AppText>
                    </TouchableOpacity>
                  </View>
                  {inputMode === 'question' ? (
                    <View style={{flexDirection:'row', alignItems:'center', backgroundColor:'#161616', borderRadius:10, borderWidth:1, borderColor:'#2a2a2a', paddingHorizontal:12, gap:8}}>
                      <MaterialCommunityIcons name="comment-question-outline" size={18} color="#555" />
                      <TextInput
                        style={{flex:1, height:48, color:'#E0E0E0', fontFamily:'serif', fontSize:15}}
                        value={gameState === 'online_playing' ? onlineQuestionInput : questionInput}
                        onChangeText={gameState === 'online_playing' ? setOnlineQuestionInput : setQuestionInput}
                        ref={questionInputRef}
                        placeholder="Soru sor..."
                        placeholderTextColor="#444"
                      />
                      <TouchableOpacity
                        onPress={gameState === 'online_playing' ? sendOnlineQuestion : askQuestion}
                        disabled={isLoading}
                        style={{opacity: isLoading ? 0.4 : 1}}
                      >
                        <MaterialCommunityIcons name="send" size={22} color="#90CAF9" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{flexDirection:'row', alignItems:'center', backgroundColor:'#111A11', borderRadius:10, borderWidth:1, borderColor:'#2E7D32', paddingHorizontal:12, gap:8}}>
                      <MaterialCommunityIcons name="key-outline" size={18} color="#4CAF50" />
                      <TextInput
                        style={{flex:1, height:48, color:'#A5D6A7', fontFamily:'serif', fontSize:15}}
                        value={gameState === 'online_playing' ? onlineAnswerInput : answerInput}
                        onChangeText={gameState === 'online_playing' ? setOnlineAnswerInput : setAnswerInput}
                        ref={answerInputRef}
                        placeholder="Cevabi tahmin et..."
                        placeholderTextColor="#2E7D32"
                      />
                      <TouchableOpacity
                        onPress={gameState === 'online_playing' ? checkOnlineAnswer : checkAnswer}
                        disabled={isLoading}
                        style={{opacity: isLoading ? 0.4 : 1}}
                      >
                        <MaterialCommunityIcons name="arrow-right-circle-outline" size={24} color="#4CAF50" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
            
            {/* Terk Et Modal */}
            {showLeaveModal && (
              <View style={{position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.7)', alignItems:'center', justifyContent:'center', zIndex:999}}>
                <View style={{backgroundColor:'#1E1E1E', borderRadius:14, padding:24, marginHorizontal:24, borderWidth:1, borderColor:'#333'}}>
                  <AppText style={{fontFamily:'SpecialElite', fontSize:18, color:'#E0E0E0', textAlign:'center', marginBottom:8}}>Vakayı Terk Et?</AppText>
                  <AppText style={{fontFamily:'serif', fontSize:14, color:'#888', textAlign:'center', marginBottom:24, lineHeight:21}}>Dosyayı kapatırsan ilerlemen kaybolacak.</AppText>
                  <TouchableOpacity
                    onPress={() => { setShowLeaveModal(false); leaveRoom(); }}
                    style={{backgroundColor:'#8B0000', borderRadius:10, padding:14, alignItems:'center', marginBottom:10}}
                  >
                    <AppText style={{fontFamily:'SpecialElite', fontSize:15, color:'#E0E0E0'}}>Evet, Çık</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowLeaveModal(false)}
                    style={{backgroundColor:'#1A1A1A', borderRadius:10, padding:14, alignItems:'center', borderWidth:1, borderColor:'#333'}}
                  >
                    <AppText style={{fontFamily:'SpecialElite', fontSize:15, color:'#888'}}>Vazgeç</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
    const solveTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const mins = Math.floor(solveTime / 60);
    const secs = solveTime % 60;
    const timeStr = mins > 0 ? mins + 'dk ' + secs + 'sn' : secs + 'sn';
    const activeHints = gameState === 'online_solved' ? onlineHintsUsed : hintsUsed;
    return (
      <SafeAreaView style={d.container}>
        <ScrollView contentContainerStyle={[d.scrollContent, {justifyContent:'flex-start', paddingTop:40}]}>
          
          <View style={{alignItems:'center', marginBottom:32}}>
            <View style={{width:96, height:96, borderRadius:48, backgroundColor:'#1B5E20', alignItems:'center', justifyContent:'center', marginBottom:16, borderWidth:2, borderColor:'#2E7D32'}}>
              <MaterialCommunityIcons name="check-bold" size={52} color="#A5D6A7" />
            </View>
            <AppText style={{fontFamily:'SpecialElite', fontSize:11, color:'#555', letterSpacing:4, marginBottom:8}}>DOSYA KAPATILDI</AppText>
            <AppText style={{fontFamily:'SpecialElite', fontSize:30, color:'#E0E0E0', textAlign:'center'}}>{currentStory?.baslik}</AppText>
            <View style={{flexDirection:'row', alignItems:'center', gap:6, marginTop:10, paddingHorizontal:12, paddingVertical:5, backgroundColor:'#1E1E1E', borderRadius:20, borderWidth:1, borderColor:'#333'}}>
              <View style={{width:8, height:8, borderRadius:4, backgroundColor: difficulty==='kolay'?'#2E7D32':difficulty==='orta'?'#F9A825':'#C62828'}} />
              <AppText style={{fontFamily:'SpecialElite', fontSize:12, color:'#B0B0B0'}}>{difficulty?.toUpperCase()}</AppText>
            </View>
          </View>

          <View style={{flexDirection:'row', gap:12, marginBottom:24, width:'100%'}}>
            <View style={{flex:1, backgroundColor:'#1E1E1E', borderRadius:12, padding:16, alignItems:'center', borderWidth:1, borderColor:'#333'}}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#90CAF9" />
              <AppText style={{fontFamily:'SpecialElite', fontSize:20, color:'#E0E0E0', marginTop:6}}>{timeStr}</AppText>
              <AppText style={{fontFamily:'serif', fontSize:11, color:'#757575', marginTop:2}}>Sure</AppText>
            </View>
            <View style={{flex:1, backgroundColor:'#1E1E1E', borderRadius:12, padding:16, alignItems:'center', borderWidth:1, borderColor:'#333'}}>
              <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#FFCC80" />
              <AppText style={{fontFamily:'SpecialElite', fontSize:20, color:'#E0E0E0', marginTop:6}}>{activeHints}</AppText>
              <AppText style={{fontFamily:'serif', fontSize:11, color:'#757575', marginTop:2}}>Ipucu</AppText>
            </View>
            <View style={{flex:1, backgroundColor:'#1E1E1E', borderRadius:12, padding:16, alignItems:'center', borderWidth:1, borderColor:'#333'}}>
              <MaterialCommunityIcons name="comment-question-outline" size={24} color="#A5D6A7" />
              <AppText style={{fontFamily:'SpecialElite', fontSize:20, color:'#E0E0E0', marginTop:6}}>{questionsAsked}</AppText>
              <AppText style={{fontFamily:'serif', fontSize:11, color:'#757575', marginTop:2}}>Soru</AppText>
            </View>
          </View>

          <View style={{backgroundColor:'#1A2A1A', borderRadius:12, padding:20, width:'100%', borderWidth:1, borderColor:'#2E7D32', marginBottom:32}}>
            <AppText style={{fontFamily:'SpecialElite', fontSize:12, color:'#4CAF50', letterSpacing:2, marginBottom:10}}>GERCEK HIKAYE</AppText>
            <AppText style={{fontFamily:'serif', fontSize:15, color:'#C8E6C9', lineHeight:24}}>{currentStory?.cevap}</AppText>
          </View>

          <TouchableOpacity 
            onPress={() => startGame(difficulty, gameMode)} 
            style={{backgroundColor:'#1565C0', borderRadius:12, padding:16, alignItems:'center', width:'100%', marginBottom:12}}
          >
            <AppText style={{fontFamily:'SpecialElite', fontSize:16, color:'#E0E0E0'}}>Yeni Vaka</AppText>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={leaveRoom} 
            style={{backgroundColor:'#1E1E1E', borderRadius:12, padding:16, alignItems:'center', width:'100%', borderWidth:1, borderColor:'#333'}}
          >
            <AppText style={{fontFamily:'SpecialElite', fontSize:16, color:'#B0B0B0'}}>Ana Menu</AppText>
          </TouchableOpacity>

        </ScrollView>
        <ConfettiCannon ref={confettiRef} count={200} origin={{x:-10, y:0}} autoStart={false} fadeOut={true} />
      </SafeAreaView>
    );
  }

  if (gameState === 'reader_playing') {
      return (
        <SafeAreaView style={[d.container, {flex:1}]}>
          <View style={{backgroundColor:'#1E1E1E', borderBottomWidth:1, borderBottomColor:'#2a2a2a', paddingHorizontal:16, paddingVertical:12, flexDirection:'row', alignItems:'center'}}>
            <TouchableOpacity onPress={() => {setGameState('menu'); setCurrentStory(null);}} style={{padding:4, width:40}}>
              <MaterialCommunityIcons name="arrow-left" size={26} color="#E0E0E0" />
            </TouchableOpacity>
            <View style={{flex:1, alignItems:'center'}}>
              <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                <View style={{width:6, height:6, borderRadius:3, backgroundColor: difficulty==='kolay'?'#2E7D32':difficulty==='orta'?'#F9A825':'#C62828'}} />
                <AppText style={{fontFamily:'SpecialElite', fontSize:11, color:'#757575', letterSpacing:2}}>{difficulty?.toUpperCase()} DOSYASI</AppText>
              </View>
              <AppText style={{fontFamily:'SpecialElite', fontSize:18, color:'#E0E0E0', marginTop:2}} numberOfLines={1}>{currentStory?.baslik}</AppText>
            </View>
            <TouchableOpacity onPress={() => { startGame(difficulty, 'reader'); setShowAnswer(false); }} style={{width:40, alignItems:'flex-end'}}>
              <MaterialCommunityIcons name="refresh" size={22} color="#555" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{padding:24, paddingBottom:48, gap:16}}>

            <View style={{backgroundColor:'#1A1A1A', borderRadius:20, padding:24, borderWidth:1, borderColor:'#2a2a2a'}}>
              <View style={{flexDirection:'row', alignItems:'center', gap:8, marginBottom:16}}>
                <MaterialCommunityIcons name="file-document-outline" size={14} color="#555" />
                <AppText style={{fontFamily:'SpecialElite', fontSize:9, color:'#555', letterSpacing:3}}>VAKA OZETI</AppText>
              </View>
              <AppText style={{fontFamily:'serif', fontSize:17, color:'#D0D0D0', lineHeight:28, fontStyle:'italic'}}>{currentStory?.baslangic}</AppText>
            </View>

            <TouchableOpacity
              onPress={() => setShowAnswer(!showAnswer)}
              style={{backgroundColor: showAnswer ? '#162416' : '#1A1A1A', borderRadius:20, padding:20, borderWidth:1, borderColor: showAnswer ? '#2E7D32' : '#2a2a2a', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}
            >
              <View style={{flexDirection:'row', alignItems:'center', gap:12}}>
                <View style={{width:40, height:40, borderRadius:12, backgroundColor: showAnswer ? '#1E3A1E' : '#252525', alignItems:'center', justifyContent:'center'}}>
                  <MaterialCommunityIcons name={showAnswer ? "lock-open-outline" : "lock-outline"} size={22} color={showAnswer ? '#4CAF50' : '#666'} />
                </View>
                <View>
                  <AppText style={{fontFamily:'SpecialElite', fontSize:14, color: showAnswer ? '#4CAF50' : '#999'}}>
                    {showAnswer ? 'CEVABI GIZLE' : 'CEVABI GOSTER'}
                  </AppText>
                  {!showAnswer && <AppText style={{fontFamily:'serif', fontSize:11, color:'#444', marginTop:2}}>Hazir oldugunuzda acin</AppText>}
                </View>
              </View>
              <MaterialCommunityIcons name={showAnswer ? "chevron-up" : "chevron-down"} size={22} color={showAnswer ? '#4CAF50' : '#444'} />
            </TouchableOpacity>

            {showAnswer && (
              <View style={{backgroundColor:'#162416', borderRadius:20, padding:24, borderWidth:1, borderColor:'#2E7D32'}}>
                <AppText style={{fontFamily:'serif', fontSize:16, color:'#B8D8B8', lineHeight:26, marginBottom:24}}>{currentStory?.cevap}</AppText>
                <View style={{height:1, backgroundColor:'#2E7D32', opacity:0.3, marginBottom:20}} />
                <AppText style={{fontFamily:'SpecialElite', fontSize:9, color:'#4CAF50', letterSpacing:3, marginBottom:16}}>IPUCLARI</AppText>
                {currentStory?.ipuclari.map((hint, i) => (
                  <View key={i} style={{flexDirection:'row', gap:12, marginBottom:12, alignItems:'flex-start'}}>
                    <View style={{width:22, height:22, borderRadius:11, backgroundColor:'#2E7D32', alignItems:'center', justifyContent:'center'}}>
                      <AppText style={{fontFamily:'SpecialElite', fontSize:10, color:'#fff'}}>{i+1}</AppText>
                    </View>
                    <AppText style={{fontFamily:'serif', fontSize:14, color:'#88BB88', lineHeight:22, flex:1}}>{hint}</AppText>
                  </View>
                ))}
              </View>
            )}

            <View style={{height:16}} />

          </ScrollView>
          <View style={{padding:16, paddingBottom:8, borderTopWidth:1, borderTopColor:'#1a1a1a'}}>
            <TouchableOpacity
              onPress={() => { startGame(difficulty, 'reader'); setShowAnswer(false); }}
              style={{backgroundColor:'#1565C0', borderRadius:10, padding:16, alignItems:'center', marginBottom:8}}
            >
              <AppText style={{fontFamily:'SpecialElite', fontSize:15, color:'#E0E0E0', letterSpacing:1}}>Yeni Hikaye</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {setGameState('menu'); setCurrentStory(null);}}
              style={{padding:12, alignItems:'center'}}
            >
              <AppText style={{fontFamily:'SpecialElite', fontSize:13, color:'#555'}}>Ana Menuye Don</AppText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
  }

  if (gameState === 'difficulty' || gameState === 'reader_difficulty') {
    const diffConfig = {
      kolay: { color: '#2E7D32', bg: '#1B5E20', icon: 'shield-outline', label: 'Kolay', sub: 'Baslangiç seviyesi', count: '18 vaka' },
      orta:  { color: '#F9A825', bg: '#F57F17', icon: 'shield-half-full', label: 'Orta', sub: 'Biraz dusunmen gerekecek', count: '10 vaka' },
      zor:   { color: '#C62828', bg: '#B71C1C', icon: 'shield', label: 'Zor', sub: 'Gercek dedektifler icin', count: '6 vaka' },
    };
    return (
      <SafeAreaView style={d.container}>
        <View style={{flex:1, paddingHorizontal:20}}>
          <View style={{flexDirection:'row', alignItems:'center', paddingTop:20, marginBottom:32}}>
            <TouchableOpacity onPress={() => setGameState('menu')} style={{padding:8}}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" />
            </TouchableOpacity>
            <AppText style={{fontFamily:'SpecialElite', fontSize:22, color:'#E0E0E0', flex:1, textAlign:'center', marginRight:36}}>Zorluk Sec</AppText>
          </View>

          {['kolay', 'orta', 'zor'].map(d_key => {
            const cfg = diffConfig[d_key];
            return (
              <TouchableOpacity
                key={d_key}
                onPress={() => { setDifficulty(d_key); setGameState(gameState === 'reader_difficulty' ? 'reader_story_selection' : 'story_selection'); }}
                style={{backgroundColor:'#1E1E1E', borderRadius:16, padding:20, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#2a2a2a', marginBottom:12}}
              >
                <View style={{width:56, height:56, borderRadius:14, backgroundColor:cfg.bg+'33', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:cfg.color+'55'}}>
                  <MaterialCommunityIcons name={cfg.icon} size={28} color={cfg.color} />
                </View>
                <View style={{flex:1, marginLeft:16}}>
                  <AppText style={{fontFamily:'SpecialElite', fontSize:20, color:'#E0E0E0'}}>{cfg.label}</AppText>
                  <AppText style={{fontFamily:'serif', fontSize:12, color:'#757575', marginTop:3}}>{cfg.sub}</AppText>
                </View>
                <View style={{alignItems:'flex-end', gap:6}}>
                  <AppText style={{fontFamily:'SpecialElite', fontSize:11, color:cfg.color}}>{cfg.count}</AppText>
                  <MaterialCommunityIcons name="chevron-right" size={22} color="#444" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
  chatArea: { flex: 1, padding: 12, backgroundColor:'#0e0e0e' },
  msgBox: { padding: 12, paddingHorizontal: 14, borderRadius: 14, marginBottom: 8, maxWidth: '85%' },
  msgStory: { backgroundColor: '#1E1A0E', alignSelf: 'center', width: '100%', borderRadius:12, borderLeftWidth:3, borderLeftColor:'#FFC107', padding:16 },
  msgAi: { alignSelf: 'flex-start', backgroundColor: '#181818', borderRadius:14, borderBottomLeftRadius:4, borderWidth:1, borderColor:'#252525', maxWidth:'80%' },
  msgUser: { alignSelf: 'flex-end', backgroundColor: '#162040', borderRadius:14, borderBottomRightRadius:4, borderWidth:1, borderColor:'#1E2D5A', maxWidth:'80%' },
  msgHint: { alignSelf: 'stretch', backgroundColor: '#1C1800', borderRadius:8, borderWidth:1, borderColor:'#5a4400', paddingVertical:12, paddingHorizontal:14, marginHorizontal:4 },
  msgContent: { fontSize: 15, lineHeight: 22, fontFamily:'serif', color:'#C0C0C0' },
  senderName: { fontSize: 10, color: '#B0B0B0', marginBottom: 2, fontWeight:'bold', fontFamily:'SpecialElite' },
  inputSection: { padding: 14, paddingTop:10, backgroundColor: '#181818', borderTopWidth: 1, borderTopColor: '#2a2a2a', gap:8 },
  sendIconBtn: { width: 60, height: 60, backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  stampBtn: { flex: 1, height: 45, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  hintButton: { alignSelf:'stretch', flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:10, backgroundColor:'#1C1A00', borderRadius:10, borderWidth:1, borderColor:'#FFC107'+'44' },
  hintButtonDisabled: { opacity: 0.5, borderColor:'#555555' },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333333' },
  playerText: { fontSize: 16, color: '#E0E0E0', fontWeight:'600', fontFamily:'SpecialElite', marginLeft:10 },
  disabledButton: { opacity: 0.6 },
});

export default DetectiveGame;
