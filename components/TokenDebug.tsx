import { testTokenGeneration } from '@/utils/testTokens';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Temporary Debug Component for Token Testing
 * 
 * Add to any screen temporarily to test token generation:
 * 
 * import TokenDebug from '@/components/TokenDebug';
 * 
 * In your component:
 * <TokenDebug />
 */

export default function TokenDebug() {
  const handleTest = async () => {
    Alert.alert('Running Test', 'Check console logs for results...');
    testTokenGeneration();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🔧 Token Debug Panel</Text>

        <Text style={styles.subtitle}>
          This panel helps diagnose token generation issues.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration Check</Text>

          <View style={styles.checkItem}>
            <Text style={styles.checkText}>✓ Check if JWT_SECRET is set</Text>
            <Text style={styles.hint}>server/.env should have: JWT_SECRET=...</Text>
          </View>

          <View style={styles.checkItem}>
            <Text style={styles.checkText}>✓ Check if jsonwebtoken is installed</Text>
            <Text style={styles.hint}>Run: cd server && npm ls jsonwebtoken</Text>
          </View>

          <View style={styles.checkItem}>
            <Text style={styles.checkText}>✓ Verify user exists in database</Text>
            <Text style={styles.hint}>User "bhanu" must exist with passwordHash</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>

          <TouchableOpacity style={styles.button} onPress={handleTest}>
            <Text style={styles.buttonText}>🧪 Run Token Generation Test</Text>
          </TouchableOpacity>

          <Text style={styles.info}>
            Tap the button above and check the console logs (Expo logs) for detailed output.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Logs Check</Text>

          <Text style={styles.hint}>
            Look for these logs when you tap the test button:
          </Text>

          <View style={styles.log}>
            <Text style={styles.logText}>🔍 Login attempt for userId: bhanu</Text>
          </View>

          <View style={styles.log}>
            <Text style={styles.logText}>✓ User found: {'{...}'}</Text>
          </View>

          <View style={styles.log}>
            <Text style={styles.logText}>✓ Access token generated successfully</Text>
          </View>

          <View style={styles.log}>
            <Text style={styles.logText}>✓ Refresh token generated successfully</Text>
          </View>

          <Text style={styles.hint}>
            If you don't see these logs, check server terminal output.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Issues</Text>

          <View style={styles.issue}>
            <Text style={styles.issueTopic}>Error: "User not found"</Text>
            <Text style={styles.issueFix}>
              The user "bhanu" doesn't exist in the database. Check your database or
              create this user first.
            </Text>
          </View>

          <View style={styles.issue}>
            <Text style={styles.issueTopic}>Error: "Cannot reach server"</Text>
            <Text style={styles.issueFix}>
              Server is not running. Run: cd server && npm run dev
            </Text>
          </View>

          <View style={styles.issue}>
            <Text style={styles.issueTopic}>Tokens are undefined</Text>
            <Text style={styles.issueFix}>
              JWT_SECRET is not set. Create server/.env with: JWT_SECRET=your-key
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2B5D45',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2B5D45',
  },
  checkItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#2B5D45',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  info: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 6,
  },
  log: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD93D',
  },
  logText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#333',
  },
  issue: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  issueTopic: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  issueFix: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
