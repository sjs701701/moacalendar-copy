import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { BoardScreen } from "./BoardScreen";
import { CalendarDetailScreen } from "./CalendarDetailScreen";
import { CalendarScreen } from "./CalendarScreen";
import { ListScreen } from "./ListScreen";

type CalendarCard = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon: "star" | "wallet" | "pet" | "wedding" | "health" | "medical" | "study" | "baby";
};

const cards: CalendarCard[] = [
  { id: "basic", title: "기본 캘린더", subtitle: "기본 캘린더", color: "#FFC54A", icon: "star" },
  { id: "money", title: "지갑 지키미", subtitle: "소비 캘린더", color: "#50A5F5", icon: "wallet" },
  { id: "pet", title: "제피", subtitle: "반려동물 캘린더", color: "#7550F5", icon: "pet" },
  { id: "wedding", title: "우빈♡민아", subtitle: "결혼 캘린더", color: "#F059A7", icon: "wedding" },
  { id: "workout", title: "헬스", subtitle: "운동 캘린더", color: "#FE655D", icon: "health" },
  { id: "health", title: "건강", subtitle: "건강 캘린더", color: "#1FD2C3", icon: "medical" },
  { id: "study", title: "목표는 서울대!", subtitle: "스터디 캘린더", color: "#88C255", icon: "study" },
  { id: "baby", title: "이로 육아일기", subtitle: "육아 캘린더", color: "#FF9030", icon: "baby" },
];

const calendarCardIconAssetPaths: Record<CalendarCard["icon"], string> = {
  star: "assets/home/calendar-icons/basic-calendar-icon.png",
  wallet: "assets/home/calendar-icons/expense-calendar-icon.png",
  pet: "assets/home/calendar-icons/pet-calendar-icon.png",
  wedding: "assets/home/calendar-icons/wedding-calendar-icon.png",
  health: "assets/home/calendar-icons/workout-calendar-icon.png",
  medical: "assets/home/calendar-icons/health-calendar-icon.png",
  study: "assets/home/calendar-icons/study-calendar-icon.png",
  baby: "assets/home/calendar-icons/baby-calendar-icon.png",
};

export type CalendarIconType = CalendarCard["icon"];

export const calendarCardIconAssets: Record<CalendarCard["icon"], any> = {
  star: require("../../assets/home/calendar-icons/basic-calendar-icon.png"),
  wallet: require("../../assets/home/calendar-icons/expense-calendar-icon.png"),
  pet: require("../../assets/home/calendar-icons/pet-calendar-icon.png"),
  wedding: require("../../assets/home/calendar-icons/wedding-calendar-icon.png"),
  health: require("../../assets/home/calendar-icons/workout-calendar-icon.png"),
  medical: require("../../assets/home/calendar-icons/health-calendar-icon.png"),
  study: require("../../assets/home/calendar-icons/study-calendar-icon.png"),
  baby: require("../../assets/home/calendar-icons/baby-calendar-icon.png"),
};

const tabIconAssetPaths = {
  home: "assets/home/tap-icons/home-tab-icon.png",
  calendar: "assets/home/tap-icons/calendar-tab-icon.png",
  list: "assets/home/tap-icons/list-tab-icon.png",
  share: "assets/home/tap-icons/share-tab-icon.png",
  settings: "assets/home/tap-icons/setting-tab-icon.png",
} as const;

const tabIconAssets: Record<keyof typeof tabIconAssetPaths, any> = {
  home: require("../../assets/home/tap-icons/home-tab-icon.png"),
  calendar: require("../../assets/home/tap-icons/calendar-tab-icon.png"),
  list: require("../../assets/home/tap-icons/list-tab-icon.png"),
  share: require("../../assets/home/tap-icons/share-tab-icon.png"),
  settings: require("../../assets/home/tap-icons/setting-tab-icon.png"),
};

