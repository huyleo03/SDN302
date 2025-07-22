import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Carousel,
  Tab,
  Nav,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ProductDetail.css";
import { formatPrice } from "../utils/formatters";
import { formatDate } from "../utils/dateUtils";
import { useContext } from "react";
import CartContext from "../context/CartContext";
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    variant: "",
  });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:9999/api/products/${id}`
        );

        if (response.data && response.data.success && response.data.data) {
          setProduct(response.data.data);
          setError(null);
        } else if (response.data) {
          console.log("🔍 Product loaded (alternative):", response.data);
          setProduct(response.data);
          setError(null);
        }
      } catch (err) {
        setError("Không thể tải thông tin chi tiết sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
    // Fetch reviews
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const res = await axios.get(`http://localhost:9999/api/products/${id}/reviews`);
        if (res.data && res.data.success) {
          setReviews(res.data.data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    if (id) fetchReviews();
  }, [id]);

  const showNotification = (message, variant = "success") => {
    setShowAlert({ show: true, message, variant });
    setTimeout(() => {
      setShowAlert({ show: false, message: "", variant: "" });
    }, 3000);
  };

  const handleAddToCart = async () => {
    if (!product) {
      console.error("❌ No product data");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Vui lòng đăng nhập để thêm vào giỏ hàng", "danger");
      navigate("/login");
      return;
    }

    try {
      const success = await addToCart(product.id, quantity);

      if (success) {
        showNotification(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      } else {
        showNotification("Không thể thêm sản phẩm vào giỏ hàng", "warning");
      }
    } catch (error) {
      console.error("❌ Add to cart error:", error);

      let errorMessage = "Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, "danger");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Vui lòng đăng nhập để mua hàng", "danger");
      navigate("/login");
      return;
    }

    try {
      const success = await addToCart(product.id, quantity);

      if (success) {
        showNotification("Đang chuyển đến giỏ hàng...", "info");
        setTimeout(() => {
          navigate("/cart");
        }, 1000);
      } else {
        showNotification("Không thể thêm sản phẩm vào giỏ hàng", "warning");
      }
    } catch (error) {
      console.error("Buy now error:", error);
      showNotification("Lỗi khi thực hiện mua hàng", "danger");
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.inventory || 99)) {
      setQuantity(newQuantity);
    }
  };

  const handleBidNow = () => {
    alert("Chức năng đấu giá đang được phát triển!");
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3">Đang tải thông tin sản phẩm...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
          <p>{error}</p>
          <div>
            <Button
              variant="outline-danger"
              onClick={() => window.location.reload()}
              className="me-2"
            >
              Thử lại
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Không tìm thấy sản phẩm!</Alert.Heading>
          <p>Sản phẩm có thể đã bị xóa hoặc không tồn tại.</p>
          <Button variant="outline-secondary" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Alert thông báo */}
      {showAlert.show && (
        <Alert variant={showAlert.variant} className="mb-4">
          <i
            className={`bi bi-${
              showAlert.variant === "success" ? "check-circle" : "info-circle"
            } me-2`}
          ></i>
          {showAlert.message}
        </Alert>
      )}

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Button
              variant="link"
              className="p-0 text-decoration-none"
              onClick={() => navigate("/")}
            >
              Trang chủ
            </Button>
          </li>
          <li className="breadcrumb-item">
            <Button
              variant="link"
              className="p-0 text-decoration-none"
              onClick={() => navigate("/")}
            >
              Sản phẩm
            </Button>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.title || "Chi tiết sản phẩm"}
          </li>
        </ol>
      </nav>

      <Row>
        {/* Product Images */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              {product.images && product.images.length > 0 ? (
                product.images.length === 1 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="img-fluid w-100 product-main-image"
                    style={{ height: "500px", objectFit: "cover" }}
                  />
                ) : (
                  <Carousel>
                    {product.images.map((image, index) => (
                      <Carousel.Item key={index}>
                        <img
                          src={image}
                          alt={`${product.title} - ${index + 1}`}
                          className="d-block w-100 product-main-image"
                          style={{ height: "500px", objectFit: "cover" }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                )
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light"
                  style={{ height: "500px" }}
                >
                  <div className="text-center text-muted">
                    <i className="bi bi-image display-1"></i>
                    <p className="mt-2">Không có hình ảnh</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Product Information */}
        <Col lg={6}>
          <div className="product-info">
            {/* Product Title and Badges */}
            <div className="mb-3">
              <h1 className="display-6 fw-bold mb-3">
                {product.title || "Không có tiêu đề"}
              </h1>
              <div className="d-flex gap-2 mb-3">
                {product.isAuction && (
                  <Badge bg="danger" className="px-3 py-2">
                    <i className="bi bi-hammer me-1"></i>
                    Đấu giá
                  </Badge>
                )}
                <Badge bg="secondary" className="px-3 py-2">
                  {product.categoryId?.name || product.category?.name || "Chưa phân loại"}
                </Badge>
                <Badge
                  bg={
                    product.status === "available"
                      ? "success"
                      : product.status === "sold"
                      ? "danger"
                      : "warning"
                  }
                  className="px-3 py-2"
                >
                  {product.status === "available"
                    ? "Còn hàng"
                    : product.status === "sold"
                    ? "Đã bán"
                    : "Đang xử lý"}
                </Badge>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <h2 className="text-primary fw-bold display-5 mb-2">
                {formatPrice(product.price)}
              </h2>
              {product.isAuction && (
                <p className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  Kết thúc đấu giá: {formatDate(product.auctionEndTime)}
                </p>
              )}
            </div>

            {/* Quantity */}
            {product.quantity !== undefined && (
              <div className="mb-4">
                <h6 className="fw-bold">Số lượng:</h6>
                <span
                  className={`badge ${
                    product.quantity > 0 ? "bg-success" : "bg-danger"
                  } fs-6 px-3 py-2`}
                >
                  {product.quantity > 0
                    ? `Còn ${product.quantity} sản phẩm`
                    : "Hết hàng"}
                </span>
              </div>
            )}

            {/* Seller Information */}
            <div className="mb-4">
              <h6 className="fw-bold">Người bán:</h6>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {product.sellerId?.avatarUrl ? (
                    <img
                      src={product.sellerId.avatarUrl}
                      alt={product.sellerId.username}
                      className="rounded-circle"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                      style={{ width: "50px", height: "50px" }}
                    >
                      <i className="bi bi-person text-white"></i>
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-1 fw-semibold">
                    {product.sellerId?.username || "Ẩn danh"}
                  </p>
                  <small className="text-muted">
                    {product.sellerId?.email || "Không có email"}
                  </small>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-4">
              {product.status === "available" && product.quantity > 0 ? (
                <>
                  {/* Quantity Selector - chỉ hiển thị cho sản phẩm không phải đấu giá */}
                  {!product.isAuction && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Số lượng:
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          <i className="bi bi-dash"></i>
                        </Button>
                        <input
                          type="number"
                          className="form-control text-center"
                          style={{ width: "80px" }}
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(parseInt(e.target.value) || 1)
                          }
                          min="1"
                          max={product.quantity || 99}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= (product.quantity || 99)}
                        >
                          <i className="bi bi-plus"></i>
                        </Button>
                        <small className="text-muted ms-2">
                          Còn {product.quantity || 0} sản phẩm
                        </small>
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    {product.isAuction ? (
                      <Button
                        variant="warning"
                        size="lg"
                        onClick={handleBidNow}
                        className="fw-bold"
                      >
                        <i className="bi bi-hammer me-2"></i>
                        Đấu giá ngay
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleBuyNow}
                          className="fw-bold"
                        >
                          <i className="bi bi-lightning-fill me-2"></i>
                          Mua ngay
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="lg"
                          onClick={handleAddToCart}
                          className="fw-bold"
                        >
                          <i className="bi bi-cart-plus me-2"></i>
                          Thêm vào giỏ hàng
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  disabled
                  className="w-100"
                >
                  {product.status === "sold" ? "Đã bán hết" : "Không khả dụng"}
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Product Details Tabs */}
      <Row className="mt-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Tab.Container defaultActiveKey="description">
                <Nav variant="tabs" className="mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="description">
                      <i className="bi bi-file-text me-2"></i>
                      Mô tả sản phẩm
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="specifications">
                      <i className="bi bi-list-ul me-2"></i>
                      Thông số kỹ thuật
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reviews">
                      <i className="bi bi-star me-2"></i>
                      Đánh giá
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="description">
                    <div className="product-description">
                      <h5 className="mb-3">Mô tả chi tiết</h5>
                      <div className="description-content">
                        {product.description ? (
                          <p
                            className="mb-0"
                            style={{
                              lineHeight: "1.6",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {product.description}
                          </p>
                        ) : (
                          <p className="text-muted mb-0">
                            Chưa có mô tả chi tiết cho sản phẩm này.
                          </p>
                        )}
                      </div>
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="specifications">
                    <div className="product-specifications">
                      <h5 className="mb-3">Thông số kỹ thuật</h5>
                      <table className="table table-striped">
                        <tbody>
                          <tr>
                            <td className="fw-semibold">Phân loại</td>
                            <td>
                              {product.categoryId?.name || product.category?.name || "Chưa phân loại"}
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-semibold">Trạng thái</td>
                            <td>
                              <Badge
                                bg={
                                  product.status === "available"
                                    ? "success"
                                    : "warning"
                                }
                              >
                                {product.status === "available"
                                  ? "Còn hàng"
                                  : "Không khả dụng"}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-semibold">Số lượng</td>
                            <td>{product.quantity || 0}</td>
                          </tr>
                          <tr>
                            <td className="fw-semibold">Loại bán</td>
                            <td>
                              {product.isAuction ? "Đấu giá" : "Bán thường"}
                            </td>
                          </tr>
                          {product.isAuction && product.auctionEndTime && (
                            <tr>
                              <td className="fw-semibold">
                                Thời gian kết thúc đấu giá
                              </td>
                              <td>{formatDate(product.auctionEndTime)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="reviews">
                    <div className="product-reviews">
                      <h5 className="mb-3">Đánh giá sản phẩm</h5>
                      {loadingReviews ? (
                        <Spinner animation="border" size="sm" />
                      ) : reviews.length === 0 ? (
                        <p className="text-muted">Chưa có đánh giá nào cho sản phẩm này.</p>
                      ) : (
                        <ul className="list-unstyled">
                          {reviews.map((rv) => (
                            <li key={rv._id} className="mb-4 border-bottom pb-3">
                              <div className="d-flex align-items-center mb-2">
                                <img
                                  src={rv.userId?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (rv.userId?.username || 'U')}
                                  alt={rv.userId?.username || 'Ẩn danh'}
                                  className="rounded-circle me-3"
                                  style={{ width: 40, height: 40, objectFit: 'cover' }}
                                />
                                <div>
                                  <strong>{rv.userId?.username || 'Ẩn danh'}</strong>
                                  <div className="text-warning">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <i
                                        key={i}
                                        className={
                                          i < rv.rating ? 'bi bi-star-fill' : 'bi bi-star'
                                        }
                                      ></i>
                                    ))}
                                  </div>
                                  <small className="text-muted">{formatDate(rv.createdAt)}</small>
                                </div>
                              </div>
                              <div className="ps-5">
                                <span>{rv.comment || <span className="text-muted">(Không có nội dung)</span>}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
