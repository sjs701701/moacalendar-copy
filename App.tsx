import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthScreen } from "./src/screens/AuthScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthScreen />
    </SafeAreaProvider>
  );
}
