import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";

import { AuthInput } from "../components/AuthInput";
import { AuthMode, AuthModeSwitch } from "../components/AuthModeSwitch";
import { ConfettiBurst } from "../components/ConfettiBurst";
import { MainHomeScreen } from "../screens/MainHomeScreen";
import { colors, radius, shadows, spacing } from "../theme";
import { AuthErrors, validateLogin, validateSignUp } from "../utils/validation";

type LoginForm = {
  email: string;
  password: string;
};

type SignUpForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AgreementKey = "calendarTerms" | "serviceTerms" | "privacyCollection" | "thirdPartySharing" | "marketing";

type ScreenStage =
  | "landing"
  | "mainHome"
  | "loginForm"
  | "signupPhone"
  | "signupName"
  | "signupTerms"
  | "signupComplete"
  | "signupForm";

const loginHero = require("../../assets/auth/login-hero.png");
const appleIcon = require("../../assets/auth/apple-icon.png");
const signupCompleteHero = require("../../assets/auth/signup-complete-hero.png");
const allAgreeCheckOnXml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="9.25" fill="#7550F5" stroke="#7550F5" stroke-width="1.5"/>
<path d="M10.0917 15.9996C9.99206 16.004 9.89383 15.9741 9.81279 15.9148L7.14806 13.6684C6.97638 13.5134 6.95053 13.2496 7.08872 13.063C7.24045 12.8886 7.49694 12.8598 7.68219 12.9964L10.0561 14.9702L16.2876 9.09097C16.4719 8.94981 16.7313 8.9755 16.8856 9.15017C17.0398 9.32484 17.0379 9.59074 16.8811 9.76306L10.3944 15.8785C10.3118 15.9558 10.2039 15.999 10.0917 15.9996Z" fill="white" stroke="white" stroke-width="0.5"/>
</svg>`;
const allAgreeCheckOffXml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.0917 15.9996C9.99206 16.004 9.89383 15.9741 9.81279 15.9148L7.14806 13.6684C6.97638 13.5134 6.95053 13.2496 7.08872 13.063C7.24045 12.8886 7.49694 12.8598 7.68219 12.9964L10.0561 14.9702L16.2876 9.09097C16.4719 8.94981 16.7313 8.9755 16.8856 9.15017C17.0398 9.32484 17.0379 9.59074 16.8811 9.76306L10.3944 15.8785C10.3118 15.9558 10.2039 15.999 10.0917 15.9996Z" fill="#A6ABB8" stroke="#A6ABB8" stroke-width="0.2"/>
<circle cx="12" cy="12" r="9.5" stroke="#A6ABB8"/>
</svg>`;
const agreementCheckOnXml = `<svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.94631 13.2346C5.59988 13.2344 5.26421 13.1142 4.99631 12.8946L0.516307 9.22459C-0.0962757 8.69243 -0.174597 7.7696 0.33954 7.14181C0.853678 6.51402 1.77384 6.40892 2.41631 6.90459L5.88631 9.74459L15.8863 0.534592C16.2622 0.0876644 16.8633 -0.100495 17.4269 0.0523425C17.9905 0.20518 18.4142 0.671229 18.5128 1.24682C18.6114 1.82241 18.3669 2.40289 17.8863 2.73459L6.96631 12.8346C6.69 13.0935 6.32496 13.2367 5.94631 13.2346Z" fill="#7550F5"/>
</svg>`;
const agreementCheckOffXml = `<svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.20948 11.5602C5.04155 11.5676 4.87603 11.5183 4.73948 11.4202L0.249483 7.71024C-0.0397957 7.45413 -0.0833516 7.01857 0.149483 6.71024C0.405152 6.4223 0.837337 6.37476 1.14948 6.60024L5.14948 9.86024L15.6495 0.150241C15.96 -0.0828876 16.3971 -0.0404685 16.657 0.248016C16.9169 0.5365 16.9136 0.97565 16.6495 1.26024L5.71948 11.3602C5.58026 11.488 5.39843 11.5593 5.20948 11.5602Z" fill="#A6ABB8"/>
</svg>`;

