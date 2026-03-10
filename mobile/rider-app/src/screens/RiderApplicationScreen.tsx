import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { applyAsRider } from '../store/slices/riderSlice';
import { AppDispatch } from '../store';

const RiderApplicationScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Personal Info
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [homeAddress, setHomeAddress] = useState('');

  // Vehicle Info
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleRegistrationNumber, setVehicleRegistrationNumber] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  // Bank Details
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankAccountHolderName, setBankAccountHolderName] = useState('');

  const handleSubmit = async () => {
    if (!fullName || !dateOfBirth || !gender || !homeAddress) {
      Alert.alert('Error', 'Please fill all personal information');
      return;
    }

    if (!vehicleType || !vehicleMake || !vehicleModel || !vehicleRegistrationNumber) {
      Alert.alert('Error', 'Please fill all vehicle information');
      return;
    }

    if (!bankAccountNumber || !bankIfscCode || !bankAccountHolderName) {
      Alert.alert('Error', 'Please fill all bank details');
      return;
    }

    setLoading(true);
    try {
      await dispatch(applyAsRider({
        fullName,
        dateOfBirth,
        gender,
        homeAddress,
        vehicleType,
        vehicleMake,
        vehicleModel,
        vehicleYear: parseInt(vehicleYear),
        vehicleRegistrationNumber,
        vehicleColor,
        bankAccountNumber,
        bankIfscCode,
        bankAccountHolderName,
      })).unwrap();

      Alert.alert(
        'Application Submitted!',
        'Your rider application has been submitted. Please upload your documents next.',
        [{ text: 'OK', onPress: () => navigation.replace('Documents') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text className="text-2xl font-bold text-gray-900 mb-6">Personal Information</Text>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Full Name *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Date of Birth *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="DD/MM/YYYY"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Gender *</Text>
        <View className="flex-row">
          {['Male', 'Female', 'Other'].map((g) => (
            <TouchableOpacity
              key={g}
              className={`flex-1 mx-1 py-3 rounded-lg border ${
                gender === g ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
              }`}
              onPress={() => setGender(g)}
            >
              <Text
                className={`text-center font-semibold ${
                  gender === g ? 'text-white' : 'text-gray-700'
                }`}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Home Address *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="Enter your home address"
          value={homeAddress}
          onChangeText={setHomeAddress}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        className="bg-blue-600 rounded-lg py-4 items-center"
        onPress={() => setStep(2)}
      >
        <Text className="text-white font-semibold text-base">Next: Vehicle Information</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text className="text-2xl font-bold text-gray-900 mb-6">Vehicle Information</Text>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Vehicle Type *</Text>
        <View className="flex-row">
          {['BIKE', 'SCOOTER'].map((type) => (
            <TouchableOpacity
              key={type}
              className={`flex-1 mx-1 py-3 rounded-lg border ${
                vehicleType === type ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
              }`}
              onPress={() => setVehicleType(type)}
            >
              <Text
                className={`text-center font-semibold ${
                  vehicleType === type ? 'text-white' : 'text-gray-700'
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Make & Model *</Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 mr-2"
            placeholder="Make (e.g., Honda)"
            value={vehicleMake}
            onChangeText={setVehicleMake}
          />
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Model (e.g., Activa)"
            value={vehicleModel}
            onChangeText={setVehicleModel}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Registration Number *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="e.g., DL01AB1234"
          value={vehicleRegistrationNumber}
          onChangeText={(text) => setVehicleRegistrationNumber(text.toUpperCase())}
          autoCapitalize="characters"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Year & Color</Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 mr-2"
            placeholder="Year (e.g., 2020)"
            value={vehicleYear}
            onChangeText={setVehicleYear}
            keyboardType="numeric"
            maxLength={4}
          />
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Color (e.g., Black)"
            value={vehicleColor}
            onChangeText={setVehicleColor}
          />
        </View>
      </View>

      <View className="flex-row space-x-2">
        <TouchableOpacity
          className="flex-1 bg-gray-200 rounded-lg py-4 items-center mr-2"
          onPress={() => setStep(1)}
        >
          <Text className="text-gray-900 font-semibold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-blue-600 rounded-lg py-4 items-center"
          onPress={() => setStep(3)}
        >
          <Text className="text-white font-semibold">Next: Bank Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text className="text-2xl font-bold text-gray-900 mb-6">Bank Details</Text>

      <View className="bg-blue-50 rounded-lg p-4 mb-6">
        <Text className="text-blue-900 text-sm">
          💡 Your earnings will be transferred to this bank account
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Account Holder Name *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="As per bank records"
          value={bankAccountHolderName}
          onChangeText={setBankAccountHolderName}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Account Number *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="Enter account number"
          value={bankAccountNumber}
          onChangeText={setBankAccountNumber}
          keyboardType="numeric"
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">IFSC Code *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="e.g., SBIN0001234"
          value={bankIfscCode}
          onChangeText={(text) => setBankIfscCode(text.toUpperCase())}
          autoCapitalize="characters"
        />
      </View>

      <View className="flex-row space-x-2">
        <TouchableOpacity
          className="flex-1 bg-gray-200 rounded-lg py-4 items-center mr-2"
          onPress={() => setStep(2)}
        >
          <Text className="text-gray-900 font-semibold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-green-600 rounded-lg py-4 items-center"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Submit Application</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <View className="mb-6">
          <Text className="text-sm text-gray-600 mb-2">Step {step} of 3</Text>
          <View className="flex-row">
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </View>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
    </ScrollView>
  );
};

export default RiderApplicationScreen;
