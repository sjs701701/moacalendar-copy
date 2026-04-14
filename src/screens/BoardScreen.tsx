import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RichText, useBridgeState, useEditorBridge } from "@10play/tentap-editor";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

type CategoryFilter =
  | "전체"
  | "기본"
  | "반려동물"
  | "운동"
  | "건강"
  | "결혼"
  | "소비"
  | "육아"
  | "스터디";

const CATEGORIES: CategoryFilter[] = [
  "전체",
  "기본",
  "반려동물",
  "운동",
  "건강",
  "결혼",
  "소비",
  "육아",
  "스터디",
];

const CATEGORY_COLORS: Record<CategoryFilter, string> = {
  전체: "#222222",
  기본: "#FFC54A",
  반려동물: "#7550F5",
  운동: "#FE655D",
  건강: "#1FD2C3",
  결혼: "#F059A7",
  소비: "#50A5F5",
  육아: "#FF9030",
  스터디: "#88C255",
};

type Post = {
  id: string;
  category: CategoryFilter;
  author: string;
  time: string;
  title: string;
  contentHtml?: string;
  contentText?: string;
  views: number;
  likes: number;
  comments: number;
  hasImage: boolean;
};

const TEXT_COLOR_PRESETS = [
  "#FE655D",
  "#7550F5",
  "#50A5F5",
  "#1FD2C3",
  "#88C255",
  "#FF9030",
  "#222222",
] as const;

const DEFAULT_TEXT_COLOR = "#FE655D";
const DEFAULT_HIGHLIGHT_COLOR = "#FFF0A8";

const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    category: "반려동물",
    author: "10년차 집사",
    time: "10분 전",
    title: "강아지 유치원 적응이 걱정돼요. 준비물은 어떻게 챙기셨는지 같이 공유해요.",
    views: 36,
    likes: 5,
    comments: 12,
    hasImage: true,
  },
  {
    id: "2",
    category: "결혼",
    author: "예신일기",
    time: "20분 전",
    title: "스드메 계약 끝내고 나니 촬영 일정이 헷갈려요. 정리 팁 있으시면 부탁드려요.",
    views: 36,
    likes: 5,
    comments: 12,
    hasImage: true,
  },
  {
    id: "3",
    category: "스터디",
    author: "공부기록",
    time: "20분 전",
    title: "이번 주 공부 루틴 공유합니다. 같이 목표 관리하실 분 계신가요?",
    views: 36,
    likes: 5,
    comments: 12,
    hasImage: false,
  },
  {
    id: "4",
    category: "소비",
    author: "소비기록",
    time: "20분 전",
    title: "소비 캘린더로 정리하니까 고정비랑 생활비 흐름이 훨씬 잘 보여요.",
    views: 36,
    likes: 5,
    comments: 12,
    hasImage: false,
  },
  {
    id: "5",
    category: "육아",
    author: "육아메모",
    time: "20분 전",
    title: "아이 예방접종 일정 정리하시는 분들, 발달검사 일정도 같이 넣으면 편해요.",
    views: 36,
    likes: 5,
    comments: 12,
    hasImage: true,
  },
  {
    id: "6",
    category: "기본",
    author: "캘린더초보",
    time: "32분 전",
    title: "가족 일정이랑 개인 일정을 분리해서 보는 방법 공유해요.",
    views: 24,
    likes: 3,
    comments: 4,
    hasImage: false,
  },
  {
    id: "7",
    category: "운동",
    author: "헬스루틴",
    time: "45분 전",
    title: "주 3회 운동 루틴을 캘린더로 관리하니까 빠지는 날이 확 줄었어요.",
    views: 51,
    likes: 9,
    comments: 7,
    hasImage: true,
  },
  {
    id: "8",
    category: "건강",
    author: "건강메모",
    time: "1시간 전",
    title: "약 복용 시간, 병원 예약, 검사 결과까지 한 번에 적어두니 편하네요.",
    views: 19,
    likes: 2,
    comments: 1,
    hasImage: false,
  },
  {
    id: "9",
    category: "스터디",
    author: "수험생",
    time: "1시간 전",
    title: "시험 기간에는 공부 시간 기록을 템플릿으로 만들어두면 훨씬 편해요.",
    views: 42,
    likes: 8,
    comments: 10,
    hasImage: true,
  },
  {
    id: "10",
    category: "소비",
    author: "절약생활",
    time: "2시간 전",
    title: "주간 지출을 모아보니 배달비가 생각보다 커서 줄여보려고 합니다.",
    views: 37,
    likes: 6,
    comments: 5,
    hasImage: false,
  },
  {
    id: "11",
    category: "반려동물",
    author: "다묘집사",
    time: "2시간 전",
    title: "예방접종, 미용 예약, 사료 주문까지 같이 적어두면 진짜 편해요.",
    views: 28,
    likes: 4,
    comments: 6,
    hasImage: false,
  },
  {
    id: "12",
    category: "결혼",
    author: "플랜정리중",
    time: "3시간 전",
    title: "웨딩 체크리스트를 달력 기반으로 바꾸니까 우선순위가 더 잘 보입니다.",
    views: 63,
    likes: 11,
    comments: 9,
    hasImage: true,
  },
  {
    id: "13",
    category: "육아",
    author: "초보엄마",
    time: "3시간 전",
    title: "어린이집 준비물 챙기기를 반복 일정으로 넣으니 마음이 훨씬 편해졌어요.",
    views: 31,
    likes: 5,
    comments: 3,
    hasImage: false,
  },
  {
    id: "14",
    category: "기본",
    author: "정리왕",
    time: "4시간 전",
    title: "색상별 캘린더를 분리해두면 한눈에 파악하기가 좋아집니다.",
    views: 17,
    likes: 1,
    comments: 2,
    hasImage: false,
  },
  {
    id: "15",
    category: "건강",
    author: "식단기록중",
    time: "5시간 전",
    title: "식단 기록과 컨디션 메모를 같이 쓰면 패턴이 잘 보여서 추천해요.",
    views: 46,
    likes: 7,
    comments: 8,
    hasImage: true,
  },
];

