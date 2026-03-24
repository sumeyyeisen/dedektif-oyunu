import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Soru Geçmişi Paneli
 * Sorulan tüm soruları gösterir
 */
const QuestionHistoryPanel = ({ visible, onClose, messages }) => {
  const [filter, setFilter] = useState('all'); // all, yes, no, irrelevant

  // Soru-cevap çiftlerini grupla
  const questionPairs = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].type === 'question') {
      const question = messages[i];
      const answer = messages[i + 1];
      if (answer && answer.type === 'answer') {
        questionPairs.push({ question, answer });
        i++; // Cevabı atla
      }
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="history" size={24} color="#90CAF9" />
              <Text style={styles.headerTitle}>Soru Geçmişi</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          {/* Filtreler */}
          <View style={styles.filters}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                Tümü ({questionPairs.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'yes' && styles.filterButtonActive]}
              onPress={() => setFilter('yes')}
            >
              <Text style={[styles.filterText, filter === 'yes' && styles.filterTextActive]}>
                Evet
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'no' && styles.filterButtonActive]}
              onPress={() => setFilter('no')}
            >
              <Text style={[styles.filterText, filter === 'no' && styles.filterTextActive]}>
                Hayır
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'irrelevant' && styles.filterButtonActive]}
              onPress={() => setFilter('irrelevant')}
            >
              <Text style={[styles.filterText, filter === 'irrelevant' && styles.filterTextActive]}>
                Alakasız
              </Text>
            </TouchableOpacity>
          </View>

          {/* Soru Listesi */}
          <ScrollView style={styles.questionList}>
            {questionPairs.map((pair, index) => {
              // Filtre kontrolü
              if (filter !== 'all') {
                const answerText = pair.answer.content.toLowerCase();
                if (filter === 'yes' && !answerText.includes('evet')) return null;
                if (filter === 'no' && !answerText.includes('hayır')) return null;
                if (filter === 'irrelevant' && !answerText.includes('alakasız')) return null;
              }

              return (
                <View key={index} style={styles.questionPair}>
                  <View style={styles.questionBox}>
                    <MaterialCommunityIcons name="comment-question" size={16} color="#90CAF9" />
                    <Text style={styles.questionText}>{pair.question.content}</Text>
                  </View>
                  <View style={styles.answerBox}>
                    <MaterialCommunityIcons 
                      name={
                        pair.answer.content.toLowerCase().includes('evet') ? 'check-circle' :
                        pair.answer.content.toLowerCase().includes('hayır') ? 'close-circle' :
                        'help-circle'
                      }
                      size={16}
                      color={
                        pair.answer.content.toLowerCase().includes('evet') ? '#2E7D32' :
                        pair.answer.content.toLowerCase().includes('hayır') ? '#C62828' :
                        '#757575'
                      }
                    />
                    <Text style={styles.answerText}>{pair.answer.content}</Text>
                  </View>
                </View>
              );
            })}
            {questionPairs.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="comment-question-outline" size={64} color="#555555" />
                <Text style={styles.emptyText}>Henüz soru sorulmadı</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    fontFamily: 'SpecialElite',
  },
  closeButton: {
    padding: 4,
  },
  filters: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#2C2C2C',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#90CAF9',
  },
  filterText: {
    fontSize: 12,
    color: '#B0B0B0',
    fontFamily: 'SpecialElite',
  },
  filterTextActive: {
    color: '#121212',
  },
  questionList: {
    flex: 1,
    padding: 16,
  },
  questionPair: {
    marginBottom: 16,
    gap: 8,
  },
  questionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#37474F',
    borderRadius: 12,
    borderBottomRightRadius: 2,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: '#E0E0E0',
    fontFamily: 'serif',
    lineHeight: 20,
  },
  answerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#252525',
    borderRadius: 12,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#333333',
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    color: '#B0B0B0',
    fontFamily: 'serif',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#555555',
    marginTop: 16,
    fontFamily: 'serif',
  },
});

export default QuestionHistoryPanel;
