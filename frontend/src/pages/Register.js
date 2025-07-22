import React, { useState } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Tên người dùng phải có ít nhất 3 ký tự');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:9999/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      });

      if (response.data.success) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Register error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const getPasswordStrength = () => {
    const password = formData.password;
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
                <h2 className="fw-bold text-primary mb-2">
                  <i className="bi bi-person-plus me-2"></i>
                  Đăng ký tài khoản
                </h2>
                <p className="text-muted">
                  Tạo tài khoản mới để bắt đầu mua sắm
                </p>
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

              {/* Register Form */}
              <Form onSubmit={handleSubmit}>
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
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Nhập tên người dùng"
                        disabled={loading}
                        isInvalid={error && !formData.username}
                      />
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
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Nhập email"
                        disabled={loading}
                        isInvalid={error && !formData.email}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-lock me-2"></i>
                    Mật khẩu *
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                      disabled={loading}
                      isInvalid={error && !formData.password}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </Button>
                  </InputGroup>
                  {formData.password && (
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

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-lock-fill me-2"></i>
                    Xác nhận mật khẩu *
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu"
                      disabled={loading}
                      isInvalid={error && !formData.confirmPassword}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </Button>
                  </InputGroup>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <small className="text-danger">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Mật khẩu không khớp
                    </small>
                  )}
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="bi bi-telephone me-2"></i>
                        Số điện thoại
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        <i className="bi bi-geo-alt me-2"></i>
                        Địa chỉ
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid gap-2">
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