function NoticeIcon() {
  return (
    <Svg height={15} viewBox="0 0 16 15" width={16}>
      <Path d="M2 6.5v2a1 1 0 001 1h1l2.5 3.5V2L4 5.5H3a1 1 0 00-1 1z" fill="none" stroke="#222" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} />
      <Path d="M10 5.5a2.5 2.5 0 010 4" fill="none" stroke="#222" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} />
      <Path d="M12 3.5a5 5 0 010 8" fill="none" stroke="#222" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} />
    </Svg>
  );
}

function EyeIcon() {
  return (
    <Svg height={15} viewBox="0 0 15 15" width={15}>
      <Path d="M1.5 7.5s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" fill="none" stroke="#A6ABB8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} />
      <Circle cx={7.5} cy={7.5} fill="none" r={1.5} stroke="#A6ABB8" strokeWidth={1.2} />
    </Svg>
  );
}

function HeartIcon() {
  return (
    <Svg height={15} viewBox="0 0 15 15" width={15}>
      <Path d="M7.5 12.5s-5-3.5-5-6.5a2.5 2.5 0 015 0 2.5 2.5 0 015 0c0 3-5 6.5-5 6.5z" fill="none" stroke="#A6ABB8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} />
    </Svg>
  );
}

function CommentIcon() {
  return (
    <Svg height={15} viewBox="0 0 15 15" width={15}>
      <Path d="M2 3a1 1 0 011-1h9a1 1 0 011 1v7a1 1 0 01-1 1H6l-3 2.5V11H3a1 1 0 01-1-1V3z" fill="none" stroke="#A6ABB8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} />
    </Svg>
  );
}

function DotMenuIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg height={size} viewBox="0 0 20 20" width={size}>
      <Circle cx={4.5} cy={10} fill="#A6ABB8" r={1.5} />
      <Circle cx={10} cy={10} fill="#A6ABB8" r={1.5} />
      <Circle cx={15.5} cy={10} fill="#A6ABB8" r={1.5} />
    </Svg>
  );
}

function ReplyIcon() {
  return (
    <Svg height={15} viewBox="0 0 15 15" width={15}>
      <Path d="M2 3a1 1 0 011-1h9a1 1 0 011 1v6a1 1 0 01-1 1H8l-2.5 2.5V10H3a1 1 0 01-1-1V3z" fill="none" stroke="#A6ABB8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Path d="M4 12l16-8-4 8 4 8-16-8z" fill="none" stroke="#7550F5" strokeLinejoin="round" strokeWidth={1.5} />
      <Line stroke="#7550F5" strokeLinecap="round" strokeWidth={1.5} x1={10} x2={20} y1={12} y2={12} />
    </Svg>
  );
}

function BackArrowIcon() {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Path d="M15 6l-6 6 6 6" fill="none" stroke="#222" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
    </Svg>
  );
}

function LikeHeartIcon({ filled }: { filled?: boolean }) {
  return (
    <Svg height={18} viewBox="0 0 18 18" width={18}>
      <Path
        d="M9 15s-6-4.2-6-7.8A3 3 0 019 6a3 3 0 016 1.2C15 10.8 9 15 9 15z"
        fill={filled ? "#FE655D" : "none"}
        stroke={filled ? "#FE655D" : "#A6ABB8"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
      />
    </Svg>
  );
}

type Comment = {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
};

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "닉네임",
    content: "댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다.",
    date: "26.01.01",
    likes: 5,
    replies: [],
  },
  {
    id: "c2",
    author: "닉네임",
    content: "댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다.",
    date: "26.01.01",
    likes: 7,
    replies: [
      {
        id: "c2r1",
        author: "닉네임",
        content: "댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다.",
        date: "26.01.01",
        likes: 0,
      },
      {
        id: "c2r2",
        author: "닉네임",
        content: "댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다. 댓글 내용이 노출됩니다.",
        date: "26.01.01",
        likes: 0,
      },
    ],
  },
];

function ImagePlaceholder() {
  return (
    <View style={s.postImagePlaceholder}>
      <Svg height={24} viewBox="0 0 24 24" width={24}>
        <Path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" fill="none" stroke="#D0D3DA" strokeWidth={1.2} />
        <Circle cx={9} cy={9} fill="#D0D3DA" r={1.5} />
        <Path d="M4 16l4-4 3 3 2-2 7 7" fill="none" stroke="#D0D3DA" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} />
      </Svg>
    </View>
  );
}

/* ??? Main Component ??? */

type BoardScreenProps = {
  writeCategory?: { id: string; label: string; color: string } | null;
  onWriteCategoryClose?: () => void;
};

