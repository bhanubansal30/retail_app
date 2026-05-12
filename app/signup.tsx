import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Replace with your actual local IP address for physical device testing
// const API_URL = 'http://192.168.3.19:3000';
const API_URL = "https://retail-app-siqh.onrender.com";
export default function SignupScreen() {
  const router = useRouter();
  const [firmName, setFirmName] = useState('');
  const [shopType, setShopType] = useState('');
  const [proprietorName, setProprietorName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firmName || !shopType || !proprietorName || !mobile || !address || !businessType) {
      Alert.alert('Missing Fields', 'Please fill in all the details to continue.');
      return;
    }

    if (mobile.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const formData = {
      firmName,
      shopType,
      proprietorName,
      mobile: '+91' + mobile,
      address,
      businessType,
    };

    try {
      console.log('Signup request payload:', formData);
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('Signup response:', { status: res.status, ok: res.ok, data });
      if (data.success) {
        Alert.alert('Success', 'Your retail shop has been registered successfully.');
        setFirmName('');
        setShopType('');
        setProprietorName('');
        setMobile('');
        setAddress('');
        setBusinessType('');
      } else {
        Alert.alert('Signup Failed', data.message || 'Something went wrong.');
      }
    } catch (error: any) {
      console.error('Signup request failed:', error?.message || error);
      Alert.alert('Connection Error', 'Could not connect to the server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.brandContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/606/606544.png' }}
            style={styles.logo}
          />
          <Text style={styles.heading}>Retail Hub</Text>
          <Text style={styles.subHeading}>Grow your business with us</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Firm Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Sharma Kirana Store"
              value={firmName}
              onChangeText={setFirmName}
            />
          </View>

          <Text style={styles.label}>Retail Category</Text>
          <View style={styles.optionContainer}>
            {['Kirana', 'Confectionery'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.optionButton, shopType === item && styles.selectedButton]}
                onPress={() => setShopType(item)}
              >
                <Text style={[styles.optionText, shopType === item && styles.selectedText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Proprietor Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name of owner"
              value={proprietorName}
              onChangeText={setProprietorName}
            />
          </View>

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>🇮🇳 +91</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit number"
              keyboardType="number-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
            />
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Full Address</Text>
          </View>
          <View style={[styles.inputContainer, styles.addressContainer]}>
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Shop No, Street, Landmark, City..."
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <Text style={styles.label}>Business Type</Text>
          <View style={styles.typeContainer}>
            {['Wholesaler', 'Retailer'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.typeButton, businessType === item && styles.selectedType]}
                onPress={() => setBusinessType(item)}
              >
                <Ionicons
                  name={item === 'Wholesaler' ? 'cube-outline' : 'cart-outline'}
                  size={20}
                  color={businessType === item ? '#fff' : '#666'}
                />
                <Text style={[styles.typeText, businessType === item && styles.selectedTypeText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.signupButton, loading && styles.disabledButton]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>Register Shop</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 24,
    paddingTop: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  subHeading: {
    fontSize: 15,
    color: '#777',
    marginTop: 4,
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    gap: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#EEE',
  },
  addressContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  addressInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  selectedButton: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  optionText: {
    color: '#666',
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFF',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  selectedType: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  typeText: {
    fontWeight: '700',
    color: '#666',
  },
  selectedTypeText: {
    color: '#FFF',
  },
  signupButton: {
    backgroundColor: '#007bff',
    height: 60,
    borderRadius: 16,
    marginTop: 40,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#A0CCFF',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  footerLink: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '800',
  },
});
