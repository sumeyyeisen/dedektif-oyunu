import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { database } from '../../../config/firebaseConfig';
import { loadRandomStory } from '../../../data/stories/storyLoader';
import { validatePlayerName, validateRoomCode } from '../../../shared/utils/errorHandler';

const generateRoomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const useFirebase = () => {
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [onlineMessages, setOnlineMessages] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  const roomListenerRef = useRef(null);
  const messagesListenerRef = useRef(null);

  const removeListeners = () => {
    if (roomListenerRef.current) {
      roomListenerRef.current();
      roomListenerRef.current = null;
    }
    if (messagesListenerRef.current) {
      messagesListenerRef.current();
      messagesListenerRef.current = null;
    }
  };

  const startListening = (code, callbacks) => {
    removeListeners();
    
    const roomRefPath = ref(database, `rooms/${code}`);
    const messagesRefPath = ref(database, `rooms/${code}/messages`);
    
    const roomUnsubscribe = onValue(roomRefPath, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        removeListeners();
        callbacks.onRoomClosed?.();
        return;
      }
      setRoomData(data);
      setGuestList(data.guests ? Object.values(data.guests) : []);
      callbacks.onRoomUpdate?.(data);
    }, (error) => {
      console.error('Room listener error:', error);
      Alert.alert('Bağlantı Hatası', 'Oda bağlantısı kesildi.');
      removeListeners();
      callbacks.onError?.();
    });
    
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
    
    roomListenerRef.current = roomUnsubscribe;
    messagesListenerRef.current = messagesUnsubscribe;
  };

  const createRoom = async (playerName, difficulty) => {
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      Alert.alert('Hata', nameValidation.error);
      return null;
    }
    if (!difficulty) {
      Alert.alert('Hata', 'Lütfen zorluk seviyesi seçin');
      return null;
    }
    
    try {
      const code = generateRoomCode();
      const randomStory = await loadRandomStory(difficulty);
      
      await set(ref(database, `rooms/${code}`), {
        host: playerName.trim(),
        guests: {},
        status: 'waiting',
        difficulty,
        story: randomStory,
        hintsUsed: 0,
        createdAt: Date.now(),
      });
      
      await set(ref(database, `rooms/${code}/messages/msg_0`), {
        type: 'story',
        content: randomStory.baslangic,
        timestamp: Date.now(),
      });
      
      setRoomCode(code);
      setIsHost(true);
      return { code, story: randomStory };
    } catch (error) {
      console.error('createRoom error:', error);
      Alert.alert('Hata', 'Oda oluşturulamadı. Lütfen tekrar deneyin.');
      return null;
    }
  };

  const joinRoom = async (playerName, inputRoomCode) => {
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      setJoinError(nameValidation.error);
      return null;
    }
    
    const codeValidation = validateRoomCode(inputRoomCode);
    if (!codeValidation.valid) {
      setJoinError(codeValidation.error);
      return null;
    }
    
    setJoinError('');
    setIsLoading(true);
    const code = inputRoomCode.trim();
    
    try {
      return new Promise((resolve) => {
        onValue(ref(database, `rooms/${code}`), async (snapshot) => {
          const data = snapshot.val();
          if (!data) {
            setJoinError('Oda bulunamadı.');
            setIsLoading(false);
            resolve(null);
            return;
          }
          
          const newGuestRef = push(ref(database, `rooms/${code}/guests`));
          await set(newGuestRef, { name: playerName.trim(), joinedAt: Date.now() });
          
          setRoomCode(code);
          setIsHost(false);
          setIsLoading(false);
          resolve({ code, story: data.story, difficulty: data.difficulty });
        }, { once: true });
      });
    } catch (error) {
      console.error('joinRoom error:', error);
      setJoinError('Odaya katılınamadı. Lütfen tekrar deneyin.');
      setIsLoading(false);
      return null;
    }
  };

  const leaveRoom = async () => {
    removeListeners();
    if (isHost && roomCode) {
      await remove(ref(database, `rooms/${roomCode}`));
    }
    setRoomCode('');
    setRoomData(null);
    setOnlineMessages([]);
    setIsHost(false);
    setGuestList([]);
  };

  const startGame = async () => {
    if (isHost && roomCode) {
      await update(ref(database, `rooms/${roomCode}`), { status: 'playing' });
    }
  };

  const sendMessage = async (type, content, sender) => {
    if (!roomCode) return;
    await set(ref(database, `rooms/${roomCode}/messages/msg_${Date.now()}`), {
      type,
      content,
      sender,
      timestamp: Date.now(),
    });
  };

  const sendHint = async (currentStory, hintsUsed) => {
    if (!currentStory || hintsUsed >= currentStory.ipuclari.length) return;
    await sendMessage('hint', currentStory.ipuclari[hintsUsed], 'Sistem');
    await update(ref(database, `rooms/${roomCode}`), { hintsUsed: hintsUsed + 1 });
  };

  const markSolved = async () => {
    if (roomCode) {
      await update(ref(database, `rooms/${roomCode}`), { status: 'solved' });
    }
  };

  useEffect(() => {
    return () => {
      removeListeners();
    };
  }, []);

  return {
    roomCode,
    roomData,
    isHost,
    onlineMessages,
    guestList,
    isLoading,
    joinError,
    setJoinError,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    sendMessage,
    sendHint,
    markSolved,
    startListening,
  };
};
