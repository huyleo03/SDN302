const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const validatePassword = require("../utils/validatePassword");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // 👈 dùng biến môi trường

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, avatarUrl } = req.body;

    const normalizedEmail = validator.normalizeEmail(email);

    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: normalizedEmail }],
    });

    if (existingUser) {
      const field =
        existingUser.email === normalizedEmail ? "email" : "username";
      return res.status(400).json({
        error: `${field === "email" ? "Email" : "Username"} đã được sử dụng`,
        code: "USER_ALREADY_EXISTS",
        field: field,
      });
    }

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Username, email và password là bắt buộc",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        error:
          "Tên người dùng phải từ 3 đến 20 ký tự và chỉ chứa chữ cái, số và dấu gạch dưới",
        code: "INVALID_USERNAME",
      });
    }

    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Email không hợp lệ",
        code: "INVALID_EMAIL_FORMAT",
      });
    }

    // Password validation
    console.log("🔒 Kiểm tra mật khẩu...");
    const passwordErrors = validatePassword(password);
    console.log("🔒 Kết quả kiểm tra mật khẩu:", passwordErrors);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Mật khẩu không đáp ứng yêu cầu bảo mật",
        details: passwordErrors,
        code: "WEAK_PASSWORD",
      });
    }

    // Hash password
    console.log("🔐 Bắt đầu hash mật khẩu...");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("🔐 Hash mật khẩu thành công");

    // Create new user
    console.log("👤 Tạo user mới...");
    const newUser = new User({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "user",
      avatarUrl: avatarUrl || undefined,
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      error: "Lỗi server khi đăng ký người dùng",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và mật khẩu là bắt buộc",
        code: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRATION}, 
    );

    // Remove password from user object
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user : {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Error logging in user",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

const loginGoogle = async (req, res) => {
  const { tokenId } = req.body;

  if (!tokenId) {
    return res.status(400).json({ message: '❌ Thiếu Google tokenId' });
  }

  try {
    // ✅ Xác thực token Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // ✅ Tìm hoặc tạo người dùng
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: name,        // ✅ Gán username từ tên Google
        email,
        password: '',          // Google login không dùng mật khẩu
        avatar: picture || '', // Nếu có avatar thì lưu
      });
      await user.save();
    }

    // ✅ Tạo JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username, // ✅ Include username trong token nếu cần
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Trả về response gồm token và username
    return res.status(200).json({
      message: '✅ Đăng nhập Google thành công',
      token,
      user: {
        id: user._id,
        username: user.username, // 👈 Tên người dùng Google
        email: user.email,
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    console.error('❌ Google login error:', err);
    return res.status(401).json({
      message: '❌ Xác thực Google thất bại',
      error: err.message,
    });
  }
};


// router.get('/me', async (req, res) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Token không được cung cấp'
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'Người dùng không tồn tại'
//       });
//     }

//     res.json({
//       success: true,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         phone: user.phone,
//         address: user.address
//       }
//     });

//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(401).json({
//       success: false,
//       message: 'Token không hợp lệ'
//     });
//   }
// });
module.exports = {
  registerUser,
  login, 
  loginGoogle
};
