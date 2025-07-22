import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import "../styles/ProductList.css";
import axios from "axios";
import { formatPrice } from "../utils/formatters";
import { useMemo } from "react";
const ProductList = () => {
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:9999/api/products/all");

        if (response.data && response.data.success && response.data.data) {
          setProducts(response.data.data);
          setError(null);
          return;
        } else if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
          setError(null);
          return;
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Không thể tải danh sách sản phẩm");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, sortBy, minPrice]);

  const ProductCard = ({ product }) => {
    if (!product) return null;

    return (
      <Card className="h-100 product-card shadow-sm">
        <div className="position-relative">
          <Card.Img
            variant="top"
            src={
              product.images?.[0] ||
              "https://via.placeholder.com/300x300?text=No+Image"
            }
            className="product-image"
            style={{ height: "200px", objectFit: "cover" }}
          />
          {product.isAuction && (
            <Badge bg="danger" className="position-absolute top-0 start-0 m-2">
              <i className="bi bi-hammer"></i> Đấu giá
            </Badge>
          )}
          {product.quantity > 0 && (
            <Badge bg="success" className="position-absolute top-0 end-0 m-2">
              Số lượng: {product.quantity}
            </Badge>
          )}
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Title
            className="text-truncate"
            title={product.title || "Không có tiêu đề"}
          >
            {product.title || "Không có tiêu đề"}
          </Card.Title>
          <Card.Text className="text-muted small flex-grow-1">
            {product.description && product.description.length > 100
              ? product.description.substring(0, 100) + "..."
              : product.description || "Không có mô tả"}
          </Card.Text>

          <div className="mb-2">
            <Badge bg="secondary" className="me-1">
              {product.categoryId?.name || "Chưa phân loại"}
            </Badge>
            <small className="text-muted">
              bởi {product.sellerId?.username || "Người bán ẩn danh"}
            </small>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-auto">
            <h5 className="text-primary mb-0">
              {formatPrice(product.price || 0)}
            </h5>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <i className="bi bi-eye"></i> Xem
              </Button>
              <Button
                variant={product.isAuction ? "warning" : "primary"}
                size="sm"
                onClick={() => {
                  if (product.isAuction) {
                    console.log("Bid on auction:", product._id);
                    alert("Chức năng đấu giá đang được phát triển!");
                  } else {
                    addToCart(product);
                    alert(`Đã thêm "${product.title}" vào giỏ hàng!`);
                  }
                }}
              >
                {product.isAuction ? (
                  <>
                    <i className="bi bi-hammer"></i> Đấu giá
                  </>
                ) : (
                  <>
                    <i className="bi bi-cart-plus"></i> Mua
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const ProductListItem = ({ product }) => {
    if (!product) return null;

    return (
      <Card className="mb-3 product-list-item">
        <Row className="g-0">
          <Col md={3}>
            <div className="position-relative">
              <Card.Img
                src={
                  product.images?.[0] ||
                  "https://via.placeholder.com/300x300?text=No+Image"
                }
                className="product-image-list"
                style={{ height: "150px", objectFit: "cover", width: "100%" }}
              />
              {product.isAuction && (
                <Badge
                  bg="danger"
                  className="position-absolute top-0 start-0 m-2"
                >
                  <i className="bi bi-hammer"></i> Đấu giá
                </Badge>
              )}
            </div>
          </Col>
          <Col md={9}>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Card.Title>{product.title || "Không có tiêu đề"}</Card.Title>
                  <Card.Text className="text-muted">
                    {product.description || "Không có mô tả"}
                  </Card.Text>
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-2">
                      {product.categoryId?.name || "Chưa phân loại"}
                    </Badge>
                    <small className="text-muted">
                      Người bán: {product.sellerId?.username || "Ẩn danh"}
                    </small>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <h4 className="text-primary">
                    {formatPrice(product.price || 0)}
                  </h4>
                  {product.quantity > 0 && (
                    <p className="text-success mb-2">
                      Còn {product.quantity} sản phẩm
                    </p>
                  )}
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      <i className="bi bi-eye"></i> Xem chi tiết
                    </Button>
                    <Button
                      variant={product.isAuction ? "warning" : "primary"}
                      size="sm"
                      onClick={() => {
                        if (product.isAuction) {
                          console.log("Bid on auction:", product._id);
                          alert("Chức năng đấu giá đang được phát triển!");
                        } else {
                          addToCart(product);
                          alert(`Đã thêm "${product.title}" vào giỏ hàng!`);
                        }
                      }}
                    >
                      {product.isAuction ? (
                        <>
                          <i className="bi bi-hammer"></i> Đấu giá
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cart-plus"></i> Thêm vào giỏ
                        </>
                      )}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    );
  };

  // Tạo mảng sản phẩm đã lọc và sắp xếp
  const filteredProducts = products
    .filter((product) => {
      // Lọc theo danh mục
      if (filterCategory !== "all" && product.categoryId?.name !== filterCategory) {
        return false;
      }
      // Lọc theo từ khóa tìm kiếm
      if (
        searchTerm &&
        !product.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      // Lọc theo giá
      if (minPrice !== "" && product.price < Number(minPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "price-low") {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === "price-high") {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === "name") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

  const productsPerPage = 4;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIdx, startIdx + productsPerPage);
  }, [filteredProducts, currentPage]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải sản phẩm...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
          <p>{error}</p>
          <Button
            variant="outline-danger"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold text-center mb-4">
            <i className="bi bi-shop"></i> Danh sách sản phẩm
          </h1>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col lg={4} md={6} className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col lg={2} md={3} className="mb-3">
          <Form.Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Electronics">Điện tử</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Fashion">Thời trang</option>
          </Form.Select>
        </Col>

        <Col lg={2} md={3} className="mb-3">
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="price-low">Giá thấp đến cao</option>
            <option value="price-high">Giá cao đến thấp</option>
            <option value="name">Tên A-Z</option>
          </Form.Select>
        </Col>

        <Col lg={4} md={12} className="mb-3">
          <Form.Control
            type="number"
            min={0}
            value={minPrice}
            onChange={e => setMinPrice(Number(e.target.value))}
            placeholder="Giá từ"
          />
          <div className="d-flex justify-content-end align-items-center mt-2">
            <small className="me-3 text-muted">
              Hiển thị {filteredProducts.length} sản phẩm
            </small>
            <div className="btn-group" role="group">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <i className="bi bi-grid-3x3-gap"></i>
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <i className="bi bi-list"></i>
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <Row>
          <Col className="text-center py-5">
            <i className="bi bi-inbox display-1 text-muted"></i>
            <h3 className="text-muted mt-3">Không tìm thấy sản phẩm nào</h3>
            <p className="text-muted">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </Col>
        </Row>
      ) : (
        <>
          {viewMode === "grid" ? (
            <Row>
              {paginatedProducts.map((product) => (
                <Col key={product._id} xl={3} lg={4} md={6} className="mb-4">
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          ) : (
            <Row>
              <Col>
                {paginatedProducts.map((product) => (
                  <ProductListItem key={product._id} product={product} />
                ))}
              </Col>
            </Row>
          )}
        </>
      )}

      {/* Pagination */}
      <Row className="mt-5">
        <Col className="d-flex justify-content-center">
          <nav>
            <ul className="pagination">
              <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                <button
                  className="page-link btn"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, idx) => (
                <li
                  key={idx + 1}
                  className={`page-item${currentPage === idx + 1 ? " active" : ""}`}
                >
                  <button
                    className="page-link btn"
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item${currentPage === totalPages || totalPages === 0 ? " disabled" : ""}`}>
                <button
                  className="page-link btn"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Sau
                </button>
              </li>
            </ul>
          </nav>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductList;
