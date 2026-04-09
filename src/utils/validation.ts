export type AuthErrors = Record<string, string>;

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function validateLogin(values: { email: string; password: string }): AuthErrors {
  const errors: AuthErrors = {};

  if (!values.email.trim()) {
    errors.email = "이메일을 입력해 주세요.";
  } else if (!isEmail(values.email)) {
    errors.email = "이메일 형식을 확인해 주세요.";
  }

  if (!values.password.trim()) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (values.password.trim().length < 8) {
    errors.password = "비밀번호는 8자 이상이어야 합니다.";
  }

  return errors;
}

export function validateSignUp(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): AuthErrors {
  const errors = validateLogin(values);

  if (!values.name.trim()) {
    errors.name = "이름을 입력해 주세요.";
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = "비밀번호를 다시 입력해 주세요.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
  }

  return errors;
}
