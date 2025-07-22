const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const validatePassword = require("../utils/validatePassword");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  // Kiểm tra thiếu trường
  if (!email || !password || !username) {
    return res.status(400).json({ message: '❌ Thiếu thông tin đăng ký' });
  }

  try {
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '❌ Email đã tồn tại' });
    }

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: '✅ Đăng ký thành công',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error('Đăng ký thất bại:', error);
    return res.status(500).json({ message: '❌ Lỗi hệ thống', error: error.message });
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
  const { tokenId } = req.body; // Token ID từ client (lấy từ Google Auth)

  try {
    // Kiểm tra và verify token với Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: 'YOUR_GOOGLE_CLIENT_ID', // Thay bằng Client ID của bạn
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // Kiểm tra xem người dùng đã có chưa
    let user = await User.findOne({ email });
    if (!user) {
      // Nếu không có, tạo tài khoản mới
      user = new User({
        username: payload.name,
        email: payload.email,
        password: '', // Không cần mật khẩu
      });
      await user.save();
    }

    // Tạo JWT token và trả về
    const token = jwt.sign({ userId: user._id }, 'your-jwt-secret', { expiresIn: '1h' });

    return res.status(200).json({
      message: '✅ Đăng nhập bằng Google thành công',
      token,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '❌ Lỗi hệ thống', error: err.message });
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
