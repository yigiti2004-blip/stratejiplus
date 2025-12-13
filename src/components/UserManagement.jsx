import React from 'react';
import { Users, AlertCircle } from 'lucide-react';

const UserManagement = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center h-96">
      <div className="bg-green-50 p-4 rounded-full mb-4">
        <Users className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Kullanıcı Yönetimi</h2>
      <p className="text-gray-500 max-w-md mb-6">
        Bu modül yapım aşamasındadır. Organizasyon şeması ve kullanıcı yetkilendirmelerini buradan yönetebileceksiniz.
      </p>
      <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg">
        <AlertCircle className="w-4 h-4 mr-2" />
        Geliştirme devam ediyor
      </div>
    </div>
  );
};

export default UserManagement;