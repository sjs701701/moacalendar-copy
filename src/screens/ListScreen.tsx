import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

type CheckItem = {
  id: string;
  text: string;
  checked: boolean;
  color: string;
};

type CheckSection = {
  id: string;
  title: string;
  icon: "calendar" | "workout" | "done";
  iconColor: string;
  items: CheckItem[];
};

const INITIAL_SECTIONS: CheckSection[] = [
  {
    id: "zephy",
    title: "제피 캘린더",
    icon: "calendar",
    iconColor: "#7550F5",
    items: [
      { id: "z1", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#7550F5" },
      { id: "z2", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#7550F5" },
    ],
  },
  {
    id: "workout",
    title: "운동 캘린더",
    icon: "workout",
    iconColor: "#FE655D",
    items: [
      { id: "w1", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#FE655D" },
      { id: "w2", text: "체크리스트 내용이 노출됩니다.", checked: false, color: "#FE655D" },
    ],
  },
];

const INITIAL_DONE: CheckItem[] = [
  { id: "d1", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#7550F5" },
  { id: "d2", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#FE655D" },
  { id: "d3", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#FE655D" },
  { id: "d4", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#88C255" },
  { id: "d5", text: "체크리스트 체크 시 색상이 표시됩니다.", checked: true, color: "#88C255" },
];

function SectionIcon({ type, color }: { type: "calendar" | "workout" | "done"; color: string }) {
  if (type === "calendar") {
    return (
      <Svg height={20} viewBox="0 0 20 20" width={20}>
        <Circle cx={10} cy={10} fill="none" r={8} stroke={color} strokeWidth={1.5} />
        <Path d="M10 6v4l2.5 2.5" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      </Svg>
    );
  }
  if (type === "workout") {
    return (
      <Svg height={20} viewBox="0 0 20 20" width={20}>
        <Path
          d="M6.5 4.5v11M13.5 4.5v11M6.5 10h7M4 7v6M16 7v6"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
      </Svg>
    );
  }
  // done
  return (
    <Svg height={20} viewBox="0 0 20 20" width={20}>
      <Path
        d="M4 10.5l4 4 8-9"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

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

export function ListScreen() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [doneItems, setDoneItems] = useState(INITIAL_DONE);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const toggleCollapse = (sectionId: string) => {
    setCollapsed(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleCheck = (sectionId: string, itemId: string) => {
    setSections(prev =>
      prev.map(sec => {
        if (sec.id !== sectionId) return sec;
        const item = sec.items.find(i => i.id === itemId);
        if (!item) return sec;
        // Move to done
        setDoneItems(d => [{ ...item, checked: true }, ...d]);
        return { ...sec, items: sec.items.filter(i => i.id !== itemId) };
      }),
    );
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    setSections(prev =>
      prev.map(sec =>
        sec.id === sectionId ? { ...sec, items: sec.items.filter(i => i.id !== itemId) } : sec,
      ),
    );
    setSwipedId(null);
  };

  const deleteDoneItem = (itemId: string) => {
    setDoneItems(prev => prev.filter(i => i.id !== itemId));
    setSwipedId(null);
  };

  return (
    <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      {sections.map((sec, si) => (
        <View key={sec.id}>
          {/* Section header */}
          <Pressable onPress={() => toggleCollapse(sec.id)} style={s.sectionHeader}>
            <View style={s.sectionTitleRow}>
              <SectionIcon color={sec.iconColor} type={sec.icon} />
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
          {!collapsed[sec.id] && (
            <View style={s.itemList}>
              {sec.items.map(item => (
                <View key={item.id} style={s.itemRow}>
                  <Pressable
                    onLongPress={() => setSwipedId(swipedId === item.id ? null : item.id)}
                    onPress={() => toggleCheck(sec.id, item.id)}
                    style={[s.itemCard, swipedId === item.id && s.itemCardSwiped]}
                  >
                    <CheckIcon checked={item.checked} color={item.color} />
                    <Text numberOfLines={1} style={s.itemText}>{item.text}</Text>
                  </Pressable>
                  {swipedId === item.id && (
                    <Pressable onPress={() => deleteItem(sec.id, item.id)} style={s.deleteBtn}>
                      <TrashIcon />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Divider (except last before done) */}
          {si < sections.length - 1 && <View style={s.divider} />}
        </View>
      ))}

      {/* Divider before done section */}
      <View style={s.divider} />

      {/* Done section */}
      <View>
        <Pressable onPress={() => toggleCollapse("done")} style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <SectionIcon color="#222" type="done" />
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
            {doneItems.map(item => (
              <View key={item.id} style={s.itemRow}>
                <Pressable
                  onLongPress={() => setSwipedId(swipedId === item.id ? null : item.id)}
                  style={[s.itemCard, swipedId === item.id && s.itemCardSwiped]}
                >
                  <CheckIcon checked color={item.color} />
                  <Text numberOfLines={1} style={s.itemText}>{item.text}</Text>
                </Pressable>
                {swipedId === item.id && (
                  <Pressable onPress={() => deleteDoneItem(item.id)} style={s.deleteBtn}>
                    <TrashIcon />
                  </Pressable>
                )}
              </View>
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
    paddingHorizontal: 10,
    paddingTop: 50,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 4,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
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
  itemRow: {
    flexDirection: "row",
    gap: 10,
  },
  itemCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    height: 60,
    paddingHorizontal: 14,
  },
  itemCardSwiped: {
    flex: 0,
    flexBasis: "82%",
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
  deleteBtn: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.10)",
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  divider: {
    backgroundColor: "rgba(0,0,0,0.06)",
    height: 1,
    width: "100%",
  },
});
