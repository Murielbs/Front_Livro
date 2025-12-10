import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LivrariaBRScreen from './screens/LivrariaBRScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LivrariaBRScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f9',
  },
});
