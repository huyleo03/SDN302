import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <Container>
        <Row>
          <Col md={3} className="mb-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-shop me-2"></i>
              E-Bay Clone
            </h5>
            <p className="text-muted">
              Nền tảng mua bán trực tuyến hàng đầu với hàng triệu sản phẩm chất lượng cao.
            </p>
            <div className="d-flex gap-3">
              <button className="btn text-light p-0" onClick={() => console.log('Facebook')}>
                <i className="bi bi-facebook fs-5"></i>
              </button>
              <button className="btn text-light p-0" onClick={() => console.log('Twitter')}>
                <i className="bi bi-twitter fs-5"></i>
              </button>
              <button className="btn text-light p-0" onClick={() => console.log('Instagram')}>
                <i className="bi bi-instagram fs-5"></i>
              </button>
              <button className="btn text-light p-0" onClick={() => console.log('YouTube')}>
                <i className="bi bi-youtube fs-5"></i>
              </button>
            </div>
          </Col>
          
          <Col md={3} className="mb-4">
            <h6 className="fw-bold mb-3">Mua sắm</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Categories')}>Danh mục sản phẩm</button>
              </li>
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('New products')}>Sản phẩm mới</button>
              </li>
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Best sellers')}>Sản phẩm bán chạy</button>
              </li>
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Auctions')}>Đấu giá</button>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4">
            <h6 className="fw-bold mb-3">Bán hàng</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Post product')}>Đăng sản phẩm</button>
              </li>
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Manage store')}>Quản lý cửa hàng</button>
              </li>
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Service fees')}>Phí dịch vụ</button>
              </li>
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Selling guide')}>Hướng dẫn bán hàng</button>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4">
            <h6 className="fw-bold mb-3">Hỗ trợ</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Help center')}>Trung tâm trợ giúp</button>
              </li>
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Contact')}>Liên hệ</button>
              </li>
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Privacy policy')}>Chính sách bảo mật</button>
              </li>
              <li className="mb-2">
                <button className="btn text-muted text-decoration-none p-0" onClick={() => console.log('Terms of use')}>Điều khoản sử dụng</button>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row className="align-items-center">
          <Col md={6}>
            <p className="text-muted mb-0">
              © 2025 E-Bay Clone. Tất cả quyền được bảo lưu.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <span className="text-muted">
              Được phát triển với <i className="bi bi-heart-fill text-danger"></i> bởi SDN302 Team
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