const tabIconVisualSizes: Record<keyof typeof tabIconAssetPaths, { width: number; height: number }> = {
  home: { width: 21, height: 23 },
  calendar: { width: 23, height: 24 },
  list: { width: 19, height: 17 },
  share: { width: 31, height: 23 },
  settings: { width: 25, height: 24 },
};

type AddMenuItem = {
  id: string;
  icon: CalendarCard["icon"];
  label: string;
  color: string;
};

const addMenuItems: AddMenuItem[] = [
  { id: "basic", icon: "star", label: "기본", color: "#FFC54A" },
  { id: "money", icon: "wallet", label: "소비", color: "#50A5F5" },
  { id: "pet", icon: "pet", label: "반려동물", color: "#7550F5" },
  { id: "wedding", icon: "wedding", label: "결혼", color: "#F059A7" },
  { id: "workout", icon: "health", label: "운동", color: "#FE655D" },
  { id: "health", icon: "medical", label: "건강", color: "#1FD2C3" },
  { id: "study", icon: "study", label: "스터디", color: "#88C255" },
  { id: "baby", icon: "baby", label: "육아", color: "#FF9030" },
];

function CalendarIcon({ type }: { type: CalendarCard["icon"] }) {
  const stroke = "#FFFFFF";

  if (type === "star") {
    return (
      <Svg height={30} viewBox="0 0 30 30" width={30}>
        <Path
          d="M15 4.5l3.1 6.29 6.95 1.01-5.02 4.89 1.19 6.91L15 20.34 8.78 23.6l1.19-6.91-5.02-4.89 6.95-1.01L15 4.5Z"
          fill="none"
          stroke={stroke}
          strokeLinejoin="round"
          strokeWidth={2.4}
        />
      </Svg>
    );
  }

  if (type === "wallet") {
    return (
      <Svg height={30} viewBox="0 0 30 30" width={30}>
        <Rect
          fill="none"
          height={14}
          rx={2.5}
          stroke={stroke}
          strokeWidth={2.4}
          width={18}
          x={6}
          y={8}
        />
        <Rect
          fill="none"
          height={8}
          rx={1.8}
          stroke={stroke}
          strokeWidth={2.4}
          width={8}
          x={16}
          y={11}
        />
        <Circle cx={20} cy={15} fill={stroke} r={1.5} />
      </Svg>
    );
  }

  if (type === "pet") {
    return (
      <Svg height={30} viewBox="0 0 30 30" width={30}>
        <Circle cx={15} cy={17} fill="none" r={6.5} stroke={stroke} strokeWidth={2.4} />
        <Circle cx={10} cy={10} fill="none" r={2.3} stroke={stroke} strokeWidth={2.2} />
        <Circle cx={20} cy={10} fill="none" r={2.3} stroke={stroke} strokeWidth={2.2} />
        <Circle cx={7.5} cy={15} fill="none" r={2.3} stroke={stroke} strokeWidth={2.2} />
        <Path
          d="M10.8 19.4c1.1 1.1 2.5 1.7 4.2 1.7 2.3 0 3.8-1 5-2.8"
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeWidth={2.2}
        />
      </Svg>
    );
  }

  if (type === "wedding") {
    return (
      <Svg height={30} viewBox="0 0 30 30" width={30}>
        <Circle cx={11} cy={8.5} fill="none" r={2.5} stroke={stroke} strokeWidth={2.2} />
        <Circle cx={19} cy={8.5} fill="none" r={2.5} stroke={stroke} strokeWidth={2.2} />
        <Rect fill="none" height={11} rx={2} stroke={stroke} strokeWidth={2.2} width={5} x={8.5} y={12} />
        <Rect fill="none" height={11} rx={2} stroke={stroke} strokeWidth={2.2} width={5} x={16.5} y={12} />
      </Svg>
    );
  }

  if (type === "health") {
    return (
      <Svg height={30} viewBox="0 0 30 30" width={30}>
        <Path
          d="M15 23.5s-8-4.52-8-10.44A4.56 4.56 0 0 1 11.56 8.5c1.55 0 2.62.57 3.44 1.69.82-1.12 1.89-1.69 3.44-1.69A4.56 4.56 0 0 1 23 13.06C23 18.98 15 23.5 15 23.5Z"
          fill="none"
          stroke={stroke}
          strokeLinejoin="round"
          strokeWidth={2.2}
        />
        <Path
          d="M10.7 16h2.56l1.42-3.26 1.83 5.22L18 15.4h2.2"
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.1}
        />
      </Svg>
    );
  }

  if (type === "medical") {
    return (
      <Svg height={30} viewBox="0 0 30 30" width={30}>
        <Rect fill="none" height={18} rx={3} stroke={stroke} strokeWidth={2.4} width={8} x={11} y={6} />
        <Rect fill={stroke} height={4} rx={1} width={14} x={8} y={13} />
        <Rect fill={stroke} height={14} rx={1} width={4} x={13} y={8} />
      </Svg>
    );
  }

  if (type === "study") {
    return (
      <Svg height={30} viewBox="0 0 30 30" width={30}>
        <Path
          d="M8 20.5 19.8 8.7a2.1 2.1 0 0 1 2.97 0l.53.53a2.1 2.1 0 0 1 0 2.97L11.5 24H8v-3.5Z"
          fill="none"
          stroke={stroke}
          strokeLinejoin="round"
          strokeWidth={2.3}
        />
        <Line stroke={stroke} strokeLinecap="round" strokeWidth={2.1} x1={16.2} x2={21.2} y1={11.7} y2={16.7} />
      </Svg>
    );
  }

  return (
    <Svg height={30} viewBox="0 0 30 30" width={30}>
      <Circle cx={15} cy={15} fill="none" r={7.5} stroke={stroke} strokeWidth={2.2} />
      <Circle cx={12.2} cy={12.8} fill="none" r={1.8} stroke={stroke} strokeWidth={1.8} />
      <Circle cx={17.8} cy={12.8} fill="none" r={1.8} stroke={stroke} strokeWidth={1.8} />
      <Path d="M15 10V8.2" fill="none" stroke={stroke} strokeLinecap="round" strokeWidth={2.1} />
      <Path d="M11 18.4c1.1 1.3 2.4 1.9 4 1.9 1.6 0 2.9-.6 4-1.9" fill="none" stroke={stroke} strokeLinecap="round" strokeWidth={2.1} />
      <Circle cx={9} cy={10.4} fill="none" r={1.4} stroke={stroke} strokeWidth={1.8} />
      <Circle cx={21} cy={10.4} fill="none" r={1.4} stroke={stroke} strokeWidth={1.8} />
    </Svg>
  );
}

