import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup, Image } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// API Endpoints
const API_BASE_URL = 'http://localhost:9999';
const UPDATE_PROFILE_API = '/api/auth/user/update-profile';
const GET_USER_PROFILE_API = '/api/auth/user/profile';

const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    timeout: 10000,
  });

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(GET_USER_PROFILE_API);
      if (response.status === 200) {
        setCurrentUser(response.data.user);
      } else {
        throw new Error(response.data.message || 'Không thể tải thông tin người dùng.');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    if (!token) {
      navigate('/auth');
    } else {
      fetchUserProfile();
    }
  }, [token, navigate]);

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required('Nhập tên người dùng.')
      .test('no-space', 'Tên người dùng không được chứa khoảng trắng.', (val) => !/\s/.test(val))
      .min(3, 'Tên người dùng phải có ít nhất 3 ký tự.'),
    email: Yup.string().email('Email không hợp lệ.').required('Nhập email.'),
    avatarUrl: Yup.string().url('URL ảnh không hợp lệ.').required('Nhập URL ảnh đại diện.'),
  });

  const formik = useFormik({
    initialValues: {
      username: currentUser?.username || '',
      email: currentUser?.email || '',
      avatarUrl: currentUser?.avatarUrl || DEFAULT_AVATAR_URL,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      setLoading(true);

      try {
        const response = await api.put(UPDATE_PROFILE_API, {
          username: values.username,
          email: values.email.toLowerCase().trim(),
          avatarUrl: values.avatarUrl,
        });

        if (response.status === 200) {
          const updatedUser = { ...currentUser, ...response.data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
          setSuccess('Cập nhật thông tin thành công!');
          setIsEditing(false);
        } else {
          setError(response.data.message || 'Cập nhật thông tin thất bại.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin.');
      } finally {
        setLoading(false);
      }
    },
  });

  if (!token) return null;

  if (loading && !currentUser) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow">
              <Card.Body className="p-5 text-center">
                <Spinner animation="border" size="sm" className="me-2" />
                Đang tải thông tin người dùng...
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow">
              <Card.Body className="p-5 text-center">
                <p className="text-muted">
                  Không thể tải thông tin người dùng. Vui lòng{' '}
                  <span
                    onClick={() => navigate('/auth')}
                    className="text-primary underline cursor-pointer fw-semibold"
                  >
                    đăng nhập lại
                  </span>.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">
                  <i className="bi bi-person-circle me-2"></i>
                  Thông tin cá nhân
                </h2>
                <p className="text-muted">Xem và chỉnh sửa thông tin tài khoản của bạn</p>
              </div>

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

              {isEditing ? (
                <Form onSubmit={formik.handleSubmit}>
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
                      onBlur={formik.handleBlur}
                      placeholder="Nhập tên người dùng"
                      disabled={loading}
                      isInvalid={formik.touched.username && formik.errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>

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
                      onBlur={formik.handleBlur}
                      placeholder="Nhập email"
                      disabled={loading}
                      isInvalid={formik.touched.email && formik.errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-image me-2"></i>
                      URL ảnh đại diện *
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        name="avatarUrl"
                        value={formik.values.avatarUrl}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập URL ảnh đại diện"
                        disabled={loading}
                        isInvalid={formik.touched.avatarUrl && formik.errors.avatarUrl}
                      />
                      <InputGroup.Text>
                        <i className="bi bi-image"></i>
                      </InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.avatarUrl}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-grid gap-2 mb-3">
                    <Button variant="primary" type="submit" size="lg" disabled={loading} className="fw-semibold">
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="d-grid gap-2">
                    <Button variant="outline-secondary" onClick={() => setIsEditing(false)} disabled={loading} className="fw-semibold">
                      <i className="bi bi-x-circle me-2"></i>
                      Hủy
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <Image
                      src={currentUser.avatarUrl || DEFAULT_AVATAR_URL}
                      alt="Avatar"
                      roundedCircle
                      className="mb-3"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                    <h4 className="fw-semibold">{currentUser.username}</h4>
                    <p className="text-muted">{currentUser.email}</p>
                    <p className="text-muted">
                      Vai trò:{' '}
                      <span className="fw-semibold">
                        {currentUser.role === 'user' && 'Người dùng'}
                        {currentUser.role === 'seller' && 'Người bán'}
                        {currentUser.role === 'admin' && 'Quản trị viên'}
                      </span>
                    </p>
                    <p className="text-muted">
                      Trạng thái:{' '}
                      <span className={`fw-semibold ${currentUser.isVerified ? 'text-success' : 'text-danger'}`}>
                        {currentUser.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </span>
                    </p>
                  </div>

                  <div className="d-grid gap-2 mb-3">
                    <Button variant="primary" onClick={() => setIsEditing(true)} size="lg" className="fw-semibold">
                      <i className="bi bi-pencil-square me-2"></i>
                      Chỉnh sửa thông tin
                    </Button>
                  </div>
                  <div className="d-grid gap-2">
                    <Button variant="outline-primary" onClick={() => navigate('/orders/history')} className="fw-semibold">
                      <i className="bi bi-file-text me-2"></i>
                      Xem lịch sử đơn hàng
                    </Button>
                  </div>
                </>
              )}

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-2">Bạn muốn đăng xuất?</p>
                <Button variant="outline-danger" onClick={logout} size="lg" className="fw-semibold">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Đăng xuất
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