const naverIconXml = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1_40)">
<path d="M15 30C23.2843 30 30 23.2843 30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30Z" fill="#222222"/>
<path d="M17.38 8.28998V15.23L12.63 8.28998H7.5V22.04H12.62V15.1L17.37 22.04H22.5V8.28998H17.38Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_1_40">
<rect width="30" height="30" fill="white"/>
</clipPath>
</defs>
</svg>`;

const kakaoIconXml = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1_43)">
<path d="M15 30C23.2843 30 30 23.2843 30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30Z" fill="#222222"/>
<path d="M15 7.29998C9.77 7.29998 5.53 10.67 5.53 14.83C5.53 17.41 7.16 19.68 9.64 21.04L8.96 24.71C8.93 24.89 9.13 25.03 9.28 24.92L13.35 22.24C13.35 22.24 14.44 22.35 15 22.35C20.23 22.35 24.47 18.98 24.47 14.82C24.47 10.66 20.23 7.28998 15 7.28998V7.29998Z" fill="white"/>
<path d="M11.32 12.73H8.59C8.33 12.73 8.13 12.94 8.13 13.2C8.13 13.46 8.34 13.67 8.59 13.67H9.48V16.96C9.48 17.08 9.53 17.2 9.61 17.28C9.69 17.37 9.81 17.41 9.93 17.41H10.03C10.15 17.41 10.27 17.36 10.35 17.28C10.43 17.19 10.48 17.08 10.48 16.96V13.67H11.32C11.58 13.67 11.78 13.46 11.78 13.2C11.78 12.94 11.57 12.73 11.32 12.73Z" fill="#222222"/>
<path d="M17.71 16.53H16.44V13.17C16.44 12.89 16.21 12.66 15.94 12.66C15.67 12.66 15.44 12.89 15.44 13.17V16.96C15.44 17.19 15.63 17.38 15.86 17.38H17.71C17.94 17.38 18.13 17.19 18.13 16.96C18.13 16.73 17.94 16.54 17.71 16.54V16.53Z" fill="#222222"/>
<path d="M21.78 16.69L20.37 14.82L21.65 13.53C21.82 13.36 21.82 13.07 21.65 12.9C21.48 12.73 21.2 12.73 21.02 12.9L19.44 14.49V13.17C19.44 12.89 19.21 12.66 18.94 12.66C18.67 12.66 18.44 12.89 18.44 13.17V16.91C18.44 17.19 18.67 17.42 18.94 17.42C19.21 17.42 19.44 17.19 19.44 16.91V15.76L19.73 15.47L21.07 17.24C21.22 17.44 21.5 17.48 21.7 17.33C21.9 17.18 21.94 16.89 21.79 16.69H21.78Z" fill="#222222"/>
<path d="M15.13 16.81L13.77 13.06C13.68 12.83 13.43 12.66 13.13 12.66C13.06 12.66 12.98 12.66 12.91 12.69C12.84 12.71 12.78 12.74 12.72 12.78C12.66 12.82 12.62 12.86 12.57 12.91C12.54 12.94 12.52 12.98 12.5 13.02C12.48 13.06 12.42 13.25 12.4 13.31L12.38 13.37C12.38 13.37 12.36 13.42 12.35 13.44C12.34 13.47 12.33 13.5 12.32 13.53C12.31 13.56 12.3 13.59 12.28 13.63L12.24 13.74C12.24 13.74 12.21 13.82 12.2 13.85C12.18 13.89 12.17 13.93 12.16 13.97C12.14 14.01 12.13 14.06 12.11 14.1C12.09 14.14 12.08 14.19 12.06 14.23C12.04 14.28 12.03 14.32 12.01 14.37L11.96 14.51C11.96 14.51 11.92 14.61 11.91 14.66L11.85 14.81C11.85 14.81 11.81 14.91 11.79 14.96C11.77 15.01 11.75 15.06 11.73 15.11C11.71 15.16 11.69 15.21 11.67 15.26C11.65 15.31 11.63 15.36 11.61 15.41C11.59 15.46 11.57 15.51 11.56 15.55C11.54 15.6 11.53 15.64 11.51 15.69C11.49 15.74 11.48 15.78 11.46 15.83L11.41 15.96L11.36 16.09C11.36 16.09 11.33 16.17 11.32 16.21C11.31 16.25 11.29 16.28 11.28 16.32C11.27 16.35 11.25 16.39 11.24 16.42L11.21 16.51L11.18 16.59L11.15 16.66L11.13 16.72C11.13 16.72 11.12 16.75 11.11 16.76V16.79L11.09 16.81C11.01 17.05 11.13 17.31 11.37 17.39C11.61 17.47 11.86 17.35 11.95 17.11L12.18 16.45H14.04L14.27 17.11C14.35 17.35 14.61 17.47 14.85 17.39C15.09 17.31 15.21 17.05 15.13 16.81ZM12.48 15.6L13.1 13.8H13.12L13.74 15.6H12.47H12.48Z" fill="#222222"/>
</g>
<defs>
<clipPath id="clip0_1_43">
<rect width="30" height="30" fill="white"/>
</clipPath>
</defs>
</svg>`;

const socialProviders = [
  { id: "naver" },
  { id: "kakao" },
  { id: "apple" },
] as const;

