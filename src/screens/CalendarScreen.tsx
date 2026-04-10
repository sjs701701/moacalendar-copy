import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import Svg, { Line, Path } from "react-native-svg";

const DAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const DAY_NAMES_SHORT = ["일", "월", "화", "수", "목", "금", "토"];

const CALENDAR_OPTIONS = [
  { id: "basic", label: "기본", color: "#FFC54A" },
  { id: "money", label: "소비", color: "#50A5F5" },
  { id: "pet", label: "반려동물", color: "#7550F5" },
  { id: "wedding", label: "결혼", color: "#F059A7" },
  { id: "workout", label: "운동", color: "#FE655D" },
  { id: "health", label: "건강", color: "#1FD2C3" },
  { id: "study", label: "스터디", color: "#88C255" },
  { id: "baby", label: "육아", color: "#FF9030" },
];

const SCHEDULE_MAX_LENGTH = 20;

type WeekDayItem = {
  day: number;
  month: number;
  year: number;
  dayOfWeek: number;
  key: string;
};

function generateDays(baseDate: Date, offset: number, count: number): WeekDayItem[] {
  const items: WeekDayItem[] = [];
  for (let i = offset; i < offset + count; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    items.push({
      day: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      dayOfWeek: d.getDay(),
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
    });
  }
  return items;
}

type EventTag = {
  label: string;
  bgColor: string;
  memo?: string;
  isDDay?: boolean;
  dDayNumber?: number;
};

