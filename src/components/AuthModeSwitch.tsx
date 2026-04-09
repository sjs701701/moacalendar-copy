import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme";

export type AuthMode = "login" | "signup";

type AuthModeSwitchProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

const tabs: Array<{ key: AuthMode; label: string }> = [
  { key: "login", label: "로그인" },
  { key: "signup", label: "회원가입" },
];

export function AuthModeSwitch({ mode, onChange }: AuthModeSwitchProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = tab.key === mode;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.pill,
    flexDirection: "row",
    padding: 4,
  },
  tab: {
    alignItems: "center",
    borderRadius: radius.pill,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.white,
  },
  label: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 15,
    fontWeight: "700",
  },
  labelActive: {
    color: colors.ink,
  },
});
