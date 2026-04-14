import { useRef, useState } from "react";
import { Animated, Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { calendarCardIconAssets, CalendarIconType } from "./MainHomeScreen";

const DELETE_BTN_WIDTH = 60;
const DELETE_GAP = 10;
const REVEAL_WIDTH = DELETE_BTN_WIDTH + DELETE_GAP;
const SWIPE_THRESHOLD = -40;

type CheckItem = {
  id: string;
  text: string;
  checked: boolean;
  color: string;
};

type CheckSection = {
  id: string;
  title: string;
  icon: CalendarIconType;
  iconColor: string;
  items: CheckItem[];
};

const INITIAL_SECTIONS: CheckSection[] = [
  {
    id: "pet",
    title: "제피 캘린더",
    icon: "pet",
    iconColor: "#7550F5",
    items: [],
  },
  {
    id: "workout",
    title: "운동 캘린더",
    icon: "health",
    iconColor: "#FE655D",
    items: [],
  },
  {
    id: "money",
    title: "소비 캘린더",
    icon: "wallet",
    iconColor: "#50A5F5",
    items: [
      { id: "m1", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#50A5F5" },
      { id: "m2", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#50A5F5" },
    ],
  },
  {
    id: "wedding",
    title: "결혼 캘린더",
    icon: "wedding",
    iconColor: "#F059A7",
    items: [
      { id: "wd1", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#F059A7" },
      { id: "wd2", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#F059A7" },
    ],
  },
  {
    id: "health",
    title: "건강 캘린더",
    icon: "medical",
    iconColor: "#1FD2C3",
    items: [
      { id: "h1", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#1FD2C3" },
      { id: "h2", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#1FD2C3" },
    ],
  },
  {
    id: "study",
    title: "스터디 플래너",
    icon: "study",
    iconColor: "#88C255",
    items: [],
  },
  {
    id: "baby",
    title: "육아일기",
    icon: "baby",
    iconColor: "#FF9030",
    items: [],
  },
];

const INITIAL_DONE: CheckItem[] = [
  { id: "d1", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#7550F5" },
  { id: "d2", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#FE655D" },
  { id: "d3", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#FE655D" },
  { id: "d4", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#88C255" },
  { id: "d5", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#88C255" },
];

function CheckIcon({ checked, color }: { checked: boolean; color: string }) {
  return (
    <View style={[s.checkCircle, checked ? { backgroundColor: color, borderColor: color } : {}]}>
      <Svg height={14} viewBox="0 0 14 14" width={14}>
        <Path
          d="M3.5 7l2.5 2.5 4.5-5"
          fill="none"
          stroke={checked ? "#FFF" : "#D0D3DA"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
        />
      </Svg>
    </View>
  );
}

function DoneIcon() {
  return (
    <Svg height={20} viewBox="0 0 20 20" width={20}>
      <Path
        d="M4 10.5l4 4 8-9"
        fill="none"
        stroke="#222"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg height={20} viewBox="0 0 20 20" width={20}>
      <Path d="M5 6h10M8 6V4.5a1 1 0 011-1h2a1 1 0 011 1V6" fill="none" stroke="#FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} />
      <Path d="M6 6v9.5a1 1 0 001 1h6a1 1 0 001-1V6" fill="none" stroke="#FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} />
      <Line stroke="#FFF" strokeLinecap="round" strokeWidth={1.4} x1={8.5} x2={8.5} y1={9} y2={14} />
      <Line stroke="#FFF" strokeLinecap="round" strokeWidth={1.4} x1={11.5} x2={11.5} y1={9} y2={14} />
    </Svg>
  );
}

function SwipeableItem({
  onPress,
  onDelete,
  children,
}: {
  onPress?: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const revealAnim = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  const didSwipe = useRef(false);
  const currentVal = useRef(0);
  const listenerIdRef = useRef<string | null>(null);

  if (!listenerIdRef.current) {
    listenerIdRef.current = revealAnim.addListener(({ value }) => {
      currentVal.current = value;
    });
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        didSwipe.current = false;
      },
      onPanResponderMove: (_, g) => {
        didSwipe.current = true;
        const base = isOpen.current ? REVEAL_WIDTH : 0;
        const raw = base - g.dx;
        const clamped = Math.min(REVEAL_WIDTH, Math.max(0, raw));
        revealAnim.setValue(clamped);
      },
      onPanResponderRelease: () => {
        if (currentVal.current > -SWIPE_THRESHOLD) {
          Animated.spring(revealAnim, { toValue: REVEAL_WIDTH, useNativeDriver: false }).start();
          isOpen.current = true;
        } else {
          Animated.spring(revealAnim, { toValue: 0, useNativeDriver: false }).start();
          isOpen.current = false;
        }
      },
    }),
  ).current;

  const handlePress = () => {
    if (didSwipe.current) return;
    if (isOpen.current) {
      Animated.spring(revealAnim, { toValue: 0, useNativeDriver: false }).start();
      isOpen.current = false;
      return;
    }
    onPress?.();
  };

  const deleteBtnOpacity = revealAnim.interpolate({
    inputRange: [0, REVEAL_WIDTH],
    outputRange: [0, 1],
  });

  return (
    <View style={s.swipeRow}>
      <Animated.View style={[s.actionLayer, { opacity: deleteBtnOpacity }]}>
        <View style={s.deleteBtnWrap}>
          <Pressable onPress={onDelete} style={s.deleteBtn}>
            <TrashIcon />
          </Pressable>
        </View>
      </Animated.View>
      <Animated.View
        style={{
          flex: 1,
          marginRight: revealAnim,
        }}
        {...panResponder.panHandlers}
      >
        <Pressable onPress={handlePress} style={s.itemCard}>
          {children}
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function ListScreen() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [doneItems, setDoneItems] = useState(INITIAL_DONE);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    INITIAL_SECTIONS.forEach((sec) => {
      if (sec.items.length === 0) {
        initial[sec.id] = true;
      }
    });
    return initial;
  });
  const toggleCollapse = (sectionId: string) => {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleCheck = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const item = sec.items.find((i) => i.id === itemId);
        if (!item) return sec;
        setDoneItems((d) => [{ ...item, checked: true }, ...d]);
        return { ...sec, items: sec.items.filter((i) => i.id !== itemId) };
      }),
    );
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId ? { ...sec, items: sec.items.filter((i) => i.id !== itemId) } : sec,
      ),
    );
  };

  const deleteDoneItem = (itemId: string) => {
    setDoneItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  return (
    <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      {sections.map((sec, si) => (
        <View key={sec.id}>
          {/* Section header */}
          <Pressable onPress={() => toggleCollapse(sec.id)} style={s.sectionHeader}>
            <View style={s.sectionTitleRow}>
              <View style={s.sectionIconWrap}>
                <Image
                  resizeMode="contain"
                  source={calendarCardIconAssets[sec.icon]}
                  style={[s.sectionIcon, { tintColor: sec.iconColor }]}
                />
              </View>
              <Text style={s.sectionTitle}>{sec.title}</Text>
            </View>
            <Svg
              height={20}
              style={{ transform: [{ rotate: collapsed[sec.id] ? "180deg" : "0deg" }] }}
              viewBox="0 0 20 20"
              width={20}
            >
              <Path d="M6 12.5l4-5 4 5" fill="none" stroke="#A6ABB8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
            </Svg>
          </Pressable>

          {/* Items */}
          {!collapsed[sec.id] && sec.items.length > 0 && (
            <View style={s.itemList}>
              {sec.items.map((item) => (
                <SwipeableItem
                  key={item.id}
                  onDelete={() => deleteItem(sec.id, item.id)}
                  onPress={() => toggleCheck(sec.id, item.id)}
                >
                  <CheckIcon checked={item.checked} color={item.color} />
                  <Text numberOfLines={1} style={s.itemText}>{item.text}</Text>
                </SwipeableItem>
              ))}
            </View>
          )}

          {/* Divider */}
          {si < sections.length - 1 && <View style={s.divider} />}
        </View>
      ))}

      {/* Divider before done section */}
      <View style={s.divider} />

      {/* Done section */}
      <View>
        <Pressable onPress={() => toggleCollapse("done")} style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <DoneIcon />
            <Text style={s.sectionTitle}>완료된 체크리스트</Text>
          </View>
          <Svg
            height={20}
            style={{ transform: [{ rotate: collapsed["done"] ? "180deg" : "0deg" }] }}
            viewBox="0 0 20 20"
            width={20}
          >
            <Path d="M6 12.5l4-5 4 5" fill="none" stroke="#A6ABB8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          </Svg>
        </Pressable>

        {!collapsed["done"] && (
          <View style={s.itemList}>
            {doneItems.map((item) => (
              <SwipeableItem key={item.id} onDelete={() => deleteDoneItem(item.id)}>
                <CheckIcon checked color={item.color} />
                <Text numberOfLines={1} style={s.itemText}>{item.text}</Text>
              </SwipeableItem>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 30,
    paddingBottom: 100,
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 4,
    paddingVertical: 10,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  sectionIconWrap: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  sectionIcon: {
    height: 20,
    width: 20,
  },
  sectionTitle: {
    color: "#222",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.36,
  },
  itemList: {
    gap: 10,
    marginTop: 20,
  },
  swipeRow: {
    height: 60,
    position: "relative",
  },
  actionLayer: {
    alignItems: "flex-end",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    width: REVEAL_WIDTH,
  },
  itemCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    height: 60,
    overflow: "hidden",
    paddingHorizontal: 14,
  },
  itemText: {
    color: "#222",
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.32,
  },
  checkCircle: {
    alignItems: "center",
    borderColor: "#D0D3DA",
    borderRadius: 12,
    borderWidth: 1.5,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  deleteBtnWrap: {
    justifyContent: "center",
    width: REVEAL_WIDTH,
  },
  deleteBtn: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.10)",
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
    marginLeft: DELETE_GAP,
    width: DELETE_BTN_WIDTH,
  },
  divider: {
    backgroundColor: "rgba(0,0,0,0.06)",
    height: 1,
    width: "100%",
  },
});
