import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

/**
 * Not Alma Paneli
 * Oyun içinde not tutma
 */
const NotesPanel = ({ visible, onClose, notes, onSaveNotes }) => {
  const [localNotes, setLocalNotes] = useState(notes || '');

  const handleSave = () => {
    onSaveNotes(localNotes);
    onClose();
  };

  const handleClear = () => {
    setLocalNotes('');
  };

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
              <MaterialCommunityIcons name="notebook" size={24} color="#90CAF9" />
              <Text style={styles.headerTitle}>Notlarım</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          {/* Not Alanı */}
          <ScrollView style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              value={localNotes}
              onChangeText={setLocalNotes}
              placeholder="Notlarını buraya yaz..."
              placeholderTextColor="#757575"
              multiline
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Alt Butonlar */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#EF9A9A" />
              <Text style={styles.clearButtonText}>Temizle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <MaterialCommunityIcons name="content-save" size={20} color="#121212" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
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
  notesContainer: {
    flex: 1,
    padding: 16,
  },
  notesInput: {
    fontSize: 15,
    color: '#E0E0E0',
    fontFamily: 'serif',
    minHeight: 200,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButton: {
    backgroundColor: '#2C2C2C',
    borderWidth: 1,
    borderColor: '#C62828',
  },
  clearButtonText: {
    color: '#EF9A9A',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'SpecialElite',
  },
  saveButton: {
    backgroundColor: '#90CAF9',
  },
  saveButtonText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'SpecialElite',
  },
});

export default NotesPanel;