function TabIcon({ type, active = false }: { type: "home" | "calendar" | "list" | "share" | "settings"; active?: boolean }) {
  const iconAsset = tabIconAssets[type];
  const stroke = active ? "#7550F5" : "#A6ABB8";

  if (iconAsset) {
    return (
      <View style={styles.tabIconBox}>
        <Image
          resizeMode="contain"
          source={iconAsset}
          style={[
            styles.tabIconImage,
            {
              height: tabIconVisualSizes[type].height,
              tintColor: stroke,
              width: tabIconVisualSizes[type].width,
            },
          ]}
        />
      </View>
    );
  }

  if (type === "home") {
    return (
      <Svg height={24} viewBox="0 0 24 24" width={24}>
        <Path d="M4.5 10.5 12 4l7.5 6.5v8a1 1 0 0 1-1 1h-4.7v-5h-3.6v5H5.5a1 1 0 0 1-1-1v-8Z" fill="none" stroke={stroke} strokeLinejoin="round" strokeWidth={2.2} />
      </Svg>
    );
  }

  if (type === "calendar") {
    return (
      <Svg height={24} viewBox="0 0 24 24" width={24}>
        <Rect fill="none" height={15} rx={2.6} stroke={stroke} strokeWidth={2.1} width={16} x={4} y={6} />
        <Line stroke={stroke} strokeLinecap="round" strokeWidth={2.1} x1={8} x2={8} y1={3.8} y2={8} />
        <Line stroke={stroke} strokeLinecap="round" strokeWidth={2.1} x1={16} x2={16} y1={3.8} y2={8} />
        <Line stroke={stroke} strokeWidth={2.1} x1={4} x2={20} y1={10} y2={10} />
      </Svg>
    );
  }

  if (type === "list") {
    return (
      <Svg height={24} viewBox="0 0 24 24" width={24}>
        <Line stroke={stroke} strokeLinecap="round" strokeWidth={2.2} x1={6} x2={18} y1={7} y2={7} />
        <Line stroke={stroke} strokeLinecap="round" strokeWidth={2.2} x1={6} x2={18} y1={12} y2={12} />
        <Line stroke={stroke} strokeLinecap="round" strokeWidth={2.2} x1={6} x2={18} y1={17} y2={17} />
      </Svg>
    );
  }

  if (type === "share") {
    return (
      <Svg height={24} viewBox="0 0 24 24" width={24}>
        <Path d="M10 7.3h5.2a3.3 3.3 0 0 1 0 6.6H10" fill="none" stroke={stroke} strokeLinecap="round" strokeWidth={2.1} />
        <Path d="M14 16.7H8.8a3.3 3.3 0 1 1 0-6.6H14" fill="none" stroke={stroke} strokeLinecap="round" strokeWidth={2.1} />
        <Path d="m10.6 12 3-3" fill="none" stroke={stroke} strokeLinecap="round" strokeWidth={2.1} />
        <Path d="m10.6 12 3 3" fill="none" stroke={stroke} strokeLinecap="round" strokeWidth={2.1} />
      </Svg>
    );
  }

  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Circle cx={12} cy={12} fill="none" r={4.2} stroke={stroke} strokeWidth={2.1} />
      <Path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.9 6.1l-1.6 1.6M7.7 16.3l-1.6 1.6M17.9 17.9l-1.6-1.6M7.7 7.7 6.1 6.1" fill="none" stroke={stroke} strokeLinecap="round" strokeWidth={2.1} />
    </Svg>
  );
}

