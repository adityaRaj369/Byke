import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Upload, ChevronRight, Shield } from 'lucide-react-native';

const DocumentsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [docs, setDocs] = useState([
    { id: 'dl', label: 'Driving License', status: 'verified', icon: FileText },
    { id: 'rc', label: 'Vehicle RC', status: 'verified', icon: FileText },
    { id: 'ins', label: 'Insurance Policy', status: 'pending', icon: Shield },
    { id: 'pan', label: 'PAN Card', status: 'missing', icon: FileText },
    { id: 'aadhar', label: 'Aadhaar Card', status: 'verified', icon: FileText },
  ]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'verified': return { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, color: '#10B981', label: 'Verified' };
      case 'pending': return { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock, color: '#F59E0B', label: 'Pending' };
      case 'missing': return { bg: 'bg-red-50', text: 'text-red-700', icon: AlertCircle, color: '#EF4444', label: 'Missing' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', icon: AlertCircle, color: '#6B7280', label: status };
    }
  };

  const handleUpload = (id: string) => {
    Alert.alert('Upload Document', `Please select a clear photo of your ${id.toUpperCase()}.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mr-4"
          >
            <ArrowLeft size={24} color="black" strokeWidth={2.5} />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-black text-black">Documents</Text>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Verification Center</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Verification Banner */}
        <View className="bg-black rounded-[40px] p-8 mb-10 shadow-2xl shadow-black/20 overflow-hidden">
          <View className="relative z-10">
            <Text className="text-yellow-400 text-xs font-black uppercase tracking-[4px]">Verification Progress</Text>
            <Text className="text-white text-4xl font-black mt-4">80%</Text>
            <View className="w-full h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
              <View className="w-[80%] h-full bg-yellow-400" />
            </View>
            <Text className="text-white/60 text-[10px] font-bold mt-4">Only one document left to start accepting high-value orders!</Text>
          </View>
          <View className="absolute -bottom-10 -right-10 opacity-10">
            <Shield size={180} color="white" />
          </View>
        </View>

        <Text className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-6 ml-1">Required Items</Text>

        {docs.map((doc) => {
          const status = getStatusStyle(doc.status);
          return (
            <TouchableOpacity
              key={doc.id}
              activeOpacity={0.7}
              onPress={() => doc.status !== 'verified' && handleUpload(doc.id)}
              className="flex-row items-center bg-white border border-gray-100 p-5 rounded-[32px] mb-4 shadow-sm shadow-black/5"
            >
              <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center mr-4">
                <doc.icon size={22} color="#6B7280" />
              </View>
              
              <View className="flex-1">
                <Text className="text-base font-black text-gray-800">{doc.label}</Text>
                <View className="flex-row items-center mt-1">
                  <status.icon size={10} color={status.color} strokeWidth={3} />
                  <Text className={`text-[10px] font-black uppercase tracking-widest ml-1 ${status.text}`}>
                    {status.label}
                  </Text>
                </View>
              </View>

              {doc.status !== 'verified' ? (
                <View className="bg-black p-2.5 rounded-xl">
                  <Upload size={16} color="white" strokeWidth={2.5} />
                </View>
              ) : (
                <ChevronRight size={20} color="#D1D5DB" strokeWidth={3} />
              )}
            </TouchableOpacity>
          );
        })}

        <View className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex-row items-center mt-6 mb-12">
          <View className="bg-blue-500/10 p-3 rounded-2xl mr-4">
            <Info size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-blue-900 font-black text-sm">Need help?</Text>
            <Text className="text-blue-700 font-bold text-xs mt-0.5">Verification usually takes 24-48 hours after upload.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DocumentsScreen;
