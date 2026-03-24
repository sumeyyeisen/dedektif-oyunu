import { Alert } from 'react-native';

export const handleFirebaseError = (error, context = '') => {
  console.error(`Firebase Error [${context}]:`, error);
  
  let message = 'Bir hata oluştu. Lütfen tekrar deneyin.';
  
  if (error.code === 'PERMISSION_DENIED') {
    message = 'Bu işlem için yetkiniz yok.';
  } else if (error.message?.includes('network')) {
    message = 'İnternet bağlantınızı kontrol edin.';
  } else if (error.message?.includes('not found')) {
    message = 'Oda bulunamadı. Kod doğru mu?';
  }
  
  Alert.alert('Hata', message);
};

export const validateRoomCode = (code) => {
  if (!code || code.length !== 6) {
    return { valid: false, error: 'Oda kodu 6 haneli olmalı' };
  }
  if (!/^\d+$/.test(code)) {
    return { valid: false, error: 'Oda kodu sadece rakam içermeli' };
  }
  return { valid: true };
};

export const validatePlayerName = (name) => {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'İsim en az 2 karakter olmalı' };
  }
  if (name.trim().length > 20) {
    return { valid: false, error: 'İsim en fazla 20 karakter olabilir' };
  }
  return { valid: true };
};
