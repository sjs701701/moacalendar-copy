import { useState } from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radius, spacing } from "../theme";

type AuthInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  helper?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          focused && styles.inputShellFocused,
          error && styles.inputShellError,
        ]}
      >
        <TextInput
          autoCapitalize={autoCapitalize}
          caretHidden
          keyboardType={keyboardType}
          selectTextOnFocus
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={focused ? "transparent" : colors.inkSoft}
          secureTextEntry={secureTextEntry}
          style={styles.input}
          value={value}
        />
        {secureTextEntry ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>보안</Text>
          </View>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  inputShellFocused: {
    borderColor: "#7550F5",
    borderWidth: 2,
  },
  inputShellError: {
    borderColor: colors.danger,
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  badge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.accentDeep,
    fontSize: 12,
    fontWeight: "700",
  },
  helper: {
    color: colors.inkSoft,
    fontSize: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
});
