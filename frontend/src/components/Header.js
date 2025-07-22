import React from "react";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Badge,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const Header = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow">
        <Container>
          <Navbar.Brand href="/" className="fw-bold fs-3">
            <i className="bi bi-shop me-2"></i>
            E-Bay Clone
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Trang chủ</Nav.Link>
              <Nav.Link href="/products">Sản phẩm</Nav.Link>
            </Nav>

            <Nav>
              <Button
                variant="outline-light"
                className="position-relative me-3"
                onClick={() => navigate("/cart")}
              >
                <i className="bi bi-cart3 fs-5"></i>
                {totalItems > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="outline-light"
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.username || "User"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigate("/profile")}>
                      <i className="bi bi-person me-2"></i>
                      Hồ sơ
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate("/orders/history")}>
                      <i className="bi bi-bag me-2"></i>
                      Đơn hàng
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={handleLogout}
                      className="text-danger"
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button
                  variant="outline-light"
                  className="me-2"
                  onClick={() => navigate("/login")}
                >
                  <i className="bi bi-person me-1"></i>
                  Đăng nhập
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
