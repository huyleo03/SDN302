import React, { useState } from 'react';
import { 
  Modal, 
  Button, 
  ListGroup, 
  Row, 
  Col, 
  Badge, 
  Alert,
  Form,
  InputGroup
} from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

const Cart = ({ show, onHide }) => {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, parseInt(newQuantity));
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart after successful checkout
      clearCart();
      onHide();
      
      alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
      
    } catch (error) {
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-cart3 me-2"></i>
          Giỏ hàng của bạn
          {totalItems > 0 && (
            <Badge bg="primary" className="ms-2">
              {totalItems} sản phẩm
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {items.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-cart-x display-1 text-muted"></i>
            <h5 className="mt-3 text-muted">Giỏ hàng trống</h5>
            <p className="text-muted">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          </div>
        ) : (
          <>
            <ListGroup variant="flush">
              {items.map((item) => (
                <ListGroup.Item key={item._id} className="py-3">
                  <Row className="align-items-center">
                    <Col md={2}>
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/80x80?text=No+Image'}
                        alt={item.title}
                        className="img-fluid rounded"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </Col>
                    
                    <Col md={4}>
                      <h6 className="mb-1">{item.title}</h6>
                      <small className="text-muted">
                        {item.categoryId?.name || 'Chưa phân loại'}
                      </small>
                      <br />
                      <small className="text-muted">
                        Người bán: {item.sellerId?.username || 'Ẩn danh'}
                      </small>
                    </Col>
                    
                    <Col md={2}>
                      <div className="fw-bold text-primary">
                        {formatPrice(item.price)}
                      </div>
                    </Col>
                    
                    <Col md={3}>
                      <InputGroup size="sm">
                        <Button
                          variant="outline-secondary"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={isProcessing}
                        >
                          <i className="bi bi-dash"></i>
                        </Button>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                          min="1"
                          className="text-center"
                          disabled={isProcessing}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          disabled={isProcessing}
                        >
                          <i className="bi bi-plus"></i>
                        </Button>
                      </InputGroup>
                    </Col>
                    
                    <Col md={1}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item._id)}
                        disabled={isProcessing}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                  
                  <Row className="mt-2">
                    <Col className="text-end">
                      <strong>
                        Tổng: {formatPrice(item.price * item.quantity)}
                      </strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="border-top pt-3 mt-3">
              <Row>
                <Col>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Tổng cộng:</h5>
                    <h4 className="mb-0 text-primary fw-bold">
                      {formatPrice(totalPrice)}
                    </h4>
                  </div>
                  <small className="text-muted">
                    {totalItems} sản phẩm trong giỏ hàng
                  </small>
                </Col>
              </Row>
            </div>

            <Alert variant="info" className="mt-3 mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Miễn phí vận chuyển cho đơn hàng trên $50
            </Alert>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        {items.length > 0 && (
          <>
            <Button 
              variant="outline-secondary" 
              onClick={clearCart}
              disabled={isProcessing}
            >
              <i className="bi bi-trash me-1"></i>
              Xóa tất cả
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="px-4"
            >
              {isProcessing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="bi bi-credit-card me-2"></i>
                  Thanh toán
                </>
              )}
            </Button>
          </>
        )}
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Cart;