export function BoardScreen({ writeCategory: writeCategoryProp, onWriteCategoryClose }: BoardScreenProps) {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("전체");
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    dynamicHeight: true,
    initialContent: "",
  });
  const editorState = useBridgeState(editor) as {
    activeColor?: string;
    activeHighlight?: string;
    activeLink?: string;
    canSetLink?: boolean;
    canToggleBold?: boolean;
    canToggleItalic?: boolean;
    canToggleStrike?: boolean;
    canToggleUnderline?: boolean;
    isBoldActive?: boolean;
    isFocused?: boolean;
    isReady?: boolean;
    isItalicActive?: boolean;
    isLinkActive?: boolean;
    isStrikeActive?: boolean;
    isUnderlineActive?: boolean;
    selection?: { from: number; to: number };
  };

  // View modal
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewComments, setViewComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [commentInput, setCommentInput] = useState("");
  const [viewLiked, setViewLiked] = useState(false);

  const closeViewModal = () => {
    setSelectedPost(null);
    setCommentInput("");
    setViewLiked(false);
  };

  const handleSubmitComment = () => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: String(Date.now()),
      author: "나",
      content: commentInput.trim(),
      date: "방금 전",
      likes: 0,
      replies: [],
    };
    setViewComments((prev) => [...prev, newComment]);
    setCommentInput("");
  };

  // Write modal
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [writeCategoryLabel, setWriteCategoryLabel] = useState("");
  const [writeTitle, setWriteTitle] = useState("");
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState(false);
  const [customTextColor, setCustomTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const isEditorReady = !!editorState.isReady;
  const selection = editorState.selection ?? { from: 0, to: 0 };
  const hasTextSelection = selection.from !== selection.to;
  const activeTextColor = editorState.activeColor;
  const activeHighlightColor = editorState.activeHighlight;

  const runEditorAction = (action: () => void) => {
    if (!isEditorReady) return;
    if (!hasTextSelection && !editorState.isLinkActive) return;

    editor.setSelection(selection.from, selection.to);

    if (Platform.OS === "android") {
      setTimeout(() => {
        action();
        editor.focus();
      }, 0);
      return;
    }

    action();
    editor.focus();
  };

  const normalizeHexColor = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return /^#[0-9A-Fa-f]{6}$/.test(withHash) ? withHash.toUpperCase() : null;
  };

  const applyTextColor = (color: string) => {
    runEditorAction(() => editor.setColor(color));
    setCustomTextColor(color);
    setIsTextColorPickerOpen(false);
  };

  const clearTextColor = () => {
    runEditorAction(() => editor.unsetColor());
    setIsTextColorPickerOpen(false);
  };

  const applyCustomTextColor = () => {
    const normalized = normalizeHexColor(customTextColor);
    if (!normalized) return;
    applyTextColor(normalized);
  };

  const toggleHighlight = () => {
    runEditorAction(() => {
      if (activeHighlightColor) {
        editor.unsetHighlight();
        return;
      }

      editor.setHighlight(DEFAULT_HIGHLIGHT_COLOR);
    });
  };

  const openLinkModal = () => {
    if (!hasTextSelection && !editorState.isLinkActive) return;
    setLinkInput(editorState.activeLink ?? "");
    setIsLinkModalOpen(true);
  };

  const submitLink = () => {
    const nextValue = linkInput.trim();
    runEditorAction(() => editor.setLink(nextValue ? nextValue : null));
    setIsLinkModalOpen(false);
  };

  useEffect(() => {
    if (!isWriteOpen || !isEditorReady) return;

    editor.setPlaceholder("내용을 입력해주세요.");
    editor.injectCSS(`
      .ProseMirror {
        color: #222222;
        font-size: 14px;
        letter-spacing: -0.28px;
        line-height: 21px;
        min-height: 268px;
        outline: none;
      }
      .ProseMirror p {
        margin: 0;
      }
      .ProseMirror a {
        color: #4D71FF;
        text-decoration: underline;
      }
      .ProseMirror mark {
        border-radius: 2px;
        padding: 0 1px;
      }
    `);
  }, [isEditorReady, isWriteOpen]);

  useEffect(() => {
    if (writeCategoryProp) {
      setWriteCategoryLabel(writeCategoryProp.label);
      setWriteTitle("");
      setCustomTextColor(DEFAULT_TEXT_COLOR);
      setLinkInput("");
      setIsLinkModalOpen(false);
      setIsTextColorPickerOpen(false);
      setIsWriteOpen(true);
    }
  }, [writeCategoryProp]);

  useEffect(() => {
    if (!isWriteOpen || !isEditorReady) return;
    editor.setContent("");
  }, [isEditorReady, isWriteOpen, writeCategoryProp?.id]);

  const closeWriteModal = () => {
    setIsWriteOpen(false);
    setWriteCategoryLabel("");
    setWriteTitle("");
    setIsTextColorPickerOpen(false);
    setIsLinkModalOpen(false);
    setLinkInput("");
    setCustomTextColor(DEFAULT_TEXT_COLOR);
    if (isEditorReady) {
      editor.blur();
      editor.setContent("");
    }
    onWriteCategoryClose?.();
  };

  const handleSubmitPost = async () => {
    if (!writeCategoryLabel || !writeTitle.trim()) return;

    const [contentHtml, contentText] = await Promise.all([
      editor.getHTML(),
      editor.getText(),
    ]);
    const newPost: Post = {
      id: String(Date.now()),
      category: writeCategoryLabel as CategoryFilter,
      author: "나",
      time: "방금 전",
      title: writeTitle.trim(),
      contentHtml,
      contentText,
      views: 0,
      likes: 0,
      comments: 0,
      hasImage: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    closeWriteModal();
  };

  const filteredPosts =
    activeCategory === "전체"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <View style={s.root}>
      {/* Category filter */}
      <ScrollView
        contentContainerStyle={s.filterRow}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
      >
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            onPress={() => setActiveCategory(category)}
            style={[
              s.filterChip,
              activeCategory === category ? s.filterChipActive : s.filterChipInactive,
            ]}
          >
            <Text
              style={[
                s.filterChipText,
                activeCategory === category
                  ? s.filterChipTextActive
                  : s.filterChipTextInactive,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Notice */}
      <View style={s.noticeWrap}>
        <View style={s.noticeCard}>
          <View style={s.noticeLeft}>
            <NoticeIcon />
            <Text numberOfLines={1} style={s.noticeText}>공지 내용을 입력해주세요.</Text>
          </View>
          <Text style={s.noticeDate}>2026.01.01</Text>
        </View>
      </View>

      {/* Posts */}
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.postList}>
          {filteredPosts.map((post) => (
            <Pressable key={post.id} onPress={() => setSelectedPost(post)} style={s.postCard}>
              <View style={s.postHeader}>
                <Text style={[s.postCategory, { color: CATEGORY_COLORS[post.category] || "#222" }]}>
                  {post.category}
                </Text>
                <View style={s.postMeta}>
                  <Text style={s.postMetaText}>{post.author}</Text>
                  <View style={s.dot} />
                  <Text style={s.postMetaText}>{post.time}</Text>
                </View>
              </View>
              <View style={s.postBody}>
                <View style={s.postTextArea}>
                  <Text numberOfLines={2} style={s.postTitle}>{post.title}</Text>
                  <View style={s.postStats}>
                    <View style={s.statItem}>
                      <EyeIcon />
                      <Text style={s.statText}>{post.views}</Text>
                    </View>
                    <View style={s.statItem}>
                      <HeartIcon />
                      <Text style={s.statText}>{post.likes}</Text>
                    </View>
                    <View style={s.statItem}>
                      <CommentIcon />
                      <Text style={s.statText}>{post.comments}</Text>
                    </View>
                  </View>
                </View>
                {post.hasImage ? <ImagePlaceholder /> : null}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* View modal */}
      <Modal
        animationType="slide"
        onRequestClose={closeViewModal}
        visible={!!selectedPost}
      >
        {selectedPost && (
          <View style={vs.root}>
            <ScrollView contentContainerStyle={vs.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Header + Title + Author — one white block */}
              <View style={vs.topCard}>
                {/* Header */}
                <View style={vs.header}>
                  <Pressable onPress={closeViewModal}>
                    <BackArrowIcon />
                  </Pressable>
                  <Text style={vs.headerTitle}>{selectedPost.category}</Text>
                  <View style={{ width: 24 }} />
                </View>

                {/* Title + dot menu */}
                <View style={vs.titleRow}>
                  <Text style={vs.titleText}>{selectedPost.title}</Text>
                  <Pressable style={vs.dotMenuBtn}>
                    <DotMenuIcon />
                  </Pressable>
                </View>

                <View style={vs.divider} />

                {/* Author + stats */}
                <View style={vs.authorRow}>
                  <View style={vs.authorLeft}>
                    <View style={vs.avatar}>
                      <Svg height={20} viewBox="0 0 20 20" width={20}>
                        <Circle cx={10} cy={8} fill="#D0D3DA" r={4} />
                        <Path d="M3 18c0-4 3.5-7 7-7s7 3 7 7" fill="#D0D3DA" />
                      </Svg>
                    </View>
                    <View style={vs.authorInfo}>
                      <Text style={vs.authorName}>{selectedPost.author}</Text>
                      <Text style={vs.authorTime}>{selectedPost.time}</Text>
                    </View>
                  </View>
                  <View style={vs.statsRow}>
                    <View style={s.statItem}>
                      <EyeIcon />
                      <Text style={s.statText}>{selectedPost.views}</Text>
                    </View>
                    <View style={s.statItem}>
                      <HeartIcon />
                      <Text style={s.statText}>{selectedPost.likes}</Text>
                    </View>
                    <View style={s.statItem}>
                      <CommentIcon />
                      <Text style={s.statText}>{selectedPost.comments}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Post content */}
              <View style={vs.bodyPadding}>
                <Text style={vs.contentText}>
                  {selectedPost.contentText ||
                    "안경이 너무 커서 얼굴 반 이상 가려짐 본인은 상황 파악이 아직 안 된 표정 왜 다들 웃는지 이해 못 하는 눈빛 그래도 가만히 있어주는 착한 강아지 잠깐이지만 모델 포스는 확실함 사진 찍는 동안 꼼짝도 안 함\n\n안경 너머로 보이는 초롱초롱한 눈 이대로 화보 찍어도 될 듯\n\n결론은 너무 귀엽다 안경은 다시 제자리로 ㅎㅎ"}
                </Text>
              </View>

              {/* Post image */}
              {selectedPost.hasImage && (
                <View style={[vs.postImage, vs.bodyPadding]}>
                  <View style={vs.postImageInner}>
                    <Svg height={48} viewBox="0 0 48 48" width={48}>
                      <Path d="M8 10a2 2 0 012-2h28a2 2 0 012 2v28a2 2 0 01-2 2H10a2 2 0 01-2-2V10z" fill="none" stroke="#D0D3DA" strokeWidth={1.5} />
                      <Circle cx={18} cy={18} fill="#D0D3DA" r={3} />
                      <Path d="M8 32l8-8 6 6 4-4 14 14" fill="none" stroke="#D0D3DA" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                    </Svg>
                  </View>
                </View>
              )}

              {/* Like button */}
              <Pressable onPress={() => setViewLiked((p) => !p)} style={vs.likeBtn}>
                <LikeHeartIcon filled={viewLiked} />
                <Text style={[vs.likeBtnText, viewLiked && { color: "#FE655D" }]}>Like</Text>
              </Pressable>

              <View style={[vs.dividerFull, vs.bodyPadding]} />

              {/* Comments section */}
              <View style={[vs.commentsSection, vs.bodyPadding]}>
                <Text style={vs.commentsSectionTitle}>댓글 {viewComments.length + viewComments.reduce((acc, c) => acc + (c.replies?.length ?? 0), 0)}개</Text>

                {viewComments.map((comment) => (
                  <View key={comment.id} style={vs.commentCard}>
                    {/* Parent comment */}
                    <View style={vs.commentRow}>
                      <View style={vs.commentAvatar}>
                        <Svg height={20} viewBox="0 0 20 20" width={20}>
                          <Circle cx={10} cy={8} fill="#D0D3DA" r={4} />
                          <Path d="M3 18c0-4 3.5-7 7-7s7 3 7 7" fill="#D0D3DA" />
                        </Svg>
                      </View>
                      <View style={vs.commentContent}>
                        <View style={vs.commentNameRow}>
                          <Text style={vs.commentAuthor}>{comment.author}</Text>
                          <DotMenuIcon size={15} />
                        </View>
                        <Text numberOfLines={2} style={vs.commentText}>{comment.content}</Text>
                        <View style={vs.commentFooter}>
                          <Text style={vs.commentDate}>{comment.date}</Text>
                          <View style={vs.commentActions}>
                            <View style={s.statItem}>
                              <HeartIcon />
                              <Text style={s.statText}>{comment.likes}</Text>
                            </View>
                            <View style={s.statItem}>
                              <ReplyIcon />
                              <Text style={s.statText}>{comment.replies?.length ?? 0}</Text>
                            </View>
                            <Text style={vs.replyLink}>대댓글달기</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && comment.replies.map((reply, ri) => (
                      <View key={reply.id}>
                        <View style={vs.replyDivider} />
                        <View style={vs.replyRow}>
                          <View style={vs.commentAvatar}>
                            <Svg height={20} viewBox="0 0 20 20" width={20}>
                              <Circle cx={10} cy={8} fill="#D0D3DA" r={4} />
                              <Path d="M3 18c0-4 3.5-7 7-7s7 3 7 7" fill="#D0D3DA" />
                            </Svg>
                          </View>
                          <View style={vs.commentContent}>
                            <View style={vs.commentNameRow}>
                              <Text style={vs.commentAuthor}>{reply.author}</Text>
                              <DotMenuIcon size={15} />
                            </View>
                            <Text numberOfLines={2} style={vs.commentText}>{reply.content}</Text>
                            <View style={vs.commentFooter}>
                              <Text style={vs.commentDate}>{reply.date}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Bottom comment input bar */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={vs.commentBar}>
                <View style={vs.commentInputWrap}>
                  <TextInput
                    onChangeText={setCommentInput}
                    placeholder="댓글을 입력해주세요."
                    placeholderTextColor="#A6ABB8"
                    style={vs.commentInputText}
                    value={commentInput}
                  />
                </View>
                <Pressable onPress={handleSubmitComment}>
                  <SendIcon />
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}
      </Modal>

      {/* Write modal */}
      <Modal
        animationType="slide"
        onRequestClose={closeWriteModal}
        visible={isWriteOpen && !!writeCategoryLabel}
      >
        <View style={s.writeRoot}>
          {/* Header */}
          <View style={s.writeHeader}>
            <Text style={s.writeHeaderTitle}>{writeCategoryLabel}</Text>
            <Pressable onPress={closeWriteModal}>
              <Svg height={24} viewBox="0 0 24 24" width={24}>
                <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.8} x1={6} x2={18} y1={6} y2={18} />
                <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.8} x1={18} x2={6} y1={6} y2={18} />
              </Svg>
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={s.writeBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Title input */}
              <View style={[s.writeTitleBox, isTitleFocused && s.writeInputFocused]}>
                <TextInput
                  onBlur={() => setIsTitleFocused(false)}
                  onChangeText={setWriteTitle}
                  onFocus={() => setIsTitleFocused(true)}
                  placeholder="제목을 입력해주세요."
                  placeholderTextColor="#A6ABB8"
                  style={s.writeTitleInput}
                  value={writeTitle}
                />
              </View>

              {/* Format bar */}
              <View style={s.formatBar}>
                <Pressable
                  onPress={() => {
                    setCustomTextColor(activeTextColor ?? customTextColor);
                    setIsTextColorPickerOpen((prev) => !prev);
                  }}
                  style={[
                    s.formatBtn,
                    !!activeTextColor && s.formatBtnActive,
                  ]}
                >
                  <Svg height={20} viewBox="0 0 20 20" width={20}>
                    <Path d="M6.5 14L10 5l3.5 9" fill="none" stroke={activeTextColor ? "#7550F5" : "#555"} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                    <Line stroke={activeTextColor ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.5} x1={7.8} x2={12.2} y1={11.5} y2={11.5} />
                    <Rect fill={activeTextColor ?? DEFAULT_TEXT_COLOR} height={2.5} rx={1} width={10} x={5} y={15.5} />
                  </Svg>
                </Pressable>

                <Pressable
                  onPress={() => runEditorAction(() => editor.toggleBold())}
                  style={[
                    s.formatBtn,
                    editorState.isBoldActive && s.formatBtnActive,
                  ]}
                >
                  <Svg height={20} viewBox="0 0 20 20" width={20}>
                    <Path d="M6 4h5a3 3 0 010 6H6V4z" fill="none" stroke={editorState.isBoldActive ? "#7550F5" : "#555"} strokeLinejoin="round" strokeWidth={1.8} />
                    <Path d="M6 10h6a3 3 0 010 6H6v-6z" fill="none" stroke={editorState.isBoldActive ? "#7550F5" : "#555"} strokeLinejoin="round" strokeWidth={1.8} />
                  </Svg>
                </Pressable>

                <Pressable
                  onPress={() => runEditorAction(() => editor.toggleItalic())}
                  style={[
                    s.formatBtn,
                    editorState.isItalicActive && s.formatBtnActive,
                  ]}
                >
                  <Svg height={20} viewBox="0 0 20 20" width={20}>
                    <Line stroke={editorState.isItalicActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.6} x1={12} x2={8} y1={4} y2={16} />
                    <Line stroke={editorState.isItalicActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.6} x1={9} x2={14} y1={4} y2={4} />
                    <Line stroke={editorState.isItalicActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.6} x1={6} x2={11} y1={16} y2={16} />
                  </Svg>
                </Pressable>

                <Pressable
                  onPress={() => runEditorAction(() => editor.toggleUnderline())}
                  style={[
                    s.formatBtn,
                    editorState.isUnderlineActive && s.formatBtnActive,
                  ]}
                >
                  <Svg height={20} viewBox="0 0 20 20" width={20}>
                    <Path d="M6 4v6a4 4 0 008 0V4" fill="none" stroke={editorState.isUnderlineActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.6} />
                    <Line stroke={editorState.isUnderlineActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.6} x1={5} x2={15} y1={17} y2={17} />
                  </Svg>
                </Pressable>

                <Pressable
                  onPress={() => runEditorAction(() => editor.toggleStrike())}
                  style={[
                    s.formatBtn,
                    editorState.isStrikeActive && s.formatBtnActive,
                  ]}
                >
                  <Svg height={20} viewBox="0 0 20 20" width={20}>
                    <Path d="M13.5 7.5c-.5-1.5-2-2.5-3.5-2.5-2 0-3.5 1-3.5 2.5s1 2 2.5 2.5" fill="none" stroke={editorState.isStrikeActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.5} />
                    <Path d="M6.5 12.5c.5 1.5 2 2.5 3.5 2.5 2 0 3.5-1 3.5-2.5s-1-2-2.5-2.5" fill="none" stroke={editorState.isStrikeActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.5} />
                    <Line stroke={editorState.isStrikeActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.5} x1={4} x2={16} y1={10} y2={10} />
                  </Svg>
                </Pressable>

                <Pressable
                  onPress={toggleHighlight}
                  style={[
                    s.formatBtn,
                    !!activeHighlightColor && s.formatBtnActive,
                  ]}
                >
                  <Svg height={20} viewBox="0 0 20 20" width={20}>
                    <Path d="M11.5 3.5l5 5-7 7-5-5 7-7z" fill="none" stroke={activeHighlightColor ? "#7550F5" : "#555"} strokeLinejoin="round" strokeWidth={1.5} />
                    <Path d="M4.5 15.5l-1 3 3-1-2-2z" fill={activeHighlightColor ? "#7550F5" : "#555"} stroke={activeHighlightColor ? "#7550F5" : "#555"} strokeLinejoin="round" strokeWidth={1} />
                    <Rect fill={activeHighlightColor ?? "#FFD84A"} height={2.5} rx={1} width={12} x={4} y={16} />
                  </Svg>
                </Pressable>

                <Pressable
                  onPress={openLinkModal}
                  style={[
                    s.formatBtn,
                    editorState.isLinkActive && s.formatBtnActive,
                  ]}
                >
                  <Svg height={20} viewBox="0 0 20 20" width={20}>
                    <Path d="M8.5 11.5a3 3 0 004 .5l2-2a3 3 0 00-4.24-4.24L9 7" fill="none" stroke={editorState.isLinkActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.5} />
                    <Path d="M11.5 8.5a3 3 0 00-4-.5l-2 2A3 3 0 009.74 14.24L11 13" fill="none" stroke={editorState.isLinkActive ? "#7550F5" : "#555"} strokeLinecap="round" strokeWidth={1.5} />
                  </Svg>
                </Pressable>
              </View>

              {isTextColorPickerOpen ? (
                <View style={s.colorPickerCard}>
                  <View style={s.colorSwatchRow}>
                    {TEXT_COLOR_PRESETS.map((color) => (
                      <Pressable
                        key={color}
                        onPress={() => applyTextColor(color)}
                        style={[
                          s.colorSwatchButton,
                          (activeTextColor ?? customTextColor) === color && s.colorSwatchButtonActive,
                        ]}
                      >
                        <View style={[s.colorSwatchFill, { backgroundColor: color }]} />
                      </Pressable>
                    ))}
                  </View>
                  <View style={s.colorPickerInputRow}>
                    <TextInput
                      autoCapitalize="characters"
                      onChangeText={setCustomTextColor}
                      placeholder="#RRGGBB"
                      placeholderTextColor="#A6ABB8"
                      style={s.colorPickerInput}
                      value={customTextColor}
                    />
                    <Pressable onPress={applyCustomTextColor} style={s.colorPickerActionBtn}>
                      <Text style={s.colorPickerActionText}>적용</Text>
                    </Pressable>
                    <Pressable onPress={clearTextColor} style={s.colorPickerGhostBtn}>
                      <Text style={s.colorPickerGhostText}>해제</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              {/* Content input */}
              <View style={[s.writeContentBox, editorState.isFocused && s.writeInputFocused, { flex: 1 }]}>
                <RichText
                  editor={editor}
                  style={s.writeContentInput}
                />
              </View>
              {/* Photo upload */}
              <View style={s.writePhotoSection}>
                <Text style={s.writePhotoLabel}>사진등록 (최대 5장)</Text>
                <View style={s.writePhotoRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <View key={i} style={s.writePhotoSlot}>
                      <Svg height={24} viewBox="0 0 24 24" width={24}>
                        <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.8} x1={12} x2={12} y1={6} y2={18} />
                        <Line stroke="#A6ABB8" strokeLinecap="round" strokeWidth={1.8} x1={6} x2={18} y1={12} y2={12} />
                      </Svg>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Submit button */}
            <View style={s.writeFooter}>
              <Pressable
                disabled={!writeTitle.trim()}
                onPress={handleSubmitPost}
                style={[s.writeSubmitBtn, !writeTitle.trim() && s.writeSubmitBtnDisabled]}
              >
                <Text style={s.writeSubmitText}>작성하기</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>

          {isLinkModalOpen ? (
            <View style={s.linkSheetOverlay}>
              <Pressable onPress={() => setIsLinkModalOpen(false)} style={s.linkSheetBackdrop} />
              <View style={s.linkSheetCard}>
                <Text style={s.linkSheetTitle}>링크 추가</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  onChangeText={setLinkInput}
                  placeholder="https://example.com"
                  placeholderTextColor="#A6ABB8"
                  style={s.linkSheetInput}
                  value={linkInput}
                />
                <View style={s.linkSheetActions}>
                  <Pressable onPress={() => setIsLinkModalOpen(false)} style={s.linkSheetGhostBtn}>
                    <Text style={s.linkSheetGhostText}>취소</Text>
                  </Pressable>
                  <Pressable onPress={() => {
                    setLinkInput('');
                    runEditorAction(() => editor.setLink(null));
                    setIsLinkModalOpen(false);
                  }} style={s.linkSheetGhostBtn}>
                    <Text style={s.linkSheetGhostText}>해제</Text>
                  </Pressable>
                  <Pressable onPress={submitLink} style={s.linkSheetPrimaryBtn}>
                    <Text style={s.linkSheetPrimaryText}>적용</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },

  /* ? Filter ? */
  filterScroll: {
    flexGrow: 0,
    marginBottom: 15,
    overflow: "visible",
  },
  filterRow: {
    gap: 5,
    paddingBottom: 15,
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  filterChip: {
    alignItems: "center",
    borderRadius: 100,
    height: 34,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  filterChipActive: {
    backgroundColor: "#222",
  },
  filterChipInactive: {
    backgroundColor: "#FFF",
    borderColor: "rgba(166,171,184,0.2)",
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    letterSpacing: -0.28,
  },
  filterChipTextActive: {
    color: "#FFF",
    fontWeight: "700",
  },
  filterChipTextInactive: {
    color: "#222",
    fontWeight: "500",
  },

  /* ? Notice ? */
  noticeWrap: {
    marginBottom: 15,
    paddingHorizontal: 25,
  },
  noticeCard: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    elevation: 6,
    flexDirection: "row",
    height: 60,
    justifyContent: "space-between",
    paddingHorizontal: 15,
    shadowColor: "#5E616C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  noticeLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  noticeText: {
    color: "#222",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.28,
  },
  noticeDate: {
    color: "#A6ABB8",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: -0.24,
  },

  /* ? Posts ? */
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 25,
  },
  postList: {
    gap: 15,
  },
  postCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    gap: 10,
    padding: 15,
  },
  postHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  postCategory: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: -0.24,
  },
  postMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  postMetaText: {
    color: "#A6ABB8",
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  dot: {
    backgroundColor: "#A6ABB8",
    borderRadius: 1,
    height: 2,
    width: 2,
  },
  postBody: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  postTextArea: {
    flex: 1,
    gap: 10,
    marginRight: 10,
  },
  postTitle: {
    color: "#222",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  postStats: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  statItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  statText: {
    color: "#A6ABB8",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: -0.24,
  },
  postImagePlaceholder: {
    alignItems: "center",
    backgroundColor: "#F0F1F5",
    borderRadius: 10,
    height: 70,
    justifyContent: "center",
    width: 70,
  },

  /* ? Write modal ? */
  writeRoot: {
    backgroundColor: "#F6F7FB",
    flex: 1,
  },
  writeHeader: {
    alignItems: "center",
    flexDirection: "row",
    height: 60,
    justifyContent: "space-between",
    marginTop: 50,
    paddingHorizontal: 25,
  },
  writeHeaderTitle: {
    color: "#222",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.44,
  },
  writeBody: {
    flexGrow: 1,
    gap: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  writeTitleBox: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  writeTitleInput: {
    color: "#222",
    fontSize: 14,
    letterSpacing: -0.28,
  },
  formatBar: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    flexDirection: "row",
    height: 48,
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  formatBtn: {
    alignItems: "center",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  formatBtnActive: {
    backgroundColor: "rgba(117,80,245,0.1)",
  },
  colorPickerCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    gap: 12,
    padding: 15,
  },
  colorSwatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorSwatchButton: {
    alignItems: "center",
    borderColor: "rgba(166,171,184,0.3)",
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  colorSwatchButtonActive: {
    borderColor: "#7550F5",
    borderWidth: 2,
  },
  colorSwatchFill: {
    borderRadius: 999,
    height: 18,
    width: 18,
  },
  colorPickerInputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  colorPickerInput: {
    backgroundColor: "#F6F7FB",
    borderRadius: 8,
    color: "#222",
    flex: 1,
    fontSize: 13,
    height: 40,
    letterSpacing: -0.26,
    paddingHorizontal: 12,
  },
  colorPickerActionBtn: {
    alignItems: "center",
    backgroundColor: "#7550F5",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  colorPickerActionText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.26,
  },
  colorPickerGhostBtn: {
    alignItems: "center",
    borderColor: "rgba(166,171,184,0.35)",
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  colorPickerGhostText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.26,
  },
  writeContentBox: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 300,
    padding: 15,
  },
  writeInputFocused: {
    borderColor: "#7550F5",
  },
  writeContentInput: {
    flex: 1,
    minHeight: 268,
  },
  writePhotoSection: {
    gap: 10,
  },
  writePhotoLabel: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.32,
  },
  writePhotoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  writePhotoSlot: {
    alignItems: "center",
    backgroundColor: "rgba(166,171,184,0.1)",
    borderRadius: 10,
    height: 70,
    justifyContent: "center",
    width: 70,
  },
  writeFooter: {
    paddingBottom: 50,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  writeSubmitBtn: {
    alignItems: "center",
    backgroundColor: "#7550F5",
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
  },
  writeSubmitBtnDisabled: {
    opacity: 0.4,
  },
  writeSubmitText: {
    color: "#F6F7FB",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.32,
  },
  linkSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  linkSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34,34,34,0.28)",
  },
  linkSheetCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    gap: 16,
    padding: 20,
  },
  linkSheetTitle: {
    color: "#222",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.36,
  },
  linkSheetInput: {
    backgroundColor: "#F6F7FB",
    borderRadius: 10,
    color: "#222",
    fontSize: 14,
    height: 52,
    letterSpacing: -0.28,
    paddingHorizontal: 14,
  },
  linkSheetActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  linkSheetGhostBtn: {
    alignItems: "center",
    borderColor: "rgba(166,171,184,0.35)",
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  linkSheetGhostText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.28,
  },
  linkSheetPrimaryBtn: {
    alignItems: "center",
    backgroundColor: "#7550F5",
    borderRadius: 10,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  linkSheetPrimaryText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.28,
  },
});

/* ─── View modal styles ─── */
const vs = StyleSheet.create({
  root: {
    backgroundColor: "#F6F7FB",
    flex: 1,
  },
  scrollContent: {
    gap: 30,
    paddingBottom: 30,
  },

  /* Top white card (header + title + author) */
  topCard: {
    backgroundColor: "#FFF",
    gap: 20,
    paddingBottom: 20,
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 50,
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#222",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.44,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleText: {
    color: "#222",
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.4,
    lineHeight: 28,
    marginRight: 10,
  },
  dotMenuBtn: {
    padding: 4,
  },
  divider: {
    backgroundColor: "rgba(0,0,0,0.06)",
    height: 1,
    width: "100%",
  },
  authorRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  authorLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#F0F1F5",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  authorInfo: {
    gap: 2,
  },
  authorName: {
    color: "#222",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.28,
  },
  authorTime: {
    color: "#A6ABB8",
    fontSize: 10,
    letterSpacing: -0.2,
  },
  statsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },

  bodyPadding: {
    paddingHorizontal: 25,
  },

  /* Content */
  contentText: {
    color: "#222",
    fontSize: 14,
    letterSpacing: -0.28,
    lineHeight: 21,
  },

  /* Post image */
  postImage: {},
  postImageInner: {
    alignItems: "center",
    backgroundColor: "#E8E9ED",
    borderRadius: 10,
    height: 300,
    justifyContent: "center",
    width: "100%",
  },

  /* Like button */
  likeBtn: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(166,171,184,0.1)",
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    height: 50,
    justifyContent: "center",
    width: 150,
  },
  likeBtnText: {
    color: "#222",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },

  dividerFull: {
    backgroundColor: "rgba(0,0,0,0.06)",
    height: 1,
    width: "100%",
  },

  /* Comments */
  commentsSection: {
    gap: 20,
  },
  commentsSectionTitle: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.32,
  },
  commentCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    elevation: 6,
    paddingHorizontal: 15,
    paddingVertical: 20,
    shadowColor: "#5E616C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
  },
  commentAvatar: {
    alignItems: "center",
    backgroundColor: "#F0F1F5",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  commentContent: {
    flex: 1,
    gap: 10,
  },
  commentNameRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commentAuthor: {
    color: "#222",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.28,
  },
  commentText: {
    color: "#222",
    fontSize: 12,
    letterSpacing: -0.24,
    lineHeight: 16.8,
  },
  commentFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commentDate: {
    color: "#A6ABB8",
    fontSize: 12,
    letterSpacing: -0.24,
  },
  commentActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  replyLink: {
    color: "#868A94",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: -0.24,
  },
  replyDivider: {
    backgroundColor: "rgba(0,0,0,0.06)",
    height: 1,
    marginVertical: 20,
    width: "80%",
    alignSelf: "flex-end",
  },
  replyRow: {
    flexDirection: "row",
    gap: 10,
    paddingLeft: 50,
  },

  /* Bottom comment bar */
  commentBar: {
    alignItems: "center",
    backgroundColor: "#FFF",
    elevation: 10,
    flexDirection: "row",
    gap: 20,
    height: 80,
    paddingBottom: 15,
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  commentInputWrap: {
    backgroundColor: "#F6F7FB",
    borderRadius: 1000,
    flex: 1,
    height: 45,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  commentInputText: {
    color: "#222",
    fontSize: 12,
    letterSpacing: -0.24,
  },
});






