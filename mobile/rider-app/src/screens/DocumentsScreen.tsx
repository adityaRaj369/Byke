import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateDocuments } from '../store/slices/riderSlice';
import { AppDispatch, RootState } from '../store';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import api from '../config/api';

const DocumentsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.rider);
  const [uploading, setUploading] = useState<string | null>(null);

  const documents = [
    { key: 'drivingLicenseUrl', label: 'Driving License', icon: '🪪' },
    { key: 'aadharCardUrl', label: 'Aadhar Card', icon: '🆔' },
    { key: 'panCardUrl', label: 'PAN Card', icon: '💳' },
    { key: 'vehicleRcUrl', label: 'Vehicle RC', icon: '📄' },
    { key: 'vehicleInsuranceUrl', label: 'Vehicle Insurance', icon: '🛡️' },
    { key: 'vehiclePucUrl', label: 'PUC Certificate', icon: '✅' },
    { key: 'vehiclePhotoUrl', label: 'Vehicle Photo', icon: '🏍️' },
    { key: 'selfieWithVehicleUrl', label: 'Selfie with Vehicle', icon: '🤳' },
  ];

  const handleSelectImage = (documentKey: string) => {
    Alert.alert(
      'Upload Document',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => captureImage(documentKey),
        },
        {
          text: 'Gallery',
          onPress: () => pickImage(documentKey),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const captureImage = async (documentKey: string) => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]) {
      uploadDocument(documentKey, result.assets[0]);
    }
  };

  const pickImage = async (documentKey: string) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]) {
      uploadDocument(documentKey, result.assets[0]);
    }
  };

  const uploadDocument = async (documentKey: string, asset: any) => {
    setUploading(documentKey);
    
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'document.jpg',
      });

      const response = await api.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = response.data;
      
      await dispatch(updateDocuments({ [documentKey]: fileUrl })).unwrap();
      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const getDocumentStatus = (doc: any) => {
    const url = profile?.[doc.key];
    if (!url) return { color: 'bg-gray-100', text: 'Not Uploaded', textColor: 'text-gray-600' };
    return { color: 'bg-green-100', text: 'Uploaded', textColor: 'text-green-800' };
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Documents</Text>
        <Text className="text-gray-600 mb-6">
          Upload all required documents for verification
        </Text>

        {documents.map((doc) => {
          const status = getDocumentStatus(doc);
          const isUploading = uploading === doc.key;

          return (
            <View key={doc.key} className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <Text className="text-3xl mr-3">{doc.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">{doc.label}</Text>
                    <View className={`${status.color} px-2 py-1 rounded mt-1 self-start`}>
                      <Text className={`text-xs font-semibold ${status.textColor}`}>
                        {status.text}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {profile?.[doc.key] && (
                <Image
                  source={{ uri: profile[doc.key] }}
                  className="w-full h-40 rounded-lg mb-3"
                  resizeMode="cover"
                />
              )}

              <TouchableOpacity
                className="bg-blue-600 rounded-lg py-3 items-center"
                onPress={() => handleSelectImage(doc.key)}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">
                    {profile?.[doc.key] ? 'Replace' : 'Upload'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        <View className="bg-blue-50 rounded-lg p-4 mt-4">
          <Text className="text-blue-900 font-semibold mb-2">📋 Document Guidelines</Text>
          <Text className="text-blue-800 text-sm mb-1">• All documents must be clear and readable</Text>
          <Text className="text-blue-800 text-sm mb-1">• Documents should be valid and not expired</Text>
          <Text className="text-blue-800 text-sm">• Selfie with vehicle must show your face clearly</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default DocumentsScreen;