// Sample events for demonstration (keyed by day number)
const sampleEvents: Record<number, EventTag[]> = {
  5: [{ label: "병원 예약", bgColor: "#E6F6E8", memo: "오후 2시 내과 검진" }],
  14: [
    { label: "결혼기념일", bgColor: "#FFFFFF", isDDay: true, dDayNumber: 248, memo: "선물 준비하기" },
    { label: "저녁 약속", bgColor: "#FFF6E4", memo: "강남역 7시" },
  ],
  16: [{ label: "스터디 모임", bgColor: "#E6F6E8" }],
  18: [{ label: "운동", bgColor: "#FFE8E7", memo: "헬스장 PT 3회차" }],
  26: [{ label: "프로젝트 마감", bgColor: "#EAE5FE", memo: "최종 보고서 제출" }],
  27: [{ label: "출장", bgColor: "#E5F2FE", memo: "부산 오전 KTX" }],
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function CalendarScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [scheduleText, setScheduleText] = useState("");
  const [memoText, setMemoText] = useState("");
  const [isDDay, setIsDDay] = useState(false);
  const [scheduleFocused, setScheduleFocused] = useState(false);
  const [memoFocused, setMemoFocused] = useState(false);
  const [calendarDropdownOpen, setCalendarDropdownOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);
  const [validationError, setValidationError] = useState("");
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const horizontalPadding = 10;
  const gridGap = 4;
  const cellWidth = Math.floor((screenWidth - horizontalPadding * 2 - gridGap * 6) / 7);
  const cellHeight = 120;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const prevMonthDays = getDaysInMonth(
    month === 0 ? year - 1 : year,
    month === 0 ? 11 : month - 1,
  );
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const getDayColor = (dayOfWeek: number) => {
    if (dayOfWeek === 0) return "#FE655D";
    if (dayOfWeek === 6) return "#50A5F5";
    return "#000000";
  };

  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

  const goToPrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(-1);
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(-1);
  };

  const monthLabel = `${year}.${String(month + 1).padStart(2, "0")}`;

  // Week view infinite scroll
  const [weekItems, setWeekItems] = useState<WeekDayItem[]>([]);
  const isLoadingRef = useRef(false);
  const weekListRef = useRef<FlatList<WeekDayItem>>(null);

  const weekInitialIndex = useRef<number | null>(null);

  useEffect(() => {
    if (viewMode === "week") {
      // Generate 5 weeks centered around today
      const todayDate = new Date();
      const dow = todayDate.getDay();
      const sunday = new Date(todayDate);
      sunday.setDate(todayDate.getDate() - dow);
      const items = generateDays(sunday, -14, 35);
      const todayKey = `${todayDate.getFullYear()}-${todayDate.getMonth()}-${todayDate.getDate()}`;
      weekInitialIndex.current = items.findIndex(item => item.key === todayKey);
      setWeekItems(items);
    } else {
      weekInitialIndex.current = null;
    }
  }, [viewMode]);

  const loadNextWeek = useCallback(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setWeekItems(prev => {
      const last = prev[prev.length - 1];
      const nextDate = new Date(last.year, last.month, last.day + 1);
      return [...prev, ...generateDays(nextDate, 0, 7)];
    });
    isLoadingRef.current = false;
  }, []);

  const loadPrevWeek = useCallback(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setWeekItems(prev => {
      const first = prev[0];
      const prevDate = new Date(first.year, first.month, first.day);
      return [...generateDays(prevDate, -7, 7), ...prev];
    });
    isLoadingRef.current = false;
  }, []);

  const handleWeekScroll = useCallback((e: any) => {
    const { contentOffset } = e.nativeEvent;
    if (contentOffset.y < 100) {
      loadPrevWeek();
    }
  }, [loadPrevWeek]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const first = viewableItems[0]?.item as WeekDayItem | undefined;
    if (first) {
      setYear(first.year);
      setMonth(first.month);
    }
  }).current;

  // Build calendar cells
  const cells: Array<{ day: number; isCurrentMonth: boolean; dayOfWeek: number }> = [];
  for (let i = 0; i < totalCells; i++) {
    const dow = i % 7;
    if (i < firstDayOfWeek) {
      cells.push({ day: prevMonthDays - firstDayOfWeek + i + 1, isCurrentMonth: false, dayOfWeek: dow });
    } else if (i < firstDayOfWeek + daysInMonth) {
      cells.push({ day: i - firstDayOfWeek + 1, isCurrentMonth: true, dayOfWeek: dow });
    } else {
      cells.push({ day: i - firstDayOfWeek - daysInMonth + 1, isCurrentMonth: false, dayOfWeek: dow });
    }
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable hitSlop={12} onPress={goToPrevMonth}>
          <Svg height={24} viewBox="0 0 24 24" width={24}>
            <Path
              d="M14.5 5.5L7.5 12l7 6.5"
              fill="none"
              stroke="#222"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </Svg>
        </Pressable>
        <Text style={s.headerTitle}>{monthLabel}</Text>
        <Pressable hitSlop={12} onPress={goToNextMonth}>
          <Svg height={24} viewBox="0 0 24 24" width={24}>
            <Path
              d="M9.5 5.5L16.5 12l-7 6.5"
              fill="none"
              stroke="#222"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </Svg>
        </Pressable>
      </View>

      <View style={s.viewToggleRow}>
        <Pressable onPress={() => setViewMode("month")} style={[s.viewToggleTab, viewMode === "month" && s.viewToggleTabActive]}>
          <Text style={[s.viewToggleText, viewMode === "month" && s.viewToggleTextActive]}>Month</Text>
        </Pressable>
        <Pressable onPress={() => setViewMode("week")} style={[s.viewToggleTab, viewMode === "week" && s.viewToggleTabActive]}>
          <Text style={[s.viewToggleText, viewMode === "week" && s.viewToggleTextActive]}>Week</Text>
        </Pressable>
      </View>

      {viewMode === "month" ? (
        <ScrollView
          bounces={false}
          contentContainerStyle={[
            s.scrollContent,
            selectedDay > 0 && s.scrollContentWithBottomBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.grid}>
            {cells.map((cell, idx) => {
              const isSelected = cell.isCurrentMonth && cell.day === selectedDay;
              const dayColor = getDayColor(cell.dayOfWeek);
              const events = cell.isCurrentMonth ? sampleEvents[cell.day] || [] : [];

              return (
                <Pressable
                  key={idx}
                  onPress={cell.isCurrentMonth ? () => setSelectedDay(cell.day) : undefined}
                  style={[
                    s.dayCell,
                    { height: cellHeight, width: cellWidth },
                    !cell.isCurrentMonth && s.dayCellOther,
                    isSelected && { ...s.dayCellSelected, borderColor: dayColor },
                  ]}
                >
                  <View style={s.dateArea}>
                    {isSelected ? (
                      <View style={[s.selectedCircle, { backgroundColor: dayColor }]}>
                        <Text style={s.selectedCircleText}>{cell.day}</Text>
                      </View>
                    ) : (
                      <Text style={[s.dateText, { color: dayColor }]}>{cell.day}</Text>
                    )}
                  </View>

                  {events.map((evt, ei) => (
                    <View key={ei} style={[s.eventTag, { backgroundColor: evt.bgColor }]}>
                      {evt.isDDay ? (
                        <Text style={s.dDayText}>
                          <Text style={s.dDayPrefix}>D-</Text>
                          {evt.dDayNumber}
                        </Text>
                      ) : (
                        <Text numberOfLines={1} style={s.eventTagText}>
                          {evt.label}
                        </Text>
                      )}
                    </View>
                  ))}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          ref={weekListRef}
          contentContainerStyle={[
            s.weekListContent,
            selectedDay > 0 && s.scrollContentWithBottomBar,
          ]}
          data={weekItems}
          getItemLayout={(_, index) => ({ length: 110, offset: 110 * index, index })}
          initialScrollIndex={weekInitialIndex.current ?? undefined}
          keyExtractor={(item) => item.key}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onEndReached={loadNextWeek}
          onEndReachedThreshold={0.5}
          onScroll={handleWeekScroll}
          renderItem={({ item: wd }) => {
            const dayColor = getDayColor(wd.dayOfWeek);
            const events = sampleEvents[wd.day] || [];
            const isSelected = wd.month === month && wd.year === year && wd.day === selectedDay;

            return (
              <Pressable
                onPress={() => {
                  if (wd.month !== month || wd.year !== year) {
                    setYear(wd.year);
                    setMonth(wd.month);
                  }
                  setSelectedDay(wd.day);
                }}
                style={[s.weekDayCard, isSelected && { ...s.dayCellSelected, borderColor: dayColor }]}
              >
                <View style={s.weekDateRow}>
                  <Text style={[s.weekDateNum, { color: dayColor }]}>{wd.day}.</Text>
                  <Text style={s.weekDateDow}>{DAY_NAMES_SHORT[wd.dayOfWeek]}</Text>
                </View>
                {events.map((evt, ei) => (
                  <View key={ei} style={[s.weekEventTag, { backgroundColor: evt.bgColor }]}>
                    <View style={s.weekEventRow}>
                      {evt.isDDay ? (
                        <Text style={s.dDayText}>
                          <Text style={s.dDayPrefix}>D-</Text>
                          {evt.dDayNumber}
                        </Text>
                      ) : (
                        <Text numberOfLines={1} style={s.eventTagText}>
                          {evt.label}
                        </Text>
                      )}
                    </View>
                    {evt.memo ? (
                      <Text numberOfLines={1} style={s.weekEventMemo}>{evt.memo}</Text>
                    ) : null}
                  </View>
                ))}
              </Pressable>
            );
          }}
          scrollEventThrottle={200}
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      )}

      {selectedDay > 0 && (
        <View style={s.bottomBar}>
          <Pressable onPress={() => setViewModalOpen(true)} style={s.bottomBtnOutline}>
            <Text style={s.bottomBtnOutlineText}>일정 확인</Text>
          </Pressable>
          <Pressable onPress={() => setAddModalOpen(true)} style={s.bottomBtnFill}>
            <Text style={s.bottomBtnFillText}>일정 추가</Text>
          </Pressable>
        </View>
      )}

      <Modal animationType="fade" onRequestClose={() => { setAddModalOpen(false); setValidationError(""); }} transparent visible={addModalOpen}>
        <Pressable onPress={() => { setAddModalOpen(false); setValidationError(""); }} style={s.modalOverlay}>
          <Pressable onPress={(e) => e.stopPropagation()} style={s.modalCard}>
            {/* Close button */}
            <Pressable onPress={() => { setAddModalOpen(false); setValidationError(""); }} style={s.modalClose}>
              <Svg height={20} viewBox="0 0 20 20" width={20}>
                <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.6} x1={5} x2={15} y1={5} y2={15} />
                <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.6} x1={15} x2={5} y1={5} y2={15} />
              </Svg>
            </Pressable>

            {/* Date header */}
            <View style={s.modalDateHeader}>
              <Text style={s.modalDateText}>
                {String(month + 1).padStart(2, "0")}월 {String(selectedDay).padStart(2, "0")}일
              </Text>
              <Text style={s.modalDayOfWeek}>
                {DAY_NAMES[new Date(year, month, selectedDay).getDay()]}
              </Text>
            </View>

            {/* Divider */}
            <View style={s.modalDivider} />

            {/* Form */}
            <View style={s.modalForm}>
              {/* Calendar selector */}
              <View style={{ zIndex: 10 }}>
                <Pressable
                  onPress={() => setCalendarDropdownOpen(!calendarDropdownOpen)}
                  style={s.modalCalendarSelector}
                >
                  <Text style={[s.modalCalendarSelectorText, !selectedCalendar && { color: "#A6ABB8" }]}>
                    {selectedCalendar
                      ? CALENDAR_OPTIONS.find((c) => c.id === selectedCalendar)?.label
                      : "캘린더 선택"}
                  </Text>
                  {selectedCalendar && (
                    <View
                      style={[
                        s.calendarDot,
                        { backgroundColor: CALENDAR_OPTIONS.find((c) => c.id === selectedCalendar)?.color },
                      ]}
                    />
                  )}
                  <Svg
                    height={15}
                    style={{ transform: [{ rotate: calendarDropdownOpen ? "180deg" : "0deg" }] }}
                    viewBox="0 0 15 15"
                    width={15}
                  >
                    <Path d="M4 6l3.5 3.5L11 6" fill="none" stroke="#222" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                  </Svg>
                </Pressable>
                {calendarDropdownOpen && (
                  <ScrollView nestedScrollEnabled style={s.dropdownList}>
                    {CALENDAR_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.id}
                        onPress={() => {
                          setSelectedCalendar(opt.id);
                          setCalendarDropdownOpen(false);
                          if (validationError) setValidationError("");
                        }}
                        style={[
                          s.dropdownItem,
                          selectedCalendar === opt.id && s.dropdownItemSelected,
                        ]}
                      >
                        <View style={[s.calendarDot, { backgroundColor: opt.color }]} />
                        <Text style={[s.dropdownItemText, selectedCalendar === opt.id && s.dropdownItemTextSelected]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Schedule input */}
              <View style={[s.modalInputBox, scheduleFocused ? s.modalInputFocused : (validationError && s.validationErrorInputBorder)]}>
                <TextInput
                  onBlur={() => setScheduleFocused(false)}
                  onChangeText={(text) => { setScheduleText(text); if (validationError) setValidationError(""); }}
                  onFocus={() => setScheduleFocused(true)}
                  placeholder="일정을 입력하세요."
                  placeholderTextColor={scheduleFocused ? "transparent" : "#A6ABB8"}
                  style={s.modalInput}
                  value={scheduleText}
                />
              </View>

              {/* Memo */}
              <View style={[s.modalMemoBox, memoFocused && s.modalInputFocused]}>
                <Text style={s.modalMemoLabel}>Memo</Text>
                <TextInput
                  multiline
                  onBlur={() => setMemoFocused(false)}
                  onChangeText={setMemoText}
                  onFocus={() => setMemoFocused(true)}
                  placeholder="메모를 입력해주세요."
                  placeholderTextColor={memoFocused ? "transparent" : "#A6ABB8"}
                  style={s.modalMemoInput}
                  textAlignVertical="top"
                  value={memoText}
                />
              </View>

              {/* D-day checkbox */}
              <Pressable onPress={() => setIsDDay(!isDDay)} style={s.modalCheckRow}>
                <View style={[s.modalCheckbox, isDDay && s.modalCheckboxChecked]}>
                  {isDDay && (
                    <Svg height={10} viewBox="0 0 10 10" width={10}>
                      <Path d="M2 5.5l2 2 4-4.5" fill="none" stroke="#FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                    </Svg>
                  )}
                </View>
                <Text style={s.modalCheckLabel}>D-day</Text>
              </Pressable>
            </View>

            {validationError ? (
              <Text style={s.validationErrorText}>{validationError}</Text>
            ) : null}

            {/* Submit button */}
            {(() => {
              const isDisabled = !selectedCalendar || !scheduleText.trim();
              return (
                <Pressable
                  disabled={isDisabled}
                  onPress={() => {
                    if (scheduleText.trim().length > SCHEDULE_MAX_LENGTH) {
                      setValidationError(`일정은 ${SCHEDULE_MAX_LENGTH}자 이내로 입력해주세요.`);
                      return;
                    }
                    setAddModalOpen(false);
                    setScheduleText("");
                    setMemoText("");
                    setIsDDay(false);
                    setSelectedCalendar(null);
                    setCalendarDropdownOpen(false);
                    setValidationError("");
                  }}
                  style={[s.modalSubmitBtn, isDisabled && s.modalSubmitBtnDisabled]}
                >
                  <Text style={[s.modalSubmitText, isDisabled && s.modalSubmitTextDisabled]}>일정등록</Text>
                </Pressable>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => setViewModalOpen(false)} transparent visible={viewModalOpen}>
        <Pressable onPress={() => setViewModalOpen(false)} style={s.modalOverlay}>
          <Pressable onPress={(e) => e.stopPropagation()} style={s.viewModalCard}>
            {/* Close button */}
            <Pressable onPress={() => setViewModalOpen(false)} style={s.modalClose}>
              <Svg height={20} viewBox="0 0 20 20" width={20}>
                <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.6} x1={5} x2={15} y1={5} y2={15} />
                <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.6} x1={15} x2={5} y1={5} y2={15} />
              </Svg>
            </Pressable>

            {/* Date header */}
            <View style={s.modalDateHeader}>
              <Text style={s.modalDateText}>
                {String(month + 1).padStart(2, "0")}월 {String(selectedDay).padStart(2, "0")}일
              </Text>
              <Text style={s.modalDayOfWeek}>
                {DAY_NAMES[new Date(year, month, selectedDay).getDay()]}
              </Text>
            </View>

            <View style={s.modalDivider} />

            {/* Event list */}
            {(sampleEvents[selectedDay] || []).length > 0 ? (
              <View style={s.viewEventList}>
                {(sampleEvents[selectedDay] || []).map((evt, i) => (
                  <View key={i} style={s.viewEventRow}>
                    <View style={[s.viewEventDot, { backgroundColor: evt.bgColor === "#FFFFFF" ? "#222" : evt.bgColor }]} />
                    <View style={s.viewEventContent}>
                      <Text style={s.viewEventLabel}>
                        {evt.isDDay ? `D-${evt.dDayNumber} ${evt.label}` : evt.label}
                      </Text>
                      {evt.memo ? (
                        <Text style={s.viewEventMemo}>{evt.memo}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={s.viewEmptyWrap}>
                <Text style={s.viewEmptyText}>등록된 일정이 없습니다.</Text>
              </View>
            )}

            {/* Add button */}
            <Pressable
              onPress={() => {
                setViewModalOpen(false);
                setAddModalOpen(true);
              }}
              style={s.viewAddBtn}
            >
              <Text style={s.viewAddBtnText}>일정 추가</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 10,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 60,
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#222",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.44,
  },
  viewToggleRow: {
    borderBottomColor: "#E8EBF5",
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  viewToggleTab: {
    alignItems: "center",
    flex: 1,
    height: 40,
    justifyContent: "center",
  },
  viewToggleTabActive: {
    borderBottomColor: "#7550F5",
    borderBottomWidth: 2,
  },
  viewToggleText: {
    color: "#A6ABB8",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.28,
  },
  viewToggleTextActive: {
    color: "#7550F5",
  },
  weekListContent: {
    gap: 10,
    paddingBottom: 100,
  },
  weekDayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    gap: 6,
    minHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  weekDateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    height: 20,
    paddingHorizontal: 10,
  },
  weekDateNum: {
    fontSize: 12,
    fontWeight: "800",
  },
  weekDateDow: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "400",
  },
  weekEventTag: {
    borderRadius: 4,
    gap: 2,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  weekEventRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  weekEventMemo: {
    color: "#A6ABB8",
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  scrollContentWithBottomBar: {
    paddingBottom: 190,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  dayCell: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    gap: 4,
    padding: 5,
  },
  dayCellOther: {
    backgroundColor: "rgba(255,255,255,0.5)",
    opacity: 0.8,
  },
  dateArea: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "800",
  },
  dayCellSelected: {
    borderWidth: 1.5,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  selectedCircle: {
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 1000,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  selectedCircleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  eventTag: {
    alignItems: "center",
    borderRadius: 4,
    height: 22,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  eventTagText: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 10,
    fontWeight: "500",
  },
  dDayText: {
    color: "#222",
    fontSize: 10,
    fontWeight: "800",
  },
  dDayPrefix: {
    color: "#FE655D",
  },
  bottomBar: {
    backgroundColor: "#F6F7FB",
    borderTopColor: "rgba(0,0,0,0.06)",
    borderTopWidth: 1,
    bottom: 70,
    flexDirection: "row",
    gap: 10,
    left: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "absolute",
    right: 0,
  },
  bottomBtnOutline: {
    alignItems: "center",
    borderColor: "#222",
    borderRadius: 1000,
    borderWidth: 1.2,
    flex: 1,
    height: 44,
    justifyContent: "center",
  },
  bottomBtnOutlineText: {
    color: "#222",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.28,
  },
  bottomBtnFill: {
    alignItems: "center",
    backgroundColor: "#7550F5",
    borderRadius: 1000,
    flex: 1,
    height: 44,
    justifyContent: "center",
  },
  bottomBtnFillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.28,
  },
  viewModalCard: {
    alignItems: "center",
    backgroundColor: "#F6F7FB",
    borderRadius: 14,
    gap: 22,
    padding: 34,
    width: 320,
  },
  viewEventList: {
    gap: 10,
    width: "100%",
  },
  viewEventRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: "100%",
  },
  viewEventDot: {
    borderRadius: 100,
    height: 10,
    width: 10,
  },
  viewEventContent: {
    flex: 1,
  },
  viewEventLabel: {
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.28,
  },
  viewEventMemo: {
    color: "#A6ABB8",
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: -0.24,
    marginTop: 3,
  },
  viewEmptyWrap: {
    alignItems: "center",
    paddingVertical: 20,
    width: "100%",
  },
  viewEmptyText: {
    color: "#A6ABB8",
    fontSize: 14,
    fontWeight: "500",
  },
  viewAddBtn: {
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 1000,
    height: 44,
    justifyContent: "center",
    width: 252,
  },
  viewAddBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.26,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "center",
  },
  modalCard: {
    alignItems: "center",
    backgroundColor: "#F6F7FB",
    borderRadius: 14,
    gap: 22,
    padding: 34,
    width: 320,
  },
  modalClose: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 1,
  },
  modalDateHeader: {
    alignItems: "center",
    gap: 5,
  },
  modalDateText: {
    color: "#222",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.36,
  },
  modalDayOfWeek: {
    color: "#A6ABB8",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: -0.26,
  },
  modalDivider: {
    backgroundColor: "rgba(34,34,34,0.1)",
    height: 1,
    width: 252,
  },
  modalForm: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  modalCalendarSelector: {
    alignItems: "center",
    borderBottomColor: "#222",
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 44,
    justifyContent: "space-between",
    paddingHorizontal: 5,
    width: "100%",
  },
  modalCalendarSelectorText: {
    color: "#222",
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.3,
  },
  calendarDot: {
    borderRadius: 100,
    height: 8,
    marginRight: 6,
    width: 8,
  },
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(34,34,34,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    elevation: 5,
    left: 0,
    marginTop: 4,
    maxHeight: 150,
    position: "absolute",
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    top: 40,
    zIndex: 10,
  },
  dropdownItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemSelected: {
    backgroundColor: "#F6F7FB",
  },
  dropdownItemText: {
    color: "#222",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: -0.26,
  },
  dropdownItemTextSelected: {
    fontWeight: "700",
  },
  modalInputBox: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(34,34,34,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    paddingHorizontal: 12,
    width: "100%",
  },
  modalInputFocused: {
    borderColor: "#7550F5",
    borderWidth: 2,
  },
  modalInput: {
    color: "#222",
    fontSize: 15,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  modalMemoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    gap: 8,
    height: 110,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: "100%",
  },
  modalMemoLabel: {
    color: "#222",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.26,
  },
  modalMemoInput: {
    color: "#222",
    flex: 1,
    fontSize: 13,
    letterSpacing: -0.26,
    padding: 0,
  },
  modalCheckRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  modalCheckbox: {
    alignItems: "center",
    borderColor: "#A6ABB8",
    borderRadius: 3,
    borderWidth: 1.5,
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  modalCheckboxChecked: {
    backgroundColor: "#222",
    borderColor: "#222",
  },
  modalCheckLabel: {
    color: "#222",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.26,
  },
  validationErrorText: {
    color: "#FE655D",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: -0.24,
  },
  validationErrorInputBorder: {
    borderColor: "#FE655D",
    borderWidth: 2,
  },
  modalSubmitBtn: {
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 1000,
    height: 44,
    justifyContent: "center",
    width: 252,
  },
  modalSubmitBtnDisabled: {
    backgroundColor: "#D9DBE1",
  },
  modalSubmitText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.26,
  },
  modalSubmitTextDisabled: {
    color: "#A6ABB8",
  },
});
