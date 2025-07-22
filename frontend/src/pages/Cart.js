import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Badge,
  Alert,
  Form,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatters';

const Cart = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const validCoupons = {
    'GIAM10': 0.10,
    'GIAM20': 0.20,
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (validCoupons[code]) {
      const discountValue = totalPrice * validCoupons[code];
      setDiscount(discountValue);
      setCouponMessage(`Áp dụng mã "${code}" thành công! Giảm ${formatPrice(discountValue)}`);
    } else {
      setDiscount(0);
      setCouponMessage(`Mã "${code}" không hợp lệ.`);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    alert(`Đang xử lý thanh toán cho ${totalItems} sản phẩm với tổng tiền ${formatPrice(totalPrice - discount)}`);
    clearCart();
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="text-center shadow">
              <Card.Body className="py-5">
                <i className="bi bi-cart-x display-1 text-muted mb-4"></i>
                <h2 className="mb-3">Giỏ hàng trống</h2>
                <p className="text-muted mb-4">
                  Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/')}
                  className="px-4"
                >
                  <i className="bi bi-shop me-2"></i>
                  Tiếp tục mua sắm
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="display-6 fw-bold">
              <i className="bi bi-cart3 me-2"></i>
              Giỏ hàng của bạn
            </h1>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Tiếp tục mua sắm
            </Button>
          </div>
          <p className="text-muted">
            Bạn có {totalItems} sản phẩm trong giỏ hàng
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <Row className="align-items-center">
                <Col>
                  <h5 className="mb-0">Sản phẩm trong giỏ</h5>
                </Col>
                <Col xs="auto">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm?')) {
                        clearCart();
                      }
                    }}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Xóa tất cả
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {items.map((item) => (
                  <ListGroup.Item key={item._id} className="p-4">
                    <Row className="align-items-center">
                      <Col xs={12} sm={3} className="mb-3 mb-sm-0">
                        <img
                          src={item.productId?.images?.[0] || 'https://via.placeholder.com/150x150?text=No+Image'}
                          alt={item.productId?.title || 'Sản phẩm'}
                          className="img-fluid rounded"
                          style={{ maxHeight: '120px', width: '100%', objectFit: 'cover' }}
                        />
                      </Col>
                      <Col xs={12} sm={4} className="mb-3 mb-sm-0">
                        <h6 className="mb-2 fw-bold">{item.productId?.title || 'Không có tên sản phẩm'}</h6>
                        <p className="text-muted small mb-2">
                          Người bán: <strong>{item.sellerId?.username || 'Không rõ'}</strong>
                        </p>
                        <div className="mb-2">
                          <Badge bg="success" className="me-2">
                            <i className="bi bi-check-circle me-1"></i>
                            {item.status === 'active' ? 'Có sẵn' : 'Không khả dụng'}
                          </Badge>
                          <Badge bg="info">
                            Giá lúc thêm: {formatPrice(item.priceAtTime)}
                          </Badge>
                        </div>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          Thêm vào: {new Date(item.addedAt).toLocaleDateString('vi-VN')}
                        </small>
                      </Col>
                      <Col xs={6} sm={2} className="mb-3 mb-sm-0">
                        <div className="d-flex align-items-center justify-content-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.productId?._id || item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <i className="bi bi-dash"></i>
                          </Button>
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId?._id || item._id, parseInt(e.target.value) || 1)}
                            className="mx-2 text-center"
                            style={{ width: '60px' }}
                            min="1"
                            max="99"
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.productId?._id || item._id, item.quantity + 1)}
                            disabled={item.quantity >= 99}
                          >
                            <i className="bi bi-plus"></i>
                          </Button>
                        </div>
                      </Col>
                      <Col xs={6} sm={3}>
                        <div className="text-end">
                          <h6 className="text-primary mb-2">
                            {formatPrice(item.priceAtTime * item.quantity)}
                          </h6>
                          <small className="text-muted d-block mb-2">
                            {formatPrice(item.priceAtTime)} × {item.quantity}
                          </small>
                          {item.priceAtTime !== item.productId?.price && (
                            <small className="text-warning d-block mb-2">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Giá hiện tại: {formatPrice(item.productId?.price)}
                            </small>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn xóa "${item.productId?.title}" khỏi giỏ hàng?`)) {
                                removeFromCart(item.productId?._id || item._id);
                              }
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Tóm tắt đơn hàng
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tổng sản phẩm:</span>
                  <span>{totalItems} sản phẩm</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span className="text-success">Miễn phí</span>
                </div>

                {/* Mã giảm giá */}
                <Form className="my-3">
                  <Form.Label>Mã giảm giá</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã (ví dụ: GIAM10)"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <Button
                      variant="outline-success"
                      onClick={applyCoupon}
                      className="ms-2"
                    >
                      Áp dụng
                    </Button>
                  </div>
                  {couponMessage && (
                    <Alert
                      variant={discount > 0 ? 'success' : 'danger'}
                      className="mt-2 mb-0 py-2"
                    >
                      <small>{couponMessage}</small>
                    </Alert>
                  )}
                </Form>

                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatPrice(totalPrice - discount)}</span>
                </div>
              </div>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckout}
                  className="fw-bold"
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Thanh toán ngay
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Tiếp tục mua sắm
                </Button>
              </div>

              <Alert variant="info" className="mt-3 mb-0">
                <small>
                  <i className="bi bi-shield-check me-1"></i>
                  Thanh toán an toàn và bảo mật 100%
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
