import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebViewScreen({ route }) {
  const { url } = route.params;

  if (!url) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#dc2626', fontSize: 18 }}>URL no válida</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: url }}
      startInLoadingState
      renderLoading={() => (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