function CalendarCardView({ card, width }: { card: CalendarCard; width: number }) {
  const iconAsset = calendarCardIconAssets[card.icon];

  return (
    <View style={[styles.cardWrap, { width }]}>
      <View style={styles.binderRow}>
        <View style={styles.binderRing} />
        <View style={styles.binderRing} />
      </View>
      <View style={[styles.card, { backgroundColor: card.color }]}>
        <View style={styles.cardIcon}>
          {iconAsset ? (
            <Image resizeMode="contain" source={iconAsset} style={styles.cardIconImage} />
          ) : (
            <CalendarIcon type={card.icon} />
          )}
        </View>
        <View style={styles.cardCopy}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {card.title}
          </Text>
          <Text numberOfLines={1} style={styles.cardSubtitle}>
            {card.subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function MainHomeScreen() {
  const { width } = useWindowDimensions();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isAddMenuMounted, setIsAddMenuMounted] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateInputFocused, setIsCreateInputFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "calendar" | "list" | "share" | "settings">("home");
  const [calendarName, setCalendarName] = useState("");
  const [selectedAddMenuItem, setSelectedAddMenuItem] = useState<AddMenuItem | null>(null);
  const [boardWriteCategory, setBoardWriteCategory] = useState<AddMenuItem | null>(null);
  const [openCalendarCard, setOpenCalendarCard] = useState<CalendarCard | null>(null);
  const addMenuAnimation = useRef(new Animated.Value(0)).current;
  const tabBarAnimation = useRef(new Animated.Value(0)).current;
  const lastScrollOffset = useRef(0);
  const isTabBarHidden = useRef(false);
  const tabBarHiddenBeforeMenuOpen = useRef(false);
  const horizontalPadding = 25;
  const columnGap = 18;
  const cardWidth = Math.floor((width - horizontalPadding * 2 - columnGap) / 2);

  useEffect(() => {
    if (isAddMenuOpen) {
      setIsAddMenuMounted(true);
      Animated.timing(addMenuAnimation, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(addMenuAnimation, {
      duration: 220,
      easing: Easing.in(Easing.cubic),
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsAddMenuMounted(false);
      }
    });
  }, [addMenuAnimation, isAddMenuOpen]);

  useEffect(() => {
    if (isAddMenuOpen) {
      tabBarHiddenBeforeMenuOpen.current = isTabBarHidden.current;
      updateTabBarVisibility(true);
      return;
    }

    updateTabBarVisibility(tabBarHiddenBeforeMenuOpen.current);
  }, [isAddMenuOpen]);

  const closeAddMenu = () => {
    setIsAddMenuOpen(false);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCalendarName("");
    setIsCreateInputFocused(false);
  };

  const toggleAddMenu = () => {
    setIsAddMenuOpen((current) => !current);
  };

  const switchTab = (tab: "home" | "calendar" | "list" | "share" | "settings") => {
    if (isAddMenuOpen) closeAddMenu();
    if (isCreateModalOpen) closeCreateModal();
    setActiveTab(tab);
    if (tab !== "home") {
      updateTabBarVisibility(false);
    }
  };

  const handleSelectAddMenuItem = (item: AddMenuItem) => {
    if (activeTab === "share") {
      setBoardWriteCategory(item);
      closeAddMenu();
      return;
    }
    setSelectedAddMenuItem(item);
    setCalendarName("");
    setIsCreateModalOpen(true);
    closeAddMenu();
  };

  const addMenuTranslateX = addMenuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const addMenuOpacity = addMenuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const tabBarTranslateY = tabBarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 96],
  });

  const updateTabBarVisibility = (shouldHide: boolean) => {
    if (isTabBarHidden.current === shouldHide) {
      return;
    }

    isTabBarHidden.current = shouldHide;
    Animated.timing(tabBarAnimation, {
      duration: 220,
      easing: shouldHide ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic),
      toValue: shouldHide ? 1 : 0,
      useNativeDriver: true,
    }).start();
  };

  const handleScroll = (offsetY: number) => {
    if (isAddMenuOpen) {
      lastScrollOffset.current = offsetY;
      return;
    }

    const delta = offsetY - lastScrollOffset.current;
    const isNearTop = offsetY <= 12;

    if (isNearTop) {
      updateTabBarVisibility(false);
    } else if (delta > 8) {
      updateTabBarVisibility(true);
    } else if (delta < -8) {
      updateTabBarVisibility(false);
    }

    lastScrollOffset.current = offsetY;
  };

  return (
    <View style={styles.screenRoot}>
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.container}>
        {activeTab === "home" ? (
          <>
        <Animated.ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {cards.map((card) => (
              <Pressable key={card.id} onPress={() => setOpenCalendarCard(card)}>
                <CalendarCardView card={card} width={cardWidth} />
              </Pressable>
            ))}
          </View>
        </Animated.ScrollView>

          </>
        ) : activeTab === "calendar" ? (
          <View style={{ flex: 1, marginHorizontal: -25 }}>
            <CalendarScreen />
          </View>
        ) : activeTab === "list" ? (
          <View style={{ flex: 1, marginHorizontal: -25 }}>
            <ListScreen />
          </View>
        ) : activeTab === "share" ? (
          <View style={{ flex: 1, marginHorizontal: -25 }}>
            <BoardScreen
              writeCategory={boardWriteCategory}
              onWriteCategoryClose={() => setBoardWriteCategory(null)}
            />
          </View>
        ) : null}

        {(activeTab === "home" || activeTab === "share") && isAddMenuMounted ? (
          <>
            <Pressable onPress={closeAddMenu} style={styles.addMenuOverlay} />
            <Animated.View
              style={[
                styles.addMenuSheet,
                {
                  opacity: addMenuOpacity,
                  transform: [{ translateX: addMenuTranslateX }],
                },
              ]}
            >
              {addMenuItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectAddMenuItem(item)}
                  style={styles.addMenuItem}
                >
                  <View style={styles.addMenuIconWrap}>
                    <Image
                      resizeMode="contain"
                      source={calendarCardIconAssets[item.icon]}
                      style={[
                        styles.addMenuIcon,
                        {
                          tintColor: item.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.addMenuLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </Animated.View>
          </>
        ) : null}

        {(activeTab === "home" || activeTab === "share") && !isAddMenuMounted ? (
          <Pressable
            onPress={toggleAddMenu}
            style={styles.fab}
          >
            {activeTab === "share" ? (
              <Svg height={24} viewBox="0 0 24 24" width={24}>
                <Path d="M15.5 5.5l3 3M5 19l1.5-5.5L17 3a1.41 1.41 0 012 0l1 1a1.41 1.41 0 010 2L9.5 16.5 5 19z" fill="none" stroke="#7550F5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
              </Svg>
            ) : (
              <Svg height={24} viewBox="0 0 24 24" width={24}>
                <Line stroke="#7550F5" strokeLinecap="round" strokeWidth={2.3} x1={12} x2={12} y1={4} y2={20} />
                <Line stroke="#7550F5" strokeLinecap="round" strokeWidth={2.3} x1={4} x2={20} y1={12} y2={12} />
              </Svg>
            )}
          </Pressable>
        ) : null}

        <Modal animationType="fade" onRequestClose={closeCreateModal} transparent visible={isCreateModalOpen && !!selectedAddMenuItem}>
          <Pressable onPress={closeCreateModal} style={styles.createModalOverlay}>
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.createModal}>
              <Pressable onPress={closeCreateModal} style={styles.createModalCloseButton}>
                <Svg height={20} viewBox="0 0 20 20" width={20}>
                  <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.6} x1={5} x2={15} y1={5} y2={15} />
                  <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.6} x1={15} x2={5} y1={5} y2={15} />
                </Svg>
              </Pressable>

              {selectedAddMenuItem && (
                <>
                  <View style={styles.createModalHeader}>
                    <Image
                      resizeMode="contain"
                      source={calendarCardIconAssets[selectedAddMenuItem.icon]}
                      style={[
                        styles.createModalIcon,
                        { tintColor: selectedAddMenuItem.color },
                      ]}
                    />
                    <Text style={styles.createModalTitle}>{selectedAddMenuItem.label} 캘린더</Text>
                  </View>

                  <View
                    style={[
                      styles.createModalInputShell,
                      isCreateInputFocused && styles.createModalInputShellFocused,
                    ]}
                  >
                    <TextInput
                      onBlur={() => setIsCreateInputFocused(false)}
                      onChangeText={setCalendarName}
                      onFocus={() => setIsCreateInputFocused(true)}
                      placeholder="캘린더 이름을 입력해주세요."
                      placeholderTextColor={isCreateInputFocused ? "transparent" : "#A6ABB8"}
                      style={styles.createModalInput}
                      textAlign="center"
                      value={calendarName}
                    />
                  </View>

                  <Pressable
                    onPress={() => {
                      if (!selectedAddMenuItem) return;
                      const newCard: CalendarCard = {
                        id: selectedAddMenuItem.id + "_" + Date.now(),
                        title: calendarName || selectedAddMenuItem.label,
                        subtitle: selectedAddMenuItem.label + " 캘린더",
                        color: selectedAddMenuItem.color,
                        icon: selectedAddMenuItem.icon,
                      };
                      closeCreateModal();
                      setOpenCalendarCard(newCard);
                    }}
                    style={styles.createModalButton}
                  >
                    <Text style={styles.createModalButtonText}>캘린더 생성</Text>
                  </Pressable>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        <Animated.View style={[styles.tabBar, { width, transform: [{ translateY: tabBarTranslateY }] }]}>
          <Pressable onPress={() => switchTab("home")} style={styles.tabItem}>
            <TabIcon active={activeTab === "home"} type="home" />
          </Pressable>
          <Pressable onPress={() => switchTab("calendar")} style={styles.tabItem}>
            <TabIcon active={activeTab === "calendar"} type="calendar" />
          </Pressable>
          <Pressable onPress={() => switchTab("list")} style={styles.tabItem}>
            <TabIcon active={activeTab === "list"} type="list" />
          </Pressable>
          <Pressable onPress={() => switchTab("share")} style={styles.tabItem}>
            <TabIcon active={activeTab === "share"} type="share" />
          </Pressable>
          <Pressable onPress={() => switchTab("settings")} style={styles.tabItem}>
            <TabIcon active={activeTab === "settings"} type="settings" />
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
    {openCalendarCard && (
      <View style={styles.calendarDetailOverlay}>
        <CalendarDetailScreen
          color={openCalendarCard.color}
          icon={openCalendarCard.icon}
          onClose={() => setOpenCalendarCard(null)}
          subtitle={openCalendarCard.subtitle}
          title={openCalendarCard.title}
        />
      </View>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: "#F6F7FB",
    flex: 1,
  },
  container: {
    backgroundColor: "#F6F7FB",
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 18,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  grid: {
    columnGap: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 24,
  },
  cardWrap: {
    alignItems: "center",
    paddingBottom: 10,
  },
  binderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: -10,
    width: 120,
    zIndex: 2,
  },
  binderRing: {
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    height: 20,
    width: 10,
  },
  card: {
    borderRadius: 20,
    elevation: 7,
    height: 180,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 30,
    shadowColor: "#5E616C",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    width: "100%",
  },
  cardIcon: {
    height: 30,
    width: 30,
  },
  cardIconImage: {
    height: "100%",
    width: "100%",
  },
  cardCopy: {
    gap: 8,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },
  addMenuOverlay: {
    backgroundColor: "rgba(0,0,0,0.18)",
    bottom: 0,
    left: -25,
    position: "absolute",
    right: -25,
    top: 0,
    zIndex: 2,
  },
  addMenuSheet: {
    bottom: 30,
    gap: 6,
    position: "absolute",
    right: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 3,
  },
  addMenuItem: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    flexDirection: "row",
    gap: 5,
    height: 40,
    paddingHorizontal: 15,
    width: 110,
  },
  addMenuIconWrap: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  addMenuIcon: {
    height: 16,
    width: 16,
  },
  addMenuLabel: {
    color: "#222222",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.28,
  },
  createModalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "center",
  },
  createModal: {
    alignItems: "center",
    backgroundColor: "#F6F7FB",
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 30,
    width: 280,
  },
  createModalCloseButton: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  createModalHeader: {
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  createModalIcon: {
    height: 26,
    width: 26,
  },
  createModalTitle: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.32,
  },
  createModalInputShell: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(34,34,34,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    height: 50,
    marginBottom: 15,
    justifyContent: "center",
    paddingHorizontal: 16,
    width: "100%",
  },
  createModalInputShellFocused: {
    borderColor: "#7550F5",
    borderWidth: 2,
  },
  createModalInput: {
    color: "#222222",
    fontSize: 14,
    paddingVertical: 0,
    width: "100%",
  },
  createModalButton: {
    alignItems: "center",
    backgroundColor: "#7550F5",
    borderRadius: 1000,
    height: 40,
    justifyContent: "center",
    width: 120,
  },
  createModalButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: -0.24,
  },
  fab: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    bottom: 88,
    elevation: 6,
    height: 50,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    shadowColor: "#3A415E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    width: 50,
    zIndex: 4,
  },
  tabBar: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    bottom: 0,
    elevation: 8,
    flexDirection: "row",
    height: 70,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    position: "absolute",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  tabIconBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconImage: {},
  calendarDetailOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
