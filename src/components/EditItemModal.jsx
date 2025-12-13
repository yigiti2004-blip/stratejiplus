import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpItemForm from './sp/SpItemForm';

export const EditItemModal = ({
  isOpen,
  editingItem,
  itemType,
  allData,
  parentItem,
  organizations,
  onSave,
  onClose
}) => {
  const handleSave = (formData) => {
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {editingItem ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}
              </h2>
              <button
                className="modal-close-btn"
                onClick={onClose}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <SpItemForm
                editingItem={editingItem}
                itemType={itemType}
                allData={allData}
                parentItem={parentItem}
                organizations={organizations}
                onSave={handleSave}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditItemModal;