import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
  ProgressBar
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { useFormik } from 'formik';
import * as Yup from 'yup';

/** *******************************************************************
 *  Register Component (Refactored for new User schema)
 *
 *  Backend model:
 *  {
 *    username: String! (unique)
 *    email:    String! (unique)
 *    password: String!
 *    role:     'user' | 'seller' | 'admin' (default 'user')
 *    avatarUrl: String (default Unsplash URL)
 *    isVerified: Boolean (default false) <-- handled server side
 *    verificationToken: String <-- server generated & emailed
 *    action: 'lock' | 'unlock' (default 'lock') <-- mgmt/admin, not user input
 *  }
 *
 *  UI changes vs. previous version:
 *  - Removed phone & address (no longer in schema).
 *  - Added Role selector (user/seller). Admin creation typically via backoffice.
 *  - Added Avatar URL input (optional). If left blank, backend default applies.
 *  - Adjusted API payloads accordingly.
 *  - GoogleLogin now maps -> { email, username:name, avatarUrl:picture }.
 *  - Validation updated to match new fields.
 *  - Vietnamese copy retained.
 *
 *  NOTE: Ensure backend endpoints accept the new payload shapes.
 *        See REGISTER_API /auth/register and GOOGLE_LOGIN_API /auth/google-login
 *        for expected request bodies (update server if needed!).
 *********************************************************************/

// API Endpoint Constants
const API_BASE_URL = 'http://localhost:9999';
const REGISTER_API = '/api/auth/register';
const VERIFY_CODE_API = '/api/auth/verify-code';
const RESEND_VERIFICATION_API = '/api/auth/resend-verification';
const GOOGLE_LOGIN_API = '/api/auth/google-login';

// Optional: restrict roles user can pick at self-serve sign-up
// (exclude 'admin' so random users can't create admin accounts)

const SELF_REGISTER_ROLES = [
  { value: 'user', label: 'Người mua (User)' },
  { value: 'seller', label: 'Người bán (Seller)' },
  // { value: 'admin', label: 'Quản trị (Admin)' }, // Uncomment ONLY if allowed
];

const DEFAULT_AVATAR_PLACEHOLDER = '';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerification, setIsVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  /** Send verification email via EmailJS */
  const sendVerificationEmail = useCallback(async (email, verificationCode) => {
    try {
      await emailjs.send(
        'service_nrr3tw2',
        'template_abotd4t',
        {
          to: email,
          subject: 'Mã xác minh tài khoản',
          message: verificationCode,
        },
        'OEj4kkgxdJXtWCV0_'
      );
      return true;
    } catch (err) {
      console.error('Failed to send verification email:', err);
      return false;
    }
  }, []);

  /** Check URL params (?verified=true) if user returned from email link flow */
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('verified') === 'true') {
      setSuccess('Email xác minh thành công! Vui lòng đăng nhập.');
      setIsVerification(false);
    }
  }, [location]);

  /** Build validation schema dynamically by mode */
  const validationSchema = Yup.object().shape(
    isVerification
      ? {
          verificationCode: Yup.string()
            .matches(/^[0-9]{6}$/u, 'Mã xác minh phải là 6 chữ số.')
            .required('Nhập mã xác minh.'),
          // email still required in state to send token to server
          email: Yup.string().email('Email không hợp lệ.').required('Email là bắt buộc.'),
        }
      : {
          username: Yup.string()
            .required('Nhập tên người dùng.')
            .test('no-space', 'Tên người dùng không được chứa khoảng trắng.', (val) => !/\s/.test(val || ''))
            .min(3, 'Tên người dùng phải có ít nhất 3 ký tự.'),
          email: Yup.string()
            .email('Email không hợp lệ.')
            .required('Nhập email.'),
          password: Yup.string()
            .required('Nhập mật khẩu.')
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
          confirmPassword: Yup.string()
            .required('Nhập lại mật khẩu.')
            .oneOf([Yup.ref('password'), null], 'Mật khẩu xác nhận không khớp.'),
          role: Yup.mixed()
            .oneOf(SELF_REGISTER_ROLES.map((r) => r.value), 'Vai trò không hợp lệ.')
            .required('Chọn vai trò.'),
          avatarUrl: Yup.string()
            .url('URL ảnh đại diện không hợp lệ.')
            .nullable()
            .optional(),
        }
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      avatarUrl: DEFAULT_AVATAR_PLACEHOLDER,
      verificationCode: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      setLoading(true);

      try {
        if (isVerification) {
          // verify code
          const res = await api.post(VERIFY_CODE_API, {
            email: values.email.toLowerCase().trim(),
            verificationToken: values.verificationCode,
          });
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          navigate(user.role === 'admin' ? '/adminDashboard' : '/profile');
        } else {
          // register new account (payload matches new schema)
          const payload = {
            username: values.username,
            email: values.email.toLowerCase().trim(),
            password: values.password,
            role: values.role, // allow user/seller
            avatarUrl: values.avatarUrl?.trim() || undefined, // let backend use default if empty
          };
          const res = await api.post(REGISTER_API, payload);
          const { verificationToken } = res.data; // assume backend returns token
          const sent = await sendVerificationEmail(values.email, verificationToken);
          if (!sent) throw new Error('Không thể gửi email xác minh.');
          setSuccess('Đăng ký thành công! Kiểm tra email để lấy mã.');
          setIsVerification(true);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Có lỗi xảy ra.');
      } finally {
        setLoading(false);
      }
    },
  });

  /** resend verification */
  const handleResendVerification = async () => {
    if (!formik.values.email) {
      setError('Vui lòng nhập email để gửi lại mã xác minh.');
      return;
    }
    setResendLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post(RESEND_VERIFICATION_API, {
        email: formik.values.email.toLowerCase().trim(),
      });
      const { verificationToken } = res.data;
      const sent = await sendVerificationEmail(formik.values.email, verificationToken);
      if (sent) setSuccess('Mã xác minh đã được gửi lại.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Gửi lại mã thất bại.');
    } finally {
      setResendLoading(false);
    }
  };

  /** simple password strength meter */
  const getPasswordStrength = () => {
    const password = formik.values.password;
    if (!password) return { strength: 0, text: '', variant: 'secondary' };

    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;

    if (score <= 25) return { strength: score, text: 'Yếu', variant: 'danger' };
    if (score <= 50) return { strength: score, text: 'Trung bình', variant: 'warning' };
    if (score <= 75) return { strength: score, text: 'Khá', variant: 'info' };
    return { strength: score, text: 'Mạnh', variant: 'success' };
  };
  const passwordStrength = getPasswordStrength();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <a href="/">
                  <img src="/images/logo.svg" alt="Logo" width="170" className="mb-3" />
                </a>
                <h2 className="fw-bold text-primary mb-2">
                  <i className="bi bi-person-plus me-2"></i>
                  Đăng ký tài khoản
                </h2>
                <p className="text-muted">Tạo tài khoản mới để bắt đầu mua sắm</p>
              </div>

              {/* Alert Messages */}
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="mb-4">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </Alert>
              )}

              {/* Register / Verify Form */}
              <Form onSubmit={formik.handleSubmit}>
                {isVerification ? (
                  <>
                    {/* EMAIL (locked) so server knows who to verify */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="bi bi-envelope me-2"></i>
                        Email *
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        placeholder="Nhập email"
                        disabled={true}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="bi bi-key me-2"></i>
                        Mã xác minh *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="verificationCode"
                        maxLength="6"
                        value={formik.values.verificationCode}
                        onChange={formik.handleChange}
                        placeholder="Nhập mã xác minh (6 số)"
                        disabled={loading}
                        isInvalid={formik.touched.verificationCode && !!formik.errors.verificationCode}
                      />
                      {formik.touched.verificationCode && formik.errors.verificationCode && (
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.verificationCode}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <div className="d-grid gap-2 mb-3">
                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="fw-semibold"
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Đang xác minh...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Xác minh
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="d-grid gap-2">
                      <Button
                        variant="outline-secondary"
                        disabled={resendLoading}
                        onClick={handleResendVerification}
                        className="fw-semibold"
                      >
                        {resendLoading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Đang gửi lại...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-arrow-repeat me-2"></i>
                            Gửi lại mã
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <i className="bi bi-person me-2"></i>
                            Tên người dùng *
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            placeholder="Nhập tên người dùng"
                            disabled={loading}
                            isInvalid={formik.touched.username && !!formik.errors.username}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formik.errors.username}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <i className="bi bi-envelope me-2"></i>
                            Email *
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            placeholder="Nhập email"
                            disabled={loading}
                            isInvalid={formik.touched.email && !!formik.errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formik.errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    

                    {/* Avatar URL */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="bi bi-image me-2"></i>
                        Ảnh đại diện (URL)
                      </Form.Label>
                      <Form.Control
                        type="url"
                        name="avatarUrl"
                        value={formik.values.avatarUrl}
                        onChange={formik.handleChange}
                        placeholder="Dán link ảnh hoặc để trống dùng mặc định"
                        disabled={loading}
                        isInvalid={formik.touched.avatarUrl && !!formik.errors.avatarUrl}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.avatarUrl}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Password */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="bi bi-lock me-2"></i>
                        Mật khẩu *
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                          disabled={loading}
                          isInvalid={formik.touched.password && !!formik.errors.password}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          type="button"
                        >
                          <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.password}
                        </Form.Control.Feedback>
                      </InputGroup>
                      {formik.values.password && (
                        <div className="mt-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Độ mạnh mật khẩu:</small>
                            <small className={`text-${passwordStrength.variant}`}>
                              {passwordStrength.text}
                            </small>
                          </div>
                          <ProgressBar
                            variant={passwordStrength.variant}
                            now={passwordStrength.strength}
                            style={{ height: '4px' }}
                          />
                        </div>
                      )}
                    </Form.Group>

                    {/* Confirm Password */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="bi bi-lock-fill me-2"></i>
                        Xác nhận mật khẩu *
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          placeholder="Nhập lại mật khẩu"
                          disabled={loading}
                          isInvalid={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                          type="button"
                        >
                          <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.confirmPassword}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>

                    {/* Role selector */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="bi bi-person-badge me-2"></i>
                        Vai trò *
                      </Form.Label>
                      <Form.Select
                        name="role"
                        value={formik.values.role}
                        onChange={formik.handleChange}
                        disabled={loading}
                        isInvalid={formik.touched.role && !!formik.errors.role}
                      >
                        {SELF_REGISTER_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.role}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid gap-2 mb-3">
                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="fw-semibold"
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Đang đăng ký...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus me-2"></i>
                            Đăng ký
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Google Sign-In */}
                    <GoogleOAuthProvider clientId="332875983693-h8d4d5h7aip186nfa1f7sccvln79h053.apps.googleusercontent.com">
                      <GoogleLogin
                        onSuccess={async (res) => {
                          try {
                            const decoded = jwtDecode(res.credential);
                            // decoded fields vary; common keys: email, name, picture, given_name, family_name
                            const email = decoded.email;
                            const name = decoded.name || decoded.given_name || 'GoogleUser';
                            const picture = decoded.picture;

                            // If user already typed username/email in form, prefer those over google fallback
                            const payload = {
                              email: formik.values.email?.trim() || email,
                              username: formik.values.username?.trim() || name,
                              avatarUrl: formik.values.avatarUrl?.trim() || picture,
                              // backend will set role = 'user' by default; or update to capture seller? up to you
                            };

                            const response = await api.post(GOOGLE_LOGIN_API, payload);
                            const { token, user } = response.data;
                            localStorage.setItem('token', token);
                            localStorage.setItem('currentUser', JSON.stringify(user));
                            navigate(user.role === 'admin' ? '/adminDashboard' : '/profile');
                          } catch (err) {
                            console.error(err);
                            setError('Đăng nhập Google thất bại.');
                          }
                        }}
                        onError={() => setError('Đăng nhập Google thất bại.')}
                      />
                    </GoogleOAuthProvider>
                  </>
                )}
              </Form>

              {/* Divider */}
              <hr className="my-4" />

              {/* Login Link */}
              <div className="text-center">
                <p className="mb-2">Đã có tài khoản?</p>
                <Link to="/login" className="text-decoration-none">
                  <Button variant="outline-primary" size="lg" className="fw-semibold">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Đăng nhập ngay
                  </Button>
                </Link>
              </div>

              {/* Terms */}
              <div className="text-center mt-4">
                <small className="text-muted">
                  Bằng việc đăng ký, bạn đồng ý với{' '}
                  <Link to="/terms" className="text-decoration-none">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link to="/privacy" className="text-decoration-none">
                    Chính sách bảo mật
                  </Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
