export const useOfflineEngine = (currentStory) => {
  const askOffline = (userQuestion) => {
    if (!currentStory?.sorular) {
      return "Alakasız";
    }
    
    const question = userQuestion.toLowerCase().trim();
    
    // Hikayenin soru-cevap veritabanını kontrol et
    for (const [key, data] of Object.entries(currentStory.sorular)) {
      for (const keyword of data.keywords) {
        const regex = new RegExp(keyword, 'i');
        if (regex.test(question)) {
          return data.answer;
        }
      }
    }
    
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

  return {
    askOffline,
    checkOfflineAnswer,
  };
};