const initialLogin: LoginForm = {
  email: "",
  password: "",
};

const initialSignUp: SignUpForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const agreementItems: Array<{
  key: AgreementKey;
  label: string;
  required: boolean;
}> = [
  {
    key: "calendarTerms",
    label: "(필수) 모아캘린더 약관 및 동의사항",
    required: true,
  },
  {
    key: "serviceTerms",
    label: "(필수) 서비스 이용약관",
    required: true,
  },
  {
    key: "privacyCollection",
    label: "(필수) 개인정보 수집 및 이용",
    required: true,
  },
  {
    key: "thirdPartySharing",
    label: "(필수) 개인정보 제3자 제공 동의",
    required: true,
  },
  {
    key: "marketing",
    label: "(선택) 마케팅 정보 수신 동의",
    required: false,
  },
];

export function AuthScreen() {
  const [stage, setStage] = useState<ScreenStage>("landing");
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginForm, setLoginForm] = useState<LoginForm>(initialLogin);
  const [signUpForm, setSignUpForm] = useState<SignUpForm>(initialSignUp);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [agreements, setAgreements] = useState<Record<AgreementKey, boolean>>({
    calendarTerms: false,
    serviceTerms: false,
    privacyCollection: false,
    thirdPartySharing: false,
    marketing: false,
  });
  const [focusedVerificationIndex, setFocusedVerificationIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [submitted, setSubmitted] = useState("");
  const phoneInputRef = useRef<TextInput | null>(null);
  const nameInputRef = useRef<TextInput | null>(null);
  const verificationInputRefs = useRef<Array<TextInput | null>>([]);

  const headerCopy =
    mode === "login"
      ? {
          eyebrow: "MOA CALENDAR",
          title: "흩어진 일정을\n하나로 모으는 시작",
          description:
            "가족, 팀, 개인 일정을 한 화면에서 정리하고 바로 공유할 수 있게 준비했습니다.",
          cta: "로그인",
          footnote: "아직 계정이 없다면 회원가입 탭에서 바로 시작할 수 있습니다.",
        }
      : {
          eyebrow: "WELCOME TO MOA",
          title: "초대와 공유가 쉬운\n캘린더 계정 만들기",
          description:
            "처음 가입하면 일정 보드, 멤버 초대, 리마인더 설정을 바로 이어서 연결할 수 있습니다.",
          cta: "회원가입",
          footnote: "이후 홈, 일정 생성, 초대 페이지를 같은 토큰으로 확장하면 됩니다.",
        };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStage(nextMode === "login" ? "loginForm" : "signupForm");
    setErrors({});
    setSubmitted("");
  };

  const resetSignUpFlow = () => {
    setSignUpForm(initialSignUp);
    setPhoneNumber("");
    setVerificationRequested(false);
    setVerificationCode(["", "", "", "", "", ""]);
    setAgreements({
      calendarTerms: false,
      serviceTerms: false,
      privacyCollection: false,
      thirdPartySharing: false,
      marketing: false,
    });
    setErrors({});
    setSubmitted("");
  };

  const openForm = (nextMode: AuthMode) => {
    setMode(nextMode);
    if (nextMode === "signup") {
      resetSignUpFlow();
    }
    setStage(nextMode === "login" ? "loginForm" : "signupPhone");
    setErrors({});
    setSubmitted("");
  };

  const handleLoginSubmit = () => {
    const nextErrors = validateLogin(loginForm);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitted("로그인 요청 UI가 준비되었습니다. 다음 단계에서 API만 연결하면 됩니다.");
    } else {
      setSubmitted("");
    }
  };

  const handleSignUpSubmit = () => {
    const nextErrors = validateSignUp(signUpForm);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitted("회원가입 UI가 준비되었습니다. 약관과 인증 플로우를 이어서 연결하면 됩니다.");
    } else {
      setSubmitted("");
    }
  };

  const dismissSignupInputs = () => {
    phoneInputRef.current?.blur();
    nameInputRef.current?.blur();
    verificationInputRefs.current.forEach((input) => input?.blur());
    setPhoneFocused(false);
    setNameFocused(false);
    setFocusedVerificationIndex(null);
    Keyboard.dismiss();
  };

  const allAgreementsSelected = agreementItems.every((item) => agreements[item.key]);
  const requiredAgreementsSelected = agreementItems
    .filter((item) => item.required)
    .every((item) => agreements[item.key]);

  const toggleAllAgreements = () => {
    const nextValue = !allAgreementsSelected;
    setAgreements({
      calendarTerms: nextValue,
      serviceTerms: nextValue,
      privacyCollection: nextValue,
      thirdPartySharing: nextValue,
      marketing: nextValue,
    });
  };

  const toggleAgreement = (key: AgreementKey) => {
    setAgreements((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const openAgreementDetail = (label: string) => {
    dismissSignupInputs();
    Alert.alert(label, "약관 내용이 노출될 예정입니다.");
  };

  const showWarning = (message: string) => {
    dismissSignupInputs();
    Alert.alert("알림", message);
  };

  const handleVerificationNext = () => {
    const joinedVerificationCode = verificationCode.join("");

    if (!verificationRequested || joinedVerificationCode.length !== verificationCode.length) {
      showWarning("인증번호를 입력해주세요.");
      return;
    }

    if (joinedVerificationCode !== "000000") {
      showWarning("인증번호가 일치하지 않습니다.");
      return;
    }

    dismissSignupInputs();
    setStage("signupName");
  };

  const handleSignupNameNext = () => {
    if (!signUpForm.name.trim()) {
      showWarning("이름을 입력해주세요.");
      return;
    }

    dismissSignupInputs();
    setStage("signupTerms");
  };

  const handleSignupTermsNext = () => {
    if (!requiredAgreementsSelected) {
      showWarning("필수 약관에 동의해주세요.");
      return;
    }

    dismissSignupInputs();
    setMode("signup");
    setStage("signupComplete");
  };

  const updateVerificationDigit = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(-1);
    setVerificationCode((current) => {
      const next = [...current];
      next[index] = numericValue;
      return next;
    });
  };

  const clearVerificationDigit = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (event.nativeEvent.key !== "Backspace") {
      return;
    }

    setVerificationCode((current) => {
      if (current[index]) {
        return current;
      }

      const next = [...current];
      if (index > 0) {
        next[index - 1] = "";
      }
      return next;
    });
  };

  if (stage === "landing") {
    return (
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={landingStyles.safeArea}>
        <StatusBar style="dark" />
        <View style={landingStyles.container}>
          <View style={landingStyles.illustrationArea}>
            <Image
              resizeMode="contain"
              source={loginHero}
              style={landingStyles.heroImage}
            />
          </View>

          <View style={landingStyles.bottomSheet}>
            <Pressable onPress={() => openForm("login")}>
              <LinearGradient
                colors={["#6C4CF4", "#7C54F6"]}
                end={{ x: 1, y: 0.5 }}
                start={{ x: 0, y: 0.5 }}
                style={landingStyles.loginButton}
              >
                <Text style={landingStyles.loginButtonText}>로그인</Text>
              </LinearGradient>
            </Pressable>

            <Text style={landingStyles.altLabel}>다른방법으로 로그인</Text>

            <View style={landingStyles.socialRow}>
              {socialProviders.map((provider) => (
                <Pressable
                  key={provider.id}
                  onPress={() => openForm("login")}
                  style={landingStyles.socialButton}
                >
                  {provider.id === "naver" ? (
                    <SvgXml height={30} width={30} xml={naverIconXml} />
                  ) : provider.id === "kakao" ? (
                    <SvgXml height={30} width={30} xml={kakaoIconXml} />
                  ) : (
                    <Image source={appleIcon} style={landingStyles.appleIcon} />
                  )}
                </Pressable>
              ))}
            </View>

            <Pressable onPress={() => openForm("signup")}>
              <Text style={landingStyles.signupLink}>회원가입 하기</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (stage === "mainHome") {
    return <MainHomeScreen />;
  }

  if (stage === "signupPhone") {
    return (
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={signupStyles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={signupStyles.keyboard}
        >
          <View style={signupStyles.container}>
            <Pressable onPress={dismissSignupInputs} style={signupStyles.dismissLayer} />
            <View pointerEvents="box-none" style={signupStyles.contentLayer}>
              <View style={signupStyles.header}>
                <Pressable
                  onPress={() => {
                    dismissSignupInputs();
                    setStage("landing");
                  }}
                  style={signupStyles.backButton}
                >
                  <Text style={signupStyles.backArrow}>‹</Text>
                </Pressable>
              </View>

              <View style={signupStyles.centerContent}>
                <View style={signupStyles.copyBlock}>
                  <Text style={signupStyles.title}>휴대폰 번호로 가입해주세요.</Text>
                  <Text style={signupStyles.description}>
                    입력한 휴대폰 번호로 로그인 할 수 있습니다.
                  </Text>
                </View>

                <View style={signupStyles.progressRow}>
                  <View style={[signupStyles.progressBar, signupStyles.progressBarActive]} />
                  <View style={signupStyles.progressBar} />
                  <View style={signupStyles.progressBar} />
                </View>

                <View style={signupStyles.fieldGroup}>
                  <TextInput
                    caretHidden
                    keyboardType="number-pad"
                    maxLength={11}
                    selectTextOnFocus
                    onBlur={() => setPhoneFocused(false)}
                    onChangeText={(value) => setPhoneNumber(value.replace(/[^0-9]/g, ""))}
                    onFocus={() => {
                      verificationInputRefs.current.forEach((input) => input?.blur());
                      setPhoneFocused(true);
                      setFocusedVerificationIndex(null);
                    }}
                    placeholder="휴대폰 번호 (-없이 숫자만 입력)"
                    placeholderTextColor={phoneFocused ? "transparent" : "#A6ABB8"}
                    ref={phoneInputRef}
                    style={[
                      signupStyles.phoneInput,
                      phoneFocused && signupStyles.inputFocused,
                    ]}
                    textAlign="center"
                    value={phoneNumber}
                  />

                  <Pressable
                    onPress={() => {
                      dismissSignupInputs();
                      setVerificationRequested(true);
                    }}
                    style={signupStyles.outlineButton}
                  >
                    <Text style={signupStyles.outlineButtonText}>인증문자 받기</Text>
                  </Pressable>

                  {verificationRequested ? (
                    <View style={signupStyles.verificationRow}>
                      {verificationCode.map((digit, index) => (
                        <TextInput
                          key={`verification-${index}`}
                          caretHidden
                          keyboardType="number-pad"
                          selectTextOnFocus
                          maxLength={1}
                          onBlur={() =>
                            setFocusedVerificationIndex((current) =>
                              current === index ? null : current,
                            )
                          }
                          onChangeText={(value) => updateVerificationDigit(index, value)}
                          onFocus={() => {
                            phoneInputRef.current?.blur();
                            setPhoneFocused(false);
                            setFocusedVerificationIndex(index);
                          }}
                          onKeyPress={(event) => clearVerificationDigit(index, event)}
                          placeholder="0"
                          placeholderTextColor={focusedVerificationIndex === index ? "transparent" : "#A6ABB8"}
                          ref={(input) => {
                            verificationInputRefs.current[index] = input;
                          }}
                          style={[
                            signupStyles.verificationInput,
                            focusedVerificationIndex === index && signupStyles.inputFocused,
                          ]}
                          textAlign="center"
                          value={digit}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>

              <Pressable
                onPress={handleVerificationNext}
              >
                <LinearGradient
                  colors={["#6C4CF4", "#7C54F6"]}
                  end={{ x: 1, y: 0.5 }}
                  start={{ x: 0, y: 0.5 }}
                  style={signupStyles.nextButton}
                >
                  <Text style={signupStyles.nextButtonText}>다음</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (stage === "signupName") {
    return (
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={signupStyles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={signupStyles.keyboard}
        >
          <View style={signupStyles.container}>
            <Pressable onPress={dismissSignupInputs} style={signupStyles.dismissLayer} />
            <View pointerEvents="box-none" style={signupStyles.contentLayer}>
              <View style={signupStyles.header}>
                <Pressable
                  onPress={() => {
                    dismissSignupInputs();
                    setStage("signupPhone");
                  }}
                  style={signupStyles.backButton}
                >
                  <Text style={signupStyles.backArrow}>‹</Text>
                </Pressable>
              </View>

              <View style={signupStyles.centerContent}>
                <View style={signupStyles.copyBlock}>
                  <Text style={signupStyles.title}>이름을 입력해주세요.</Text>
                  <Text style={signupStyles.description}>본명을 입력해 주세요.</Text>
                </View>

                <View style={signupStyles.progressRow}>
                  <View style={signupStyles.progressBar} />
                  <View style={[signupStyles.progressBar, signupStyles.progressBarActive]} />
                  <View style={signupStyles.progressBar} />
                </View>

                <View style={signupStyles.fieldGroup}>
                  <TextInput
                    autoCapitalize="words"
                    caretHidden
                    onBlur={() => setNameFocused(false)}
                    selectTextOnFocus
                    onChangeText={(name) =>
                      setSignUpForm((current) => ({
                        ...current,
                        name,
                      }))
                    }
                    onFocus={() => setNameFocused(true)}
                    placeholder="이름 입력"
                    placeholderTextColor={nameFocused ? "transparent" : "#A6ABB8"}
                    ref={nameInputRef}
                    style={[
                      signupStyles.phoneInput,
                      nameFocused && signupStyles.inputFocused,
                    ]}
                    textAlign="center"
                    value={signUpForm.name}
                  />
                </View>
              </View>

              <Pressable onPress={handleSignupNameNext}>
                <LinearGradient
                  colors={["#6C4CF4", "#7C54F6"]}
                  end={{ x: 1, y: 0.5 }}
                  start={{ x: 0, y: 0.5 }}
                  style={signupStyles.nextButton}
                >
                  <Text style={signupStyles.nextButtonText}>다음</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (stage === "signupTerms") {
    return (
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={signupStyles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={signupStyles.keyboard}
        >
          <View style={signupStyles.container}>
            <Pressable onPress={dismissSignupInputs} style={signupStyles.dismissLayer} />
            <View pointerEvents="box-none" style={signupStyles.contentLayer}>
              <View style={signupStyles.header}>
                <Pressable
                  onPress={() => {
                    dismissSignupInputs();
                    setStage("signupName");
                  }}
                  style={signupStyles.backButton}
                >
                  <Text style={signupStyles.backArrow}>‹</Text>
                </Pressable>
              </View>

              <View style={signupStyles.centerContent}>
                <View style={signupStyles.termsCopyBlock}>
                  <Text style={signupStyles.termsTitle}>마지막 단계에요.</Text>
                  <Text style={signupStyles.termsTitle}>약관 확인 후 동의 해주세요.</Text>
                </View>

                <View style={signupStyles.progressRow}>
                  <View style={signupStyles.progressBar} />
                  <View style={signupStyles.progressBar} />
                  <View style={[signupStyles.progressBar, signupStyles.progressBarActive]} />
                </View>

                <View style={signupStyles.termsSection}>
                  <Pressable onPress={toggleAllAgreements} style={signupStyles.allAgreeCard}>
                    <View style={signupStyles.allAgreeIconWrap}>
                      <SvgXml
                        height={24}
                        width={24}
                        xml={allAgreementsSelected ? allAgreeCheckOnXml : allAgreeCheckOffXml}
                      />
                    </View>
                    <Text
                      style={[
                        signupStyles.allAgreeText,
                        allAgreementsSelected && signupStyles.allAgreeTextActive,
                      ]}
                    >
                      전체 동의하기
                    </Text>
                  </Pressable>

                  <View style={signupStyles.termsDivider} />

                  <View style={signupStyles.agreementList}>
                    {agreementItems.map((item) => {
                      const checked = agreements[item.key];

                      return (
                        <View key={item.key} style={signupStyles.agreementItem}>
                          <Pressable
                            onPress={() => toggleAgreement(item.key)}
                            style={signupStyles.agreementIconButton}
                          >
                            <SvgXml
                              height={checked ? 14 : 12}
                              width={checked ? 19 : 17}
                              xml={checked ? agreementCheckOnXml : agreementCheckOffXml}
                            />
                          </Pressable>

                          <Pressable
                            onPress={() => openAgreementDetail(item.label)}
                            style={signupStyles.agreementLabelButton}
                          >
                            <Text
                              style={[
                                signupStyles.agreementLabel,
                                checked
                                  ? signupStyles.agreementLabelChecked
                                  : signupStyles.agreementLabelMuted,
                              ]}
                            >
                              {item.label}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              <Pressable onPress={handleSignupTermsNext}>
                <LinearGradient
                  colors={["#6C4CF4", "#7C54F6"]}
                  end={{ x: 1, y: 0.5 }}
                  start={{ x: 0, y: 0.5 }}
                  style={signupStyles.nextButton}
                >
                  <Text style={signupStyles.nextButtonText}>다음</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (stage === "signupComplete") {
    return (
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={completionStyles.safeArea}>
        <StatusBar style="dark" />
        <View style={completionStyles.container}>
          <ConfettiBurst />
          <View style={completionStyles.headerSpacer} />

          <View style={completionStyles.centerContent}>
            <View style={completionStyles.illustrationWrap}>
              <Image
                resizeMode="contain"
                source={signupCompleteHero}
                style={completionStyles.illustrationImage}
              />
            </View>

            <View style={completionStyles.copyBlock}>
              <Text style={completionStyles.completeTitle}>가입 완료!</Text>
              <Text style={completionStyles.completeDescription}>
                앞으로 모아캘린더에서{"\n"}모든 일정을 관리해보세요!
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              resetSignUpFlow();
              setStage("mainHome");
            }}
          >
            <LinearGradient
              colors={["#6C4CF4", "#7C54F6"]}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              style={completionStyles.nextButton}
            >
              <Text style={completionStyles.nextButtonText}>다음</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={[colors.backdropTop, colors.backdropBottom]}
      end={{ x: 0.85, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={formStyles.gradient}
    >
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "left", "right"]} style={formStyles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={formStyles.keyboard}
        >
          <ScrollView
            bounces={false}
            contentContainerStyle={formStyles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={formStyles.heroPanel}>
              <Pressable
                onPress={() => setStage(mode === "signup" ? "signupTerms" : "landing")}
                style={formStyles.backLink}
              >
                <Text style={formStyles.backLinkText}>이전</Text>
              </Pressable>
              <AuthModeSwitch mode={mode} onChange={switchMode} />

              <View style={formStyles.heroCopy}>
                <Text style={formStyles.eyebrow}>{headerCopy.eyebrow}</Text>
                <Text style={formStyles.title}>{headerCopy.title}</Text>
                <Text style={formStyles.description}>{headerCopy.description}</Text>
              </View>
            </View>

            <View style={formStyles.card}>
              <View style={formStyles.cardHeader}>
                <Text style={formStyles.cardTitle}>
                  {mode === "login" ? "다시 만나서 반가워요" : "새 계정을 만들어볼까요?"}
                </Text>
                <Text style={formStyles.cardDescription}>{headerCopy.footnote}</Text>
              </View>

              {mode === "login" ? (
                <View style={formStyles.form}>
                  <AuthInput
                    error={errors.email}
                    keyboardType="email-address"
                    label="이메일"
                    onChangeText={(email) => setLoginForm((current) => ({ ...current, email }))}
                    placeholder="moa@example.com"
                    value={loginForm.email}
                  />
                  <AuthInput
                    error={errors.password}
                    helper="8자 이상 입력해 주세요."
                    label="비밀번호"
                    onChangeText={(password) =>
                      setLoginForm((current) => ({ ...current, password }))
                    }
                    placeholder="비밀번호 입력"
                    secureTextEntry
                    value={loginForm.password}
                  />
                  <Pressable onPress={handleLoginSubmit} style={formStyles.primaryButton}>
                    <Text style={formStyles.primaryButtonText}>{headerCopy.cta}</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={formStyles.form}>
                  <AuthInput
                    autoCapitalize="words"
                    error={errors.name}
                    label="이름"
                    onChangeText={(name) => setSignUpForm((current) => ({ ...current, name }))}
                    placeholder="홍길동"
                    value={signUpForm.name}
                  />
                  <AuthInput
                    error={errors.email}
                    keyboardType="email-address"
                    label="이메일"
                    onChangeText={(email) => setSignUpForm((current) => ({ ...current, email }))}
                    placeholder="moa@example.com"
                    value={signUpForm.email}
                  />
                  <AuthInput
                    error={errors.password}
                    helper="영문, 숫자 포함 8자 이상을 권장합니다."
                    label="비밀번호"
                    onChangeText={(password) =>
                      setSignUpForm((current) => ({ ...current, password }))
                    }
                    placeholder="비밀번호 입력"
                    secureTextEntry
                    value={signUpForm.password}
                  />
                  <AuthInput
                    error={errors.confirmPassword}
                    label="비밀번호 확인"
                    onChangeText={(confirmPassword) =>
                      setSignUpForm((current) => ({ ...current, confirmPassword }))
                    }
                    placeholder="비밀번호 다시 입력"
                    secureTextEntry
                    value={signUpForm.confirmPassword}
                  />
                  <Pressable onPress={handleSignUpSubmit} style={formStyles.primaryButton}>
                    <Text style={formStyles.primaryButtonText}>{headerCopy.cta}</Text>
                  </Pressable>
                </View>
              )}

              {submitted ? (
                <View style={formStyles.notice}>
                  <Text style={formStyles.noticeText}>{submitted}</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const landingStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F4F5FB",
    flex: 1,
  },
  container: {
    backgroundColor: "#F4F5FB",
    flex: 1,
    justifyContent: "space-between",
  },
  illustrationArea: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingTop: 24,
  },
  heroImage: {
    height: 340,
    maxWidth: 532,
    width: "100%",
  },
  bottomSheet: {
    alignItems: "center",
    paddingBottom: 36,
    paddingHorizontal: 45,
    paddingTop: 20,
  },
  loginButton: {
    alignItems: "center",
    borderRadius: 100,
    height: 60,
    justifyContent: "center",
    width: 340,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.36,
  },
  altLabel: {
    color: "#A6ABB8",
    fontSize: 12,
    marginTop: 20,
  },
  socialRow: {
    flexDirection: "row",
    gap: 30,
    marginTop: 20,
  },
  socialButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  appleIcon: {
    height: 30,
    resizeMode: "contain",
    width: 30,
  },
  signupLink: {
    color: "#7550F5",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 22,
  },
});

const signupStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F6F7FB",
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    backgroundColor: "#F6F7FB",
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 60,
    paddingHorizontal: 45,
  },
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  contentLayer: {
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    height: 60,
    justifyContent: "center",
  },
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginLeft: -24,
    width: 44,
  },
  backArrow: {
    color: "#222222",
    fontSize: 38,
    fontWeight: "400",
    lineHeight: 38,
  },
  centerContent: {
    alignItems: "center",
    flex: 1,
    gap: 30,
    justifyContent: "center",
    width: "100%",
  },
  copyBlock: {
    alignItems: "center",
    gap: 15,
  },
  termsCopyBlock: {
    alignItems: "center",
    gap: 2,
  },
  title: {
    color: "#222222",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.44,
    lineHeight: 27,
  },
  description: {
    color: "#A6ABB8",
    fontSize: 16,
    letterSpacing: -0.32,
    lineHeight: 20,
  },
  termsTitle: {
    color: "#222222",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.44,
    lineHeight: 29,
    textAlign: "center",
  },
  progressRow: {
    flexDirection: "row",
    gap: 10,
  },
  progressBar: {
    backgroundColor: "rgba(34,34,34,0.05)",
    borderRadius: 100,
    height: 4,
    width: 30,
  },
  progressBarActive: {
    backgroundColor: "#7550F5",
  },
  fieldGroup: {
    gap: 20,
    width: "100%",
  },
  termsSection: {
    gap: 20,
    width: "100%",
  },
  allAgreeCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(34,34,34,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    height: 60,
    maxWidth: 340,
    paddingHorizontal: 15,
    width: "100%",
  },
  allAgreeIconWrap: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  allAgreeText: {
    color: "#A6ABB8",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.28,
  },
  allAgreeTextActive: {
    color: "#7550F5",
  },
  termsDivider: {
    backgroundColor: "rgba(34,34,34,0.08)",
    height: 1,
    width: "100%",
  },
  agreementList: {
    gap: 10,
  },
  agreementItem: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    height: 50,
    maxWidth: 340,
    paddingHorizontal: 15,
    width: "100%",
  },
  agreementIconButton: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  agreementLabelButton: {
    flex: 1,
    justifyContent: "center",
  },
  agreementLabel: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },
  agreementLabelChecked: {
    color: "#222222",
  },
  agreementLabelMuted: {
    color: "#A6ABB8",
  },
  phoneInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(34,34,34,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    color: "#222222",
    fontSize: 14,
    height: 60,
    maxWidth: 340,
    paddingHorizontal: 20,
    width: "100%",
  },
  outlineButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#7550F5",
    borderRadius: 1000,
    borderWidth: 2,
    height: 60,
    justifyContent: "center",
    maxWidth: 340,
    width: "100%",
  },
  outlineButtonText: {
    color: "#7550F5",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.28,
  },
  verificationRow: {
    alignSelf: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    width: 300,
  },
  inputFocused: {
    borderColor: "#7550F5",
    borderWidth: 2,
  },
  verificationInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(34,34,34,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    color: "#222222",
    flex: 1,
    fontSize: 14,
    height: 60,
    paddingHorizontal: 0,
  },
  nextButton: {
    alignItems: "center",
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
    maxWidth: 340,
    width: "100%",
  },
  nextButtonText: {
    color: "#F6F7FB",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.32,
  },
});

const completionStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F5F6FB",
    flex: 1,
  },
  container: {
    backgroundColor: "#F5F6FB",
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 60,
    paddingHorizontal: 45,
  },
  headerSpacer: {
    height: 60,
  },
  centerContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  illustrationWrap: {
    alignItems: "center",
    height: 220,
    justifyContent: "center",
    marginBottom: 48,
    overflow: "visible",
    position: "relative",
    width: 320,
  },
  illustrationImage: {
    height: 190,
    width: "100%",
  },
  copyBlock: {
    alignItems: "center",
    gap: 15,
  },
  completeTitle: {
    color: "#7550F5",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.48,
  },
  completeDescription: {
    color: "#A6ABB8",
    fontSize: 18,
    letterSpacing: -0.36,
    lineHeight: 27,
    textAlign: "center",
  },
  nextButton: {
    alignItems: "center",
    borderRadius: 10,
    height: 60,
    justifyContent: "center",
    maxWidth: 340,
    width: "100%",
  },
  nextButtonText: {
    color: "#F6F7FB",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.32,
  },
});

const formStyles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.xl,
  },
  heroPanel: {
    gap: spacing.lg,
  },
  backLink: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backLinkText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  heroCopy: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  title: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1.1,
    lineHeight: 40,
  },
  description: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 360,
  },
  card: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  cardHeader: {
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  cardDescription: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  form: {
    gap: spacing.md,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#7550F5",
    borderRadius: radius.md,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  notice: {
    backgroundColor: "rgba(44, 140, 107, 0.12)",
    borderColor: "rgba(44, 140, 107, 0.24)",
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  noticeText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
  },
});
