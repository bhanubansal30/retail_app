import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Coupon codes
const COUPONS: { [key: string]: number } = {
  SAVE10: 10,
  SAVE20: 20,
  BULK50: 50,
  NEWYEAR: 15,
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartData, totalPrice, totalMRP } = useLocalSearchParams();

  const cart = JSON.parse(cartData as string) || [];
  const total = parseFloat(totalPrice as string) || 0;
  const mrp = parseFloat(totalMRP as string) || 0;
  const baseSavings = mrp - total;

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cash'>('upi');
  const [loading, setLoading] = useState(false);

  const applyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (!code) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    if (COUPONS[code]) {
      const discount = COUPONS[code];
      setAppliedCoupon({ code, discount });
      Alert.alert('Success', `Coupon applied! ₹${discount} discount`);
      setCouponCode('');
    } else {
      Alert.alert('Invalid', 'Coupon code not found');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = total - couponDiscount;

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert('Success', 'Payment completed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/dashboard');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemTotal}>
        ₹{(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#2B5D45" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderCard}>
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal:</Text>
              <Text style={styles.priceValue}>₹{total.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>MRP:</Text>
              <Text style={styles.priceValue}>₹{mrp.toFixed(2)}</Text>
            </View>
            {baseSavings > 0 && (
              <View style={[styles.priceRow, styles.savingsRow]}>
                <Text style={styles.savingsLabel}>Item Savings:</Text>
                <Text style={styles.savingsValue}>-₹{baseSavings.toFixed(2)}</Text>
              </View>
            )}

            {/* Coupon Section */}
            <View style={styles.couponSection}>
              {!appliedCoupon ? (
                <>
                  <View style={styles.couponInputContainer}>
                    <TextInput
                      style={styles.couponInput}
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChangeText={setCouponCode}
                      autoCapitalize="characters"
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={applyCoupon}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.couponHint}>
                    Try: SAVE10, SAVE20, BULK50, NEWYEAR
                  </Text>
                </>
              ) : (
                <View style={styles.appliedCouponBox}>
                  <View>
                    <Text style={styles.appliedCouponCode}>
                      {appliedCoupon.code}
                    </Text>
                    <Text style={styles.appliedCouponDiscount}>
                      -₹{appliedCoupon.discount} discount
                    </Text>
                  </View>
                  <TouchableOpacity onPress={removeCoupon}>
                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {couponDiscount > 0 && (
              <View style={[styles.priceRow, styles.couponSavingsRow]}>
                <Text style={styles.couponLabel}>Coupon Discount:</Text>
                <Text style={styles.couponValue}>-₹{couponDiscount.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.priceDivider} />

            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons name="location" size={20} color="#2B5D45" />
            </View>
            <View>
              <Text style={styles.addressTitle}>Home</Text>
              <Text style={styles.addressText}>
                123 Market Street, Delhi 110001
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            {[
              { id: 'upi', name: 'UPI', icon: 'phone-portrait' },
              { id: 'card', name: 'Card', icon: 'card' },
              { id: 'cash', name: 'Cash on Delivery', icon: 'wallet' },
            ].map((method: any) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  paymentMethod === method.id && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={paymentMethod === method.id ? '#2B5D45' : '#999'}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    paymentMethod === method.id && styles.paymentOptionTextActive,
                  ]}
                >
                  {method.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By placing this order, you agree to our Terms & Conditions
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.paymentButton, loading && styles.paymentButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          <Text style={styles.paymentButtonText}>
            {loading ? 'Processing...' : `Pay ₹${finalTotal.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F2ED',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DEC8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2F2A1E',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2F2A1E',
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F2ED',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F2A1E',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6D6353',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B5D45',
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D6353',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F2A1E',
  },
  savingsRow: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  savingsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  savingsValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B6B',
  },
  couponSection: {
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#E8DEC8',
    borderBottomColor: '#E8DEC8',
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E8DEC8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#2F2A1E',
  },
  applyButton: {
    backgroundColor: '#2B5D45',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  couponHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    fontWeight: '500',
  },
  appliedCouponBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4F2ED',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2B5D45',
  },
  appliedCouponCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2B5D45',
  },
  appliedCouponDiscount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D6353',
    marginTop: 2,
  },
  couponSavingsRow: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  couponLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  couponValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B6B',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E8DEC8',
    marginVertical: 12,
  },
  totalRow: {
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2F2A1E',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2B5D45',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F4F2ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F2A1E',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6D6353',
    width: 200,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: '#131313',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8DEC8',
    gap: 12,
  },
  paymentOptionSelected: {
    borderColor: '#2B5D45',
    backgroundColor: '#F4F2ED',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D6353',
  },
  paymentOptionTextActive: {
    color: '#2B5D45',
    fontWeight: '700',
  },
  termsContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8DEC8',
  },
  paymentButton: {
    backgroundColor: '#2B5D45',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B5D45',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  paymentButtonDisabled: {
    backgroundColor: '#9EC1A7',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
