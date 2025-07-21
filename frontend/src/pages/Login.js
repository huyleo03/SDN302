import React, { useState } from "react";
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
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import axios from "axios";
import { isValidEmail } from "../utils/validators";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:9999/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate("/");
      } else {
        setError(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Đăng nhập
                </h2>
                <p className="text-muted">
                  Chào mừng bạn quay trở lại với E-Bay Clone
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-envelope me-2"></i>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email của bạn"
                    size="lg"
                    disabled={loading}
                    isInvalid={error && !formData.email}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-lock me-2"></i>
                    Mật khẩu
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu"
                      size="lg"
                      disabled={loading}
                      isInvalid={error && !formData.password}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i
                        className={`bi bi-eye${showPassword ? "-slash" : ""}`}
                      ></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

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
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Đăng nhập
                      </>
                    )}
                  </Button>
                </div>

                {/* Forgot Password */}
                <div className="text-center mt-3">
                  <Link to="/forgot-password" className="text-decoration-none">
                    <small>Quên mật khẩu?</small>
                  </Link>
                </div>
              </Form>

              {/* Divider */}
              <hr className="my-4" />

              {/* Register Link */}
              <div className="text-center">
                <p className="mb-2">Chưa có tài khoản?</p>
                <Link to="/register" className="text-decoration-none">
                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="fw-semibold"
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Đăng ký ngay
                  </Button>
                </Link>
              </div>

              {/* Demo Account */}
              <Alert variant="info" className="mt-4 mb-0">
                <small>
                  <strong>Tài khoản demo:</strong>
                  <br />
                  Email: demo@ebay.com
                  <br />
                  Mật khẩu: 123456
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
