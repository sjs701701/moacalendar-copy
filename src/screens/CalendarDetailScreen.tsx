import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { calendarCardIconAssets, CalendarIconType } from "./MainHomeScreen";

type CalendarDetailProps = {
  title: string;
  subtitle: string;
  color: string;
  icon: CalendarIconType;
  onClose: () => void;
};

/* ── helpers ── */

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── icons ── */

function EditIcon() {
  return (
    <Svg height={20} viewBox="0 0 20 20" width={20}>
      <Path d="M12.5 4.5l3 3M4 16l1.2-4.5L14.5 2.2a1.2 1.2 0 011.7 0l.6.6a1.2 1.2 0 010 1.7L7.5 13.8 4 16z" fill="none" stroke="#A6ABB8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} />
    </Svg>
  );
}

function PlusIcon({ color = "#A6ABB8" }: { color?: string }) {
  return (
    <Svg height={20} viewBox="0 0 20 20" width={20}>
      <Line stroke={color} strokeLinecap="round" strokeWidth={1.8} x1={10} x2={10} y1={4} y2={16} />
      <Line stroke={color} strokeLinecap="round" strokeWidth={1.8} x1={4} x2={16} y1={10} y2={10} />
    </Svg>
  );
}

function CheckCircle({ checked, color }: { checked: boolean; color: string }) {
  return (
    <View style={[ds.checkCircle, checked ? { backgroundColor: color, borderColor: color } : {}]}>
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

/* ── data ── */

type UpcomingDay = { day: string; date: number; label: string; dateColor: string };

const UPCOMING: UpcomingDay[] = [
  { day: "MON", date: 16, label: "내용노출", dateColor: "#222" },
  { day: "SAT", date: 21, label: "내용노출", dateColor: "#50A5F5" },
  { day: "THU", date: 26, label: "내용노출", dateColor: "#222" },
  { day: "SUN", date: 5, label: "내용노출", dateColor: "#FE655D" },
  { day: "WED", date: 9, label: "내용노출", dateColor: "#222" },
  { day: "FRI", date: 18, label: "내용노출", dateColor: "#222" },
  { day: "SAT", date: 19, label: "내용노출", dateColor: "#50A5F5" },
];

const WEIGHT_DATA = [
  { value: 5.1, date: "1/2" },
  { value: 4.9, date: "2/7" },
  { value: 5.2, date: "3/5" },
  { value: 5.0, date: "4/7" },
  { value: 5.0, date: "5/1" },
  { value: 5.0, date: "6/2" },
];

const VOLUME_DATA = [
  { value: 82.5, date: "12/1" },
  { value: 90.5, date: "12/2" },
  { value: 95.2, date: "12/3" },
  { value: 90.5, date: "12/4" },
  { value: 94.0, date: "12/5" },
  { value: 84.5, date: "12/6" },
  { value: 88.0, date: "12/7" },
];

type DDay = { label: string; dday: string; big?: boolean };
const DDAY_LIST: DDay[] = [
  { label: "마라톤", dday: "D-37", big: true },
  { label: "바디프로필", dday: "D-62" },
  { label: "러닝모임", dday: "D-487" },
];

type CheckItem = { id: string; text: string; checked: boolean };

/* ── component ── */

export function CalendarDetailScreen({ title, subtitle, color, icon, onClose }: CalendarDetailProps) {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 70; // contentInner(25*2) + graphCard padding(10*2)
  const lightColor = hexToRgba(color, 0.15);
  const [innerTab, setInnerTab] = useState<"home" | "calendar" | "memo">("home");
  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    { id: "1", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true },
    { id: "2", text: "체크리스트 내용이 노출됩니다.", checked: false },
  ]);

  const toggleCheck = (id: string) => {
    setCheckItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const weightBarData = WEIGHT_DATA.map((w) => ({
    value: w.value,
    label: w.date,
    topLabelComponent: () => (
      <Text style={{ color: "#222", fontSize: 12, fontWeight: "600" as const, marginBottom: 2 }}>
        {w.value} kg
      </Text>
    ),
  }));

  const volumeLineData = VOLUME_DATA.map((v) => ({
    value: v.value,
    label: v.date,
    dataPointLabelComponent: () => (
      <Text style={{ color: "#222", fontSize: 12, fontWeight: "600" as const }}>
        {v.value}T
      </Text>
    ),
    dataPointLabelShiftY: -20,
  }));


  return (
    <View style={ds.root}>
      <ScrollView bounces={false} contentContainerStyle={ds.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[ds.hero, { backgroundColor: color }]}>
          <View style={ds.heroBody}>
            <Pressable onPress={onClose} style={ds.heroIconWrap}>
              <Image resizeMode="contain" source={calendarCardIconAssets[icon]} style={ds.heroIcon} />
            </Pressable>
            <View style={ds.heroBottom}>
              <View style={ds.heroCopy}>
                <Text numberOfLines={1} style={ds.heroTitle}>{title}</Text>
                <Text numberOfLines={1} style={ds.heroSubtitle}>{subtitle}</Text>
              </View>
              <View style={ds.avatarRow}>
                <View style={[ds.avatar, { backgroundColor: "rgba(255,255,255,0.4)" }]}>
                  <Svg height={16} viewBox="0 0 20 20" width={16}>
                    <Circle cx={10} cy={8} fill="#FFF" r={3.5} />
                    <Path d="M3.5 18c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" fill="#FFF" />
                  </Svg>
                </View>
                <View style={[ds.avatar, ds.avatarOverlap, { backgroundColor: "rgba(255,255,255,0.4)" }]}>
                  <Svg height={16} viewBox="0 0 20 20" width={16}>
                    <Circle cx={10} cy={8} fill="#FFF" r={3.5} />
                    <Path d="M3.5 18c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" fill="#FFF" />
                  </Svg>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={ds.contentInner}>
        {/* Project summary card */}
        <View style={ds.summaryCard}>
          <View style={ds.summaryHeader}>
            <Text style={ds.summaryName}>프로젝트명</Text>
            <EditIcon />
          </View>
          <View style={ds.summaryStats}>
            <View style={ds.statCol}>
              <Text style={ds.statLabel}>총 볼륨수</Text>
              <Text style={ds.statValue}>90.5T</Text>
            </View>
            <View style={ds.statCol}>
              <Text style={ds.statLabel}>총 운동 간 날</Text>
              <Text style={ds.statValue}>10일</Text>
            </View>
          </View>
        </View>

        {/* Inner tabs */}
        <View style={ds.tabRow}>
          {(["home", "calendar", "memo"] as const).map((tab) => {
            const label = tab === "home" ? "홈" : tab === "calendar" ? "캘린더" : "메모";
            const active = innerTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setInnerTab(tab)}
                style={[ds.tabItem, active && { borderBottomColor: color }]}
              >
                <Text style={[ds.tabText, active ? { color, fontWeight: "700" } : {}]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Home tab content */}
        {innerTab === "home" && (
          <View style={ds.homeContent}>
            {/* Question card */}
            <View style={ds.questionCard}>
              <Text style={ds.questionText}>오늘 운동 가시나요?</Text>
              <View style={ds.questionBtns}>
                <View style={[ds.questionBtn, { backgroundColor: lightColor }]}>
                  <Text style={ds.questionBtnText}>쉴래요</Text>
                  <Text style={ds.questionEmoji}>🥱</Text>
                </View>
                <View style={[ds.questionBtn, { backgroundColor: "#F6F7FB" }]}>
                  <Text style={ds.questionBtnText}>갈래요</Text>
                  <Text style={ds.questionEmoji}>😀</Text>
                </View>
              </View>
            </View>

            {/* Record button */}
            <Pressable style={[ds.recordBtn, { borderColor: color }]}>
              <Text style={ds.recordBtnText}>오늘 운동 기록하기</Text>
            </Pressable>

            {/* Upcoming schedule */}
            <View style={ds.section}>
              <Text style={ds.sectionTitle}>다가오는 일정</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ds.upcomingScroll} contentContainerStyle={ds.upcomingRow}>
                {UPCOMING.map((d, i) => (
                  <View key={i} style={ds.upcomingCard}>
                    <View style={ds.upcomingDate}>
                      <Text style={ds.upcomingDay}>{d.day}</Text>
                      <Text style={[ds.upcomingNum, { color: d.dateColor }]}>{d.date}</Text>
                    </View>
                    <View style={ds.upcomingDivider} />
                    <Text numberOfLines={1} style={ds.upcomingLabel}>{d.label}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Photo + D-Day */}
            <View style={ds.photoDdayRow}>
              {/* Photo placeholder */}
              <View style={ds.photoPlaceholder}>
                <Svg height={40} viewBox="0 0 40 40" width={40}>
                  <Path d="M6 8a2 2 0 012-2h24a2 2 0 012 2v24a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" fill="none" stroke="#D0D3DA" strokeWidth={1.5} />
                  <Circle cx={15} cy={15} fill="#D0D3DA" r={2.5} />
                  <Path d="M6 28l7-7 5 5 3-3 13 13" fill="none" stroke="#D0D3DA" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                </Svg>
              </View>

              {/* D-Day cards */}
              <View style={ds.ddayCol}>
                {/* Big D-Day */}
                <View style={[ds.ddayBig, { backgroundColor: color }]}>
                  <Text style={ds.ddayBigValue}>{DDAY_LIST[0].dday}</Text>
                  <Text style={ds.ddayBigLabel}>{DDAY_LIST[0].label}</Text>
                </View>
                {/* Small D-Days */}
                <View style={ds.ddaySmallRow}>
                  {DDAY_LIST.slice(1).map((d, i) => (
                    <View key={i} style={ds.ddaySmall}>
                      <Text style={[ds.ddaySmallValue, { color }]}>{d.dday}</Text>
                      <Text numberOfLines={1} style={ds.ddaySmallLabel}>{d.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Weight graph */}
            <View style={ds.section}>
              <View style={ds.sectionHeader}>
                <Text style={ds.sectionTitle}>체중 그래프</Text>
                <PlusIcon />
              </View>
              <View style={ds.graphCard}>
                <BarChart
                  data={weightBarData}
                  barWidth={10}
                  barBorderRadius={1000}
                  frontColor={lightColor}
                  height={58}
                  spacing={38}
                  initialSpacing={10}
                  endSpacing={10}
                  maxValue={6}
                  noOfSections={4}
                  hideRules
                  hideYAxisText
                  yAxisThickness={0}
                  yAxisLabelWidth={0}
                  xAxisThickness={1}
                  xAxisColor="rgba(0,0,0,0.08)"
                  xAxisLabelTextStyle={{ color: "#222", fontSize: 12 }}
                  width={chartWidth}
                  disableScroll
                />
              </View>
            </View>

            {/* Volume chart */}
            <View style={ds.section}>
              <View style={ds.sectionHeader}>
                <Text style={ds.sectionTitle}>운동볼륨</Text>
                <PlusIcon />
              </View>
              <View style={ds.graphCard}>
                <LineChart
                  data={volumeLineData}
                  color={color}
                  dataPointsColor={color}
                  dataPointsRadius={2.5}
                  height={94}
                  spacing={34}
                  initialSpacing={10}
                  endSpacing={10}
                  maxValue={100}
                  noOfSections={4}
                  hideRules
                  hideYAxisText
                  yAxisThickness={0}
                  yAxisLabelWidth={0}
                  xAxisThickness={1}
                  xAxisColor="rgba(0,0,0,0.08)"
                  xAxisLabelTextStyle={{ color: "#222", fontSize: 12 }}
                  dataPointsHeight={5}
                  dataPointsWidth={5}
                  textColor1="#222"
                  textFontSize1={12}
                  textShiftY={-8}
                  textShiftX={0}
                  curved
                  thickness={2}
                  width={chartWidth}
                  disableScroll
                />
              </View>
            </View>

            {/* Photo D-Day banner */}
            <View style={ds.ddayBanner}>
              <View style={[ds.ddayBannerBg, { backgroundColor: "#333" }]} />
              <Text style={ds.ddayBannerLabel}>메인 디데이 일정</Text>
              <Text style={ds.ddayBannerValue}>D-125</Text>
            </View>

            {/* Checklist */}
            <View style={ds.section}>
              <Text style={ds.sectionTitle}>Check List</Text>
              <View style={ds.checkList}>
                {checkItems.map((item) => (
                  <Pressable key={item.id} onPress={() => toggleCheck(item.id)} style={ds.checkRow}>
                    <CheckCircle checked={item.checked} color={color} />
                    <Text numberOfLines={1} style={ds.checkText}>{item.text}</Text>
                  </Pressable>
                ))}
                <Pressable style={ds.checkAddBtn}>
                  <PlusIcon color="#A6ABB8" />
                </Pressable>
              </View>
            </View>
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const ds = StyleSheet.create({
  root: {
    backgroundColor: "#F6F7FB",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  contentInner: {
    paddingHorizontal: 25,
  },

  /* Hero */
  hero: {
    height: 300,
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  heroBody: {
    gap: 25,
  },
  heroIconWrap: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  heroIcon: {
    height: 28,
    tintColor: "#FFF",
    width: 28,
  },
  heroBottom: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroCopy: {
    gap: 8,
    width: 140,
  },
  heroTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.48,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },
  avatarRow: {
    flexDirection: "row",
    paddingRight: 5,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  avatarOverlap: {
    marginLeft: -5,
  },

  /* Summary card */
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    elevation: 6,
    gap: 10,
    marginTop: -110,
    paddingHorizontal: 20,
    paddingVertical: 30,
    shadowColor: "#5E616C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryName: {
    color: "#000",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.36,
  },
  summaryStats: {
    flexDirection: "row",
  },
  statCol: {
    flex: 1,
    gap: 5,
  },
  statLabel: {
    color: "rgba(0,0,0,0.7)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },
  statValue: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.28,
  },

  /* Inner tabs */
  tabRow: {
    borderBottomColor: "#E8EBF5",
    borderBottomWidth: 1,
    flexDirection: "row",
    marginTop: 30,
  },
  tabItem: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: 2,
    flex: 1,
    height: 40,
    justifyContent: "center",
  },
  tabText: {
    color: "#A6ABB8",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },

  /* Home content */
  homeContent: {
    gap: 30,
    paddingTop: 30,
  },

  /* Question card */
  questionCard: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    flexDirection: "row",
    height: 60,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  questionText: {
    color: "#222",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },
  questionBtns: {
    flexDirection: "row",
    gap: 10,
  },
  questionBtn: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    height: 30,
    paddingHorizontal: 10,
  },
  questionBtnText: {
    color: "#222",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },
  questionEmoji: {
    fontSize: 14,
  },

  /* Record button */
  recordBtn: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1.5,
    height: 50,
    justifyContent: "center",
  },
  recordBtnText: {
    color: "#222",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },

  /* Section */
  section: {
    gap: 15,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#222",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.36,
  },

  /* Upcoming */
  upcomingScroll: {
    overflow: "visible",
  },
  upcomingRow: {
    flexDirection: "row",
    gap: 10,
  },
  upcomingCard: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 5,
    elevation: 3,
    gap: 8,
    height: 90,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#5E616C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    width: 100,
  },
  upcomingDate: {
    alignItems: "center",
    gap: 4,
  },
  upcomingDay: {
    color: "#A6ABB8",
    fontSize: 10,
    fontWeight: "500",
  },
  upcomingNum: {
    fontSize: 15,
    fontWeight: "800",
  },
  upcomingDivider: {
    backgroundColor: "rgba(0,0,0,0.06)",
    height: 1,
    width: "100%",
  },
  upcomingLabel: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },

  /* Photo + D-Day */
  photoDdayRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  photoPlaceholder: {
    alignItems: "center",
    backgroundColor: "#E8E9ED",
    borderRadius: 10,
    flex: 1,
    height: 170,
    justifyContent: "center",
  },
  ddayCol: {
    flex: 1,
    gap: 10,
  },
  ddayBig: {
    borderRadius: 10,
    gap: 6,
    height: 80,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  ddayBigValue: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.36,
  },
  ddayBigLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },
  ddaySmallRow: {
    flexDirection: "row",
    gap: 10,
  },
  ddaySmall: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    flex: 1,
    gap: 6,
    height: 80,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  ddaySmallValue: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.36,
  },
  ddaySmallLabel: {
    color: "#A6ABB8",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: -0.24,
  },

  /* Graph */
  graphCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    height: 120,
    justifyContent: "flex-end",
    overflow: "hidden",
    padding: 10,
  },

  /* D-Day banner */
  ddayBanner: {
    borderRadius: 10,
    height: 150,
    justifyContent: "flex-end",
    overflow: "hidden",
    padding: 20,
  },
  ddayBannerBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  ddayBannerLabel: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },
  ddayBannerValue: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  /* Checklist */
  checkList: {
    gap: 10,
  },
  checkRow: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    height: 60,
    paddingHorizontal: 14,
  },
  checkText: {
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
  checkAddBtn: {
    alignItems: "center",
    borderColor: "rgba(166,171,184,0.3)",
    borderRadius: 10,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
  },
});
