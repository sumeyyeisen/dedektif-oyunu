import Constants from 'expo-constants';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const useOfflineEngine = (currentStory) => {

  const askGemini = async (userQuestion) => {
    if (!genAI || !currentStory) return 'Alakasiz';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Sen bir dedektif oyununda anlatici rolundesin.

Hikaye: "${currentStory.baslangic}"
Gercek cevap (bunu oyuncuya soylemeyeceksin): "${currentStory.cevap}"

Oyuncu sana su soruyu sordu: "${userQuestion}"

Sadece "Evet", "Hayir" veya "Alakasiz" ile cevap ver. Baska hicbir sey yazma.
- Soru hikayeyle ilgiliyse ve cevap evetse: Evet
- Soru hikayeyle ilgiliyse ve cevap hayirsa: Hayir  
- Soru hikayeyle alakasizsa: Alakasiz`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text.includes('Evet') || text.includes('evet')) return 'Evet';
      if (text.includes('Hayir') || text.includes('hayir') || text.includes('Hayır') || text.includes('hayır')) return 'Hayır';
      return 'Alakasiz';
    } catch (error) {
      console.error('Gemini error:', error);
      return askOfflineFallback(userQuestion);
    }
  };

  const checkGemini = async (userGuess) => {
    if (!genAI || !currentStory) return checkOfflineFallback(userGuess);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Bir dedektif oyununda oyuncunun cevabini degerlendiriyorsun.

Gercek cevap: "${currentStory.cevap}"
Oyuncunun cevabi: "${userGuess}"

Oyuncunun cevabi gercek cevapla ayni anlama geliyor mu? Sadece "DOGRU" veya "YANLIS" yaz.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().toUpperCase();
      console.log("Gemini check response:", JSON.stringify(text));
      if (text.includes('DOGRU') || text.includes('DOĞRU') || text.includes('DOĞRU')) return 'DOĞRU';
      return 'YANLIŞ';
    } catch (error) {
      console.error('Gemini check error:', error);
      return checkOfflineFallback(userGuess);
    }
  };

  // Fallback: Gemini calismaz ise keyword sistemi
  const askOfflineFallback = (userQuestion) => {
    if (!currentStory?.sorular) return 'Alakasiz';
    const question = userQuestion.toLowerCase().trim();
    for (const [key, data] of Object.entries(currentStory.sorular)) {
      for (const keyword of data.keywords) {
        const regex = new RegExp(keyword, 'i');
        if (regex.test(question)) return data.answer;
      }
    }
    return 'Alakasiz';
  };

  const checkOfflineFallback = (userGuess) => {
    if (!currentStory?.cevap) return 'YANLIŞ';
    const guess = userGuess.toLowerCase().trim();
    const solution = currentStory.cevap.toLowerCase();
    const solutionWords = solution.split(/\s+/).filter(w => w.length > 3);
    const guessWords = guess.split(/\s+/).filter(w => w.length > 3);
    let matchCount = 0;
    for (const word of guessWords) {
      if (solutionWords.some(sw => sw.includes(word) || word.includes(sw))) matchCount++;
    }
    const matchRatio = matchCount / Math.max(solutionWords.length, guessWords.length);
    return matchRatio > 0.4 ? 'DOĞRU' : 'YANLIŞ';
  };

  return {
    askOffline: askGemini,
    checkOfflineAnswer: checkGemini,
  };
};
