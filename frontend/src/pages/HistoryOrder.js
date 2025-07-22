import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FileText, Search } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

// API Endpoints
const API_ENDPOINTS = {
  ORDERS: '/orders/history/:userId',
  RETURN_REQUEST: '/orders/:orderId/return-request',
};

// Validation Schema
const searchValidationSchema = Yup.object({
  searchTerm: Yup.string(),
  statusFilter: Yup.string().oneOf(
    ['all', 'shipping', 'completed', 'cancelled', 'return_requested', 'returned'],
    'Invalid status'
  ),
});

export default function OrderHistory() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const hasFetchedRef = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  const api = axios.create({
    baseURL: 'http://localhost:9999/',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    timeout: 10000,
  });

  const fetchOrders = async () => {
    if (!currentUser?.id) {
      return;
    }

    try {
      const response = await api.get(
        API_ENDPOINTS.ORDERS.replace(':userId', currentUser.id)
      );
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Đã xảy ra lỗi khi tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchOrders();
    }
  }, []);

  // Formik for Search and Filter
  const formik = useFormik({
    initialValues: {
      searchTerm: '',
      statusFilter: 'all',
    },
    validationSchema: searchValidationSchema,
    onSubmit: () => {
      // No need for submission logic; filtering is handled on change
    },
  });

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toLowerCase().includes(formik.values.searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.product?.title?.toLowerCase().includes(formik.values.searchTerm.toLowerCase())
      );

    const matchesStatus =
      formik.values.statusFilter === 'all' || order.status === formik.values.statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleReturnRequest = async (orderId) => {
    try {
      const reason = prompt('Nhập lý do yêu cầu trả hàng:');
      if (!reason) return;

      const response = await api.post(
        API_ENDPOINTS.RETURN_REQUEST.replace(':orderId', orderId),
        {
          userId: currentUser.id,
          reason,
        }
      );

      if (response.status === 201) {
        alert('Yêu cầu trả hàng đã được gửi thành công!');
        hasFetchedRef.current = false;
        fetchOrders();
      } else {
        alert('Lỗi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error sending return request:', error);
      alert('Đã xảy ra lỗi khi gửi yêu cầu trả hàng');
    }
  };

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow">
              <Card.Body className="p-5 text-center">
                <p className="text-muted">
                  Vui lòng{' '}
                  <span
                    onClick={() => navigate('/auth')}
                    className="text-primary underline cursor-pointer fw-semibold"
                  >
                    đăng nhập
                  </span>{' '}
                  để xem lịch sử đơn hàng của bạn.
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
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Body className="p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">
                  <FileText size={24} className="me-2" />
                  Lịch sử đơn hàng
                </h2>
                <p className="text-muted">
                  Xem và quản lý các đơn hàng của bạn
                </p>
              </div>

              {/* Alert Messages */}
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {/* Search and Filter */}
              <Form onSubmit={formik.handleSubmit} className="mb-5">
                <Row className="g-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        <Search size={20} className="me-2" />
                        Tìm kiếm đơn hàng
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          name="searchTerm"
                          value={formik.values.searchTerm}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Tìm kiếm theo ID đơn hàng hoặc tên sản phẩm..."
                          disabled={loading}
                          isInvalid={formik.touched.searchTerm && formik.errors.searchTerm}
                        />
                        <InputGroup.Text>
                          <Search size={20} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.searchTerm}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        <i className="bi bi-filter me-2"></i>
                        Trạng thái
                      </Form.Label>
                      <Form.Select
                        name="statusFilter"
                        value={formik.values.statusFilter}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={loading}
                        isInvalid={formik.touched.statusFilter && formik.errors.statusFilter}
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="shipping">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                        <option value="return_requested">Yêu cầu trả hàng</option>
                        <option value="returned">Đã trả hàng</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.statusFilter}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang tải...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center text-muted">
                  {formik.values.searchTerm || formik.values.statusFilter !== 'all'
                    ? 'Không tìm thấy đơn hàng phù hợp với tiêu chí.'
                    : 'Bạn chưa có đơn hàng nào.'}
                </div>
              ) : (
                <>
                  {/* Order List */}
                  <div className="space-y-4">
                    {currentOrders.map((order) => (
                      <Card key={order.id || order._id} className="shadow-sm">
                        <Card.Body className="p-4">
                          <Row className="mb-3">
                            <Col xs={6}>
                              <div className="text-muted">
                                Mã đơn hàng:{' '}
                                <span className="fw-semibold">
                                  {order.order_id || order.id}
                                </span>
                              </div>
                            </Col>
                            <Col xs={6} className="text-end">
                              <div className="text-muted">
                                {moment(order.orderDate || order.created_at).format(
                                  'DD/MM/YYYY HH:mm'
                                )}
                              </div>
                            </Col>
                          </Row>

                          <div className="text-muted mb-4">
                            <div>
                              <span className="fw-semibold">Người nhận:</span>{' '}
                              {order.addressId?.fullName}
                            </div>
                            <div>
                              <span className="fw-semibold">Địa chỉ giao hàng:</span>{' '}
                              {order.addressId?.street}, {order.addressId?.city}
                              {order.addressId?.state ? `, ${order.addressId?.state}` : ''},{' '}
                              {order.addressId?.country}
                            </div>
                          </div>

                          <Row className="g-3">
                            {(order.items || []).map((item, index) => (
                              <Col key={item.id || index} xs={12} sm={6} md={4}>
                                <Card
                                  className="border-0 bg-light cursor-pointer"
                                  onClick={() =>
                                    navigate(`/product/${item.productId || item.product_id}`)
                                  }
                                >
                                  <Card.Img
                                    variant="top"
                                    src={item.images?.[0] || item.product?.images?.[0]}
                                    alt={item.product?.title}
                                    className="w-full h-36 object-cover rounded"
                                  />
                                  <Card.Body>
                                    <Card.Title className="fw-semibold">
                                      {item.product?.title}
                                    </Card.Title>
                                    <div className="text-muted">
                                      Số lượng: {item.quantity}
                                    </div>
                                    <div className="text-muted">
                                      Giá: ₫{(item.unitPrice || item.price).toLocaleString()}
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>

                          <hr className="my-3" />

                          <Row className="text-muted">
                            <Col xs={6}>
                              <div>
                                Trạng thái:{' '}
                                <span
                                  className={`fw-semibold ${
                                    order.status === 'completed'
                                      ? 'text-success'
                                      : order.status === 'shipping'
                                      ? 'text-primary'
                                      : order.status === 'cancelled'
                                      ? 'text-danger'
                                      : order.status === 'return_requested'
                                      ? 'text-warning'
                                      : order.status === 'returned'
                                      ? 'text-info'
                                      : 'text-muted'
                                  }`}
                                >
                                  {order.status === 'shipping' && 'Đang giao'}
                                  {order.status === 'completed' && 'Hoàn thành'}
                                  {order.status === 'cancelled' && 'Đã hủy'}
                                  {order.status === 'return_requested' && 'Yêu cầu trả hàng'}
                                  {order.status === 'returned' && 'Đã trả hàng'}
                                </span>
                              </div>
                            </Col>
                            <Col xs={6} className="text-end">
                              <div>
                                Tổng cộng:{' '}
                                <span className="fw-semibold">
                                  ₫{(order.totalPrice || order.total_amount).toLocaleString()}
                                </span>
                              </div>
                            </Col>
                          </Row>

                          <div className="d-flex justify-content-between mt-4">
                            <Button
                              variant="outline-primary"
                              onClick={() => setSelectedOrder(order)}
                              className="fw-semibold"
                            >
                              <i className="bi bi-eye me-2"></i>
                              Xem chi tiết
                            </Button>
                            {(order.status === 'shipping' || order.status === 'completed') && (
                              <Button
                                variant="outline-danger"
                                onClick={() => handleReturnRequest(order.id || order._id)}
                                className="fw-semibold"
                              >
                                <i className="bi bi-arrow-return-left me-2"></i>
                                Yêu cầu trả hàng
                              </Button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-5 gap-2">
                      <Button
                        variant="outline-primary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="fw-semibold"
                      >
                        <i className="bi bi-chevron-left me-2"></i>
                        Trước
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'primary' : 'outline-primary'}
                          onClick={() => handlePageChange(page)}
                          className="fw-semibold"
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline-primary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="fw-semibold"
                      >
                        Tiếp
                        <i className="bi bi-chevron-right ms-2"></i>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}