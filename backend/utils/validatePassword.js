const validatePassword = (password) => {
  const errors = [];

  // Length check
  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (password.length > 128) {
    errors.push("Mật khẩu không được quá 128 ký tự");
  }

  // Complexity checks
  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ thường");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ hoa");
  }

  if (!/\d/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 số");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");
  }

  // Common password check
  const commonPasswords = [
    "password",
    "123456",
    "password123",
    "admin",
    "qwerty",
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Mật khẩu quá phổ biến, vui lòng chọn mật khẩu khác");
  }

  return errors;
}

module.exports = validatePassword;
