import { off, onValue, push, ref, remove, set, update } from 'firebase/database';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { database } from './firebaseConfig';

// HARİCİ HİKAYE DOSYASI
import { stories } from './data/stories';

// Font ve İkon Paketleri
import { SpecialElite_400Regular, useFonts } from '@expo-google-fonts/special-elite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// ============================================================
// 🔑 API ANAHTARI
// ============================================================
const GEMINI_API_KEY = 'AIzaSyBsurKcsjlwTr1hWBoW1HyLhfQehf6f-H8';

// ============================================================
// 🌐 GEMINI API HELPER
// ============================================================
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const callGemini = async (promptText) => {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 100 }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Boş yanıt geldi');
  return text;
};

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

  const scrollViewRef = useRef(null);
  const roomListenerRef = useRef(null);
  const messagesListenerRef = useRef(null);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    let interval = null;
    if (gameState === 'playing' || gameState === 'online_playing') {
      interval = setInterval(() => { setNow(Date.now()); }, 1000);
    } else { clearInterval(interval); }
    return () => clearInterval(interval);
  }, [gameState]);

  const formatTime = () => {
    if (!startTime) return '0:00';
    const seconds = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================
  // YAPAY ZEKA (GEMINI)
  // ============================================================

  const askGemini = async (userQuestion) => {
    try {
      const prompt = `Sen bir dedektiflik oyununun moderatörüsün. Hikaye: "${currentStory.baslangic}". Gerçek Çözüm: "${currentStory.cevap}". Oyuncunun Sorusu: "${userQuestion}". Görevin: Bu soruya sadece hikayenin gerçek çözümüne dayanarak "Evet", "Hayır" veya "Alakasız" cevabını ver. Asla çözümü söyleme. Sadece bu üç kelimeden birini yaz.`;
      return await callGemini(prompt);
    } catch (error) {
      console.error('askGemini hatası:', error.message);
      return `Bağlantı Hatası: ${error.message}`;
    }
  };

  const checkGeminiAnswer = async (userGuess) => {
    try {
      const prompt = `Hikaye Çözümü: "${currentStory.cevap}". Oyuncunun Tahmini: "${userGuess}". Bu tahmin hikayenin çözümünü doğru bir şekilde açıklıyor mu? Eğer ana fikir doğruysa sadece "DOĞRU" yaz. Eğer yanlışsa sadece "YANLIŞ" yaz. Başka hiçbir şey yazma.`;
      return await callGemini(prompt);
    } catch (error) {
      console.error('checkGeminiAnswer hatası:', error.message);
      return 'YANLIŞ';
    }
  };

  const askQuestion = async () => {
    if (!questionInput.trim() || isLoading) return;
    const newMessages = [...messages, { type: 'question', content: questionInput }];
    setMessages(newMessages); setIsLoading(true); setQuestionInput(''); 
    const aiResponse = await askGemini(questionInput);
    setMessages(curr => [...curr, { type: 'answer', content: aiResponse }]);
    setIsLoading(false);
  };

  const checkAnswer = async () => {
    if (!answerInput.trim() || isLoading) return;
    setIsLoading(true);
    const result = await checkGeminiAnswer(answerInput);
    if (result.includes("DOĞRU")) { setGameState('solved'); } 
    else { setMessages(curr => [...curr, { type: 'wrong', content: `❌ "${answerInput}" yanlış cevap.` }]); }
    setIsLoading(false); setAnswerInput('');
  };

  // ... (Firebase Functions) ...
  const createRoom = async () => {
    if (!playerName.trim() || !onlineDifficulty) return;
    const code = generateRoomCode();
    const storyList = stories[onlineDifficulty];
    const randomStory = storyList[Math.floor(Math.random() * storyList.length)];
    setRoomCode(code); setIsHost(true); setCurrentStory(randomStory);
    setOnlineMessages([]); setOnlineHintsUsed(0); setGuestList([]);
    await set(ref(database, `rooms/${code}`), { host: playerName.trim(), guests: {}, status: 'waiting', difficulty: onlineDifficulty, story: randomStory, hintsUsed: 0, createdAt: Date.now() });
    await set(ref(database, `rooms/${code}/messages/msg_0`), { type: 'story', content: randomStory.baslangic, timestamp: Date.now() });
    setGameState('waiting'); startListening(code);
  };

  const joinRoom = async () => {
    if (!playerName.trim() || inputRoomCode.length !== 6) return;
    setJoinError(''); setIsLoading(true);
    const code = inputRoomCode.trim();
    onValue(ref(database, `rooms/${code}`), async (snapshot) => {
      const data = snapshot.val();
      if (!data) { setJoinError('Dosya bulunamadı.'); setIsLoading(false); return; }
      setIsHost(false); setRoomCode(code); setCurrentStory(data.story);
      setDifficulty(data.difficulty); setOnlineMessages([]); setOnlineHintsUsed(0);
      const newGuestRef = push(ref(database, `rooms/${code}/guests`));
      await set(newGuestRef, { name: playerName.trim(), joinedAt: Date.now() });
      setIsLoading(false); setGameState('waiting'); startListening(code);
    }, { once: true });
  };

  const startListening = (code) => {
    removeListeners();
    const roomRefPath = ref(database, `rooms/${code}`);
    roomListenerRef.current = roomRefPath;
    onValue(roomRefPath, (snapshot) => {
      const data = snapshot.val();
      if (!data) { removeListeners(); setGameState('menu'); return; }
      setRoomData(data); setCurrentStory(data.story); setDifficulty(data.difficulty); setOnlineHintsUsed(data.hintsUsed || 0);
      if (data.guests) setGuestList(Object.values(data.guests)); else setGuestList([]);
      if (data.status === 'playing' && gameState !== 'online_playing') { setGameState('online_playing'); if (!startTime) setStartTime(Date.now()); }
      else if (data.status === 'solved') setGameState('online_solved');
    });
    const messagesRefPath = ref(database, `rooms/${code}/messages`);
    messagesListenerRef.current = messagesRefPath;
    onValue(messagesRefPath, (snapshot) => {
      const data = snapshot.val();
      if (data) setOnlineMessages(Object.values(data).sort((a, b) => a.timestamp - b.timestamp)); else setOnlineMessages([]);
    });
  };

  const startOnlineGame = async () => { if (isHost) await update(ref(database, `rooms/${roomCode}`), { status: 'playing' }); };
  const sendOnlineQuestion = async () => { if(!onlineQuestionInput.trim()) return; await set(ref(database, `rooms/${roomCode}/messages/msg_${Date.now()}`), { type: 'question', content: onlineQuestionInput.trim(), sender: playerName, timestamp: Date.now() }); setOnlineQuestionInput(''); };
  const sendOnlineAnswer = async (ans) => { await set(ref(database, `rooms/${roomCode}/messages/msg_${Date.now()}`), { type: 'answer', content: ans, sender: playerName, timestamp: Date.now() }); };
  const sendOnlineHint = async () => { if (!currentStory || onlineHintsUsed >= currentStory.ipuclari.length) return; await set(ref(database, `rooms/${roomCode}/messages/msg_${Date.now()}`), { type: 'hint', content: currentStory.ipuclari[onlineHintsUsed], timestamp: Date.now() }); await update(ref(database, `rooms/${roomCode}`), { hintsUsed: onlineHintsUsed + 1 }); };
  
  const checkOnlineAnswer = async () => {
    if (!onlineAnswerInput.trim() || isLoading) return;
    setIsLoading(true);
    const result = await checkGeminiAnswer(onlineAnswerInput);
    const msgKey = `msg_${Date.now()}`;
    if (result.includes("DOĞRU")) {
        await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), { type: 'solved', content: `🎉 "${onlineAnswerInput.trim()}" - Doğru cevap!`, sender: playerName, timestamp: Date.now() });
        await update(ref(database, `rooms/${roomCode}`), { status: 'solved' });
    } else {
        await set(ref(database, `rooms/${roomCode}/messages/${msgKey}`), { type: 'wrong', content: `❌ "${onlineAnswerInput.trim()}" - Yanlış, tekrar dene!`, timestamp: Date.now() });
    }
    setIsLoading(false); setOnlineAnswerInput('');
  };

  const removeListeners = () => { if (roomListenerRef.current) off(roomListenerRef.current); if (messagesListenerRef.current) off(messagesListenerRef.current); };
  const leaveRoom = async () => { removeListeners(); if (isHost && roomCode) await remove(ref(database, `rooms/${roomCode}`)); setRoomCode(''); setInputRoomCode(''); setRoomData(null); setOnlineMessages([]); setOnlineHintsUsed(0); setCurrentStory(null); setIsHost(false); setGuestList([]); setGameState('menu'); setGameMode(null); setStartTime(null); };
  const confirmLeave = () => { Alert.alert("Vakayı Terk Et?", "Dosyayı kapatırsan ilerlemen kaybolacak.", [{ text: "Vazgeç", style: "cancel" }, { text: "Evet, Çık", onPress: leaveRoom, style: "destructive" }]); };
  
  const startGame = (diff, mode = 'ai') => {
    const list = stories[diff];
    const story = list[Math.floor(Math.random() * list.length)];
    setDifficulty(diff); setCurrentStory(story); setGameMode(mode);
    if (mode === 'reader') { setGameState('reader_playing'); setShowAnswer(false); } 
    else { setGameState('playing'); setMessages([{ type: 'story', content: story.baslangic }]); }
    setStartTime(Date.now()); setNow(Date.now()); setHintsUsed(0);
  };
  const getHint = () => { if (hintsUsed >= currentStory?.ipuclari.length) return; if (gameState === 'playing') setMessages([...messages, { type: 'hint', content: currentStory.ipuclari[hintsUsed] }]); setHintsUsed(prev => prev + 1); };

  if (!fontsLoaded) return null;

  // ============================================================
  // RENDER
  // ============================================================
  if (gameState === 'menu') {
    return (
      <SafeAreaView style={d.container} onLayout={onLayoutRootView}>
        <ScrollView contentContainerStyle={d.scrollContent}>
          <View style={d.header}><MaterialCommunityIcons name="incognito" color="#E0E0E0" size={80} /><Text style={d.title}>Dedektif</Text><Text style={d.sub}>Gizemli hikayeleri çöz, gerçeği ortaya çıkar.</Text></View>
          <View style={d.cardWrapper}>
            <Text style={d.cardHeader}>OYUN MODU SEÇ</Text>
            <TouchableOpacity style={d.card} onPress={() => { setGameMode('ai'); setGameState('difficulty'); }}><View style={[d.iconBox, {backgroundColor:'#1A237E'}]}><MaterialCommunityIcons name="robot" size={24} color="#90CAF9" /></View><View style={{ flex: 1, marginLeft: 15 }}><Text style={d.cardTitle}>Yapay Zeka Modu</Text><Text style={d.cardSub}>AI ile tek başına oyna</Text></View><MaterialCommunityIcons name="chevron-right" size={24} color="#757575" /></TouchableOpacity>
            <TouchableOpacity style={d.card} onPress={() => { setGameMode('reader'); setGameState('reader_difficulty'); }}><View style={[d.iconBox, {backgroundColor:'#3E2723'}]}><MaterialCommunityIcons name="book-open-page-variant" size={24} color="#FFCC80" /></View><View style={{ flex: 1, marginLeft: 15 }}><Text style={d.cardTitle}>Hikaye Okuyucu</Text><Text style={d.cardSub}>Yüz yüze oyna</Text></View><MaterialCommunityIcons name="chevron-right" size={24} color="#757575" /></TouchableOpacity>
            <TouchableOpacity style={d.card} onPress={() => setGameState('online_menu')}><View style={[d.iconBox, {backgroundColor:'#1B5E20'}]}><MaterialCommunityIcons name="account-group" size={24} color="#A5D6A7" /></View><View style={{ flex: 1, marginLeft: 15 }}><Text style={d.cardTitle}>Online Çok Oyunculu</Text><Text style={d.cardSub}>Arkadaşla oda aç veya katıl</Text></View><MaterialCommunityIcons name="chevron-right" size={24} color="#757575" /></TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (gameState === 'online_menu') {
    return (
      <SafeAreaView style={d.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <ScrollView contentContainerStyle={d.scrollContent}>
          <View style={{width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20}}><TouchableOpacity onPress={() => setGameState('menu')} style={{padding:10, marginRight:10}}><MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" /></TouchableOpacity><View style={{alignItems:'center', flex:1, marginRight:38}}><MaterialCommunityIcons name="typewriter" size={40} color="#90CAF9" /><Text style={[d.titleSmall, {color:'#90CAF9', marginTop:5, fontSize:24}]}>Online Mod</Text></View></View>
          <View style={d.cardWrapper}>
            <Text style={d.vintageLabel}>Adın</Text><TextInput style={d.modernInput} value={playerName} onChangeText={setPlayerName} placeholder="Adını yaz..." placeholderTextColor="#757575" /><View style={d.divider} />
            <View><View style={{flexDirection:'row', alignItems:'center', gap:8, marginBottom:4}}><MaterialCommunityIcons name="home-outline" size={20} color="#B0B0B0" /><Text style={d.cardHeader}>Oda Oluştur</Text></View><Text style={[d.cardSub, {marginBottom:15}]}>Sen anlatıcı olursun, arkadaşın soru sorar</Text><Text style={[d.vintageLabel, {fontSize:12, color:'#B0B0B0'}]}>Zorluk Seviyesi</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>{['kolay', 'orta', 'zor'].map(d_key => (<TouchableOpacity key={d_key} onPress={() => setOnlineDifficulty(d_key)} style={[d.chipBtn, onlineDifficulty === d_key && d.chipBtnActive, d_key==='zor' && onlineDifficulty===d_key && {backgroundColor:'#C62828', borderColor:'#C62828'}, d_key==='orta' && onlineDifficulty===d_key && {backgroundColor:'#F9A825', borderColor:'#F9A825'}, d_key==='kolay' && onlineDifficulty===d_key && {backgroundColor:'#2E7D32', borderColor:'#2E7D32'}]}><View style={[d.dot, {backgroundColor: d_key==='kolay'?'#2E7D32':d_key==='orta'?'#F9A825':'#C62828'}, onlineDifficulty === d_key && {backgroundColor:'white'}]} /><Text style={[d.chipText, onlineDifficulty === d_key && {color:'white'}]}>{d_key.charAt(0).toUpperCase() + d_key.slice(1)}</Text></TouchableOpacity>))}</View>
              <TouchableOpacity style={[d.actionBtn, {backgroundColor:'#1565C0'}]} onPress={createRoom}><Text style={d.actionBtnText}>Oda Oluştur</Text></TouchableOpacity>
            </View><View style={d.divider} />
            <View><View style={{flexDirection:'row', alignItems:'center', gap:8, marginBottom:4}}><MaterialCommunityIcons name="link-variant" size={20} color="#B0B0B0" /><Text style={d.cardHeader}>Odaya Katıl</Text></View><Text style={[d.cardSub, {marginBottom:15}]}>Arkadaşın oda kodunu yaz</Text><Text style={d.vintageLabel}>Oda Kodu</Text><TextInput style={d.modernInput} value={inputRoomCode} onChangeText={setInputRoomCode} placeholder="123456" placeholderTextColor="#757575" keyboardType="numeric" maxLength={6} /><TouchableOpacity style={[d.actionBtn, { backgroundColor: '#2E7D32', marginTop:10 }]} onPress={joinRoom}><Text style={d.actionBtnText}>Odaya Katıl</Text></TouchableOpacity>{joinError ? <Text style={{ color: '#EF9A9A', fontSize: 12, marginTop: 10, textAlign:'center', fontFamily:'SpecialElite' }}>{joinError}</Text> : null}</View>
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
    return (
      <SafeAreaView style={d.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>
            <View style={d.gameHeader}><View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}><TouchableOpacity onPress={confirmLeave} style={{padding:5}}><MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" /></TouchableOpacity><Text style={d.gameTitle}>{difficulty?.toUpperCase()} DOSYASI</Text><View style={{width:24}} /> </View><Text style={d.storyTitle}>{currentStory?.baslik}</Text><Text style={d.timerText}>{formatTime()}</Text></View>
            <ScrollView ref={scrollViewRef} style={d.chatArea} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>{activeMessages.map((msg, idx) => (<View key={idx} style={[d.msgBox, msg.type === 'question' ? d.msgUser : msg.type === 'answer' ? d.msgAi : msg.type === 'hint' ? d.msgHint : msg.type === 'story' ? d.msgStory : d.msgAi]}>{msg.sender && msg.type !== 'story' && <Text style={d.senderName}>{msg.sender}</Text>}<Text style={[d.msgContent, (msg.type === 'question' || msg.type === 'story') && {color: '#E0E0E0'}]}>{msg.content}</Text></View>))}{isLoading && <Text style={{textAlign:'center', fontStyle:'italic', color:'#757575', margin:10, fontFamily:'serif'}}>Dedektif düşünüyor...</Text>}</ScrollView>
            <View style={d.inputSection}>
              {gameState === 'online_playing' && isHost ? (
                <View style={{width: '100%'}}><Text style={{textAlign:'center', marginBottom:5, fontSize:12, color:'#B0B0B0', fontFamily:'SpecialElite'}}>CEVAP VER:</Text><View style={{ flexDirection: 'row', gap: 10 }}><TouchableOpacity onPress={() => sendOnlineAnswer('Evet')} style={[d.stampBtn, { borderColor: '#2E7D32', backgroundColor:'#1B5E20' }]}><Text style={{ color: '#A5D6A7', fontFamily:'SpecialElite' }}>EVET</Text></TouchableOpacity><TouchableOpacity onPress={() => sendOnlineAnswer('Hayır')} style={[d.stampBtn, { borderColor: '#C62828', backgroundColor:'#B71C1C' }]}><Text style={{ color: '#EF9A9A', fontFamily:'SpecialElite' }}>HAYIR</Text></TouchableOpacity><TouchableOpacity onPress={() => sendOnlineAnswer('Alakasız')} style={[d.stampBtn, { borderColor: '#757575', backgroundColor:'#424242' }]}><Text style={{ color: '#BDBDBD', fontFamily:'SpecialElite' }}>A/S</Text></TouchableOpacity></View></View>
              ) : (
                <View style={{ width: '100%', gap: 12 }}><View style={{ flexDirection: 'row', gap: 10, alignItems:'center' }}><TextInput style={d.largeInput} value={gameState === 'online_playing' ? onlineQuestionInput : questionInput} onChangeText={gameState === 'online_playing' ? setOnlineQuestionInput : setQuestionInput} placeholder="Bir soru sor..." placeholderTextColor="#757575" /><TouchableOpacity style={d.sendIconBtn} onPress={gameState === 'online_playing' ? sendOnlineQuestion : askQuestion}><MaterialCommunityIcons name="send" size={24} color="#121212" /></TouchableOpacity></View><View style={{ flexDirection: 'row', gap: 10, alignItems:'center' }}><TextInput style={[d.largeInput, {borderColor: '#2E7D32', backgroundColor:'#1B5E20'}]} value={gameState === 'online_playing' ? onlineAnswerInput : answerInput} onChangeText={gameState === 'online_playing' ? setOnlineAnswerInput : setAnswerInput} placeholder="Cevabı tahmin et..." placeholderTextColor="#A5D6A7" /><TouchableOpacity style={[d.sendIconBtn, {backgroundColor: '#2E7D32'}]} onPress={gameState === 'online_playing' ? checkOnlineAnswer : checkAnswer}><MaterialCommunityIcons name="check-bold" size={24} color="#121212" /></TouchableOpacity></View></View>
              )}
               {(gameState !== 'online_playing' || isHost) && (<TouchableOpacity onPress={gameState === 'online_playing' ? sendOnlineHint : getHint} disabled={gameState === 'online_playing' ? onlineHintsUsed >= (currentStory?.ipuclari.length || 0) : hintsUsed >= (currentStory?.ipuclari.length || 0)} style={d.hintButton}><MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#FFCC80" /><Text style={{color:'#FFCC80', fontFamily:'SpecialElite', marginLeft:5}}>İpucu Al ({gameState === 'online_playing' ? onlineHintsUsed : hintsUsed}/{currentStory?.ipuclari.length})</Text></TouchableOpacity>)}
            </View>
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
            <ScrollView contentContainerStyle={d.scrollContent}><View style={{width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20}}><TouchableOpacity onPress={() => {setGameState('menu'); setCurrentStory(null);}} style={{padding:10, marginRight:10}}><MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" /></TouchableOpacity><Text style={[d.titleSmall, {flex:1, textAlign:'center', marginRight:38, fontSize:22}]}>Hikaye Okuyucu</Text></View><View style={d.cardWrapper}><Text style={d.cardHeader}>📖 {currentStory?.baslik}</Text><View style={{flexDirection:'row', alignItems:'center', gap:5, marginBottom:15}}><View style={[d.dot, {backgroundColor: difficulty==='kolay'?'#2E7D32':difficulty==='orta'?'#F9A825':'#C62828'}]} /><Text style={d.gameSub}>{difficulty?.toUpperCase()}</Text></View><View style={{backgroundColor:'#252525', padding:20, borderRadius:12, borderWidth:1, borderColor:'#333333', marginBottom:20}}><Text style={[d.msgContent, {fontStyle:'italic', fontSize:16}]}>{currentStory?.baslangic}</Text></View><View style={{borderTopWidth:1, borderColor:'#333333', paddingTop:20}}><TouchableOpacity onPress={() => setShowAnswer(!showAnswer)} style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#1E1E1E', padding:10, borderRadius:8}}><Text style={d.cardTitle}>🔒 Gizli Cevap</Text><MaterialCommunityIcons name={showAnswer ? "eye-off" : "eye"} size={24} color="#B0B0B0" /></TouchableOpacity>{showAnswer && (<View style={{marginTop:15, padding:10}}><Text style={d.msgContent}>{currentStory?.cevap}</Text><Text style={[d.cardHeader, {marginTop:15, fontSize:14}]}>İpuçları:</Text>{currentStory?.ipuclari.map((hint, i) => (<Text key={i} style={d.cardSub}>• {hint}</Text>))}</View>)}</View></View></ScrollView>
        </SafeAreaView>
      );
  }

  if (gameState === 'difficulty' || gameState === 'reader_difficulty') {
    return (
      <SafeAreaView style={d.container}>
        <View style={d.scrollContent}><View style={{width:'100%', flexDirection:'row', alignItems:'center', marginBottom:20}}><TouchableOpacity onPress={() => setGameState('menu')} style={{padding:10}}><MaterialCommunityIcons name="arrow-left" size={28} color="#E0E0E0" /></TouchableOpacity><Text style={[d.titleSmall, {flex:1, textAlign:'center', marginRight:30}]}>Zorluk Seç</Text></View>{['kolay', 'orta', 'zor'].map(d_key => (<TouchableOpacity key={d_key} style={d.card} onPress={() => startGame(d_key, gameMode)}><View style={[d.iconBox, d_key==='kolay' ? {backgroundColor:'#1B5E20'} : d_key==='orta' ? {backgroundColor:'#F57F17'} : {backgroundColor:'#B71C1C'}]}><View style={[d.dot, {width:16, height:16, backgroundColor: d_key==='kolay' ? '#2E7D32' : d_key==='orta' ? '#F9A825' : '#C62828'}]} /></View><View style={{ flex: 1, marginLeft: 15 }}><Text style={d.cardTitle}>{d_key.charAt(0).toUpperCase() + d_key.slice(1)}</Text><Text style={d.cardSub}>{d_key === 'kolay' ? 'Başlangıç seviyesi' : d_key === 'orta' ? 'Biraz düşünmen gerekecek' : 'Gerçek dedektifler için'}</Text></View><MaterialCommunityIcons name="arrow-right" size={24} color="#757575" /></TouchableOpacity>))}</View>
      </SafeAreaView>
    );
  }

  return null;
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
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333333' },
  playerText: { fontSize: 16, color: '#E0E0E0', fontWeight:'600', fontFamily:'SpecialElite', marginLeft:10 },
});

export default DetectiveGame;