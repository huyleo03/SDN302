import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import authService from "../services/authService";
import addressService from "../services/addressService";
import orderService from "../services/orderService";
import { formatPrice } from "../utils/formatters";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, clearCart } = useCart();

  // States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit address states
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Address form state
  const [addressData, setAddressData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Việt Nam",
    isDefault: false,
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderNotes, setOrderNotes] = useState("");

  // Check authentication and load data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const authenticated = authService.isAuthenticated();

        if (!authenticated) {
          navigate("/login");
          return;
        }

        // Check cart
        if (items.length === 0) {
          navigate("/cart");
          return;
        }

        // Load addresses
        setLoading(true);

        const response = await addressService.getUserAddresses();

        if (response && response.success) {
          setAddresses(response.data || []);

          if (!response.data || response.data.length === 0) {
            setShowAddressForm(true);
          } else {
            const defaultAddress = response.data.find((addr) => addr.isDefault);
            const selectedAddr = defaultAddress || response.data[0];

            setSelectedAddressId(selectedAddr._id);
            setAddressData({
              fullName: selectedAddr.fullName,
              phone: selectedAddr.phone,
              street: selectedAddr.street,
              city: selectedAddr.city,
              state: selectedAddr.state,
              country: selectedAddr.country,
              isDefault: selectedAddr.isDefault,
            });
          }
        } else {
          setAddresses([]);
          setShowAddressForm(true);
        }
      } catch (error) {
        console.error("❌ Error loading data:", error);
        setAddresses([]);
        setShowAddressForm(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [navigate, items.length]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddressId(address._id);
    setAddressData({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowAddressForm(false);
  };

  // Handle address form submission
  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      // Update existing address
      await handleUpdateAddress(e);
    } else {
      // Create new address
      try {
        setSubmitting(true);

        const response = await addressService.createAddress(addressData);
        console.log("✅ Address created:", response);

        if (response && response.success) {
          // Refresh addresses
          console.log("🔄 Refreshing addresses list...");
          const updatedResponse = await addressService.getUserAddresses();

          if (updatedResponse && updatedResponse.success) {
            console.log(
              "✅ Addresses refreshed:",
              updatedResponse.data?.length
            );
            setAddresses(updatedResponse.data || []);
            setSelectedAddressId(response.data._id);
            setShowAddressForm(false);

            // Reset form
            setAddressData({
              fullName: "",
              phone: "",
              street: "",
              city: "",
              state: "",
              country: "Việt Nam",
              isDefault: false,
            });
          } else {
            console.log("❌ Failed to refresh addresses");
            alert("Địa chỉ đã được tạo nhưng không thể tải lại danh sách.");
          }
        } else {
          console.log("❌ Failed to create address:", response);
          alert("Lỗi khi tạo địa chỉ. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("❌ Error creating address:", error);
        alert("Lỗi khi tạo địa chỉ. Vui lòng thử lại.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handle edit address
  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setIsEditing(true);
    setAddressData({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  // Handle update address
  const handleUpdateAddress = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      console.log("📝 Updating address:", editingAddressId, addressData);

      const response = await addressService.updateAddress(
        editingAddressId,
        addressData
      );
      console.log("✅ Address updated:", response);

      if (response && response.success) {
        // Refresh addresses
        console.log("🔄 Refreshing addresses list...");
        const updatedResponse = await addressService.getUserAddresses();

        if (updatedResponse && updatedResponse.success) {
          console.log("✅ Addresses refreshed:", updatedResponse.data?.length);
          setAddresses(updatedResponse.data || []);
          setSelectedAddressId(editingAddressId);
          setShowAddressForm(false);
          setIsEditing(false);
          setEditingAddressId(null);

          // Reset form
          setAddressData({
            fullName: "",
            phone: "",
            street: "",
            city: "",
            state: "",
            country: "Việt Nam",
            isDefault: false,
          });
        } else {
          console.log("❌ Failed to refresh addresses");
          alert("Địa chỉ đã được cập nhật nhưng không thể tải lại danh sách.");
        }
      } else {
        console.log("❌ Failed to update address:", response);
        alert("Lỗi khi cập nhật địa chỉ. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("❌ Error updating address:", error);
      alert("Lỗi khi cập nhật địa chỉ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      setSubmitting(true);
      console.log("🗑️ Deleting address:", addressId);

      const response = await addressService.deleteAddress(addressId);
      console.log("✅ Address deleted:", response);

      if (response && response.success) {
        // Refresh addresses
        console.log("🔄 Refreshing addresses list...");
        const updatedResponse = await addressService.getUserAddresses();

        if (updatedResponse && updatedResponse.success) {
          console.log("✅ Addresses refreshed:", updatedResponse.data?.length);
          setAddresses(updatedResponse.data || []);

          // If deleted address was selected, clear selection
          if (selectedAddressId === addressId) {
            setSelectedAddressId(null);
            if (updatedResponse.data && updatedResponse.data.length > 0) {
              // Auto select first address
              const firstAddress = updatedResponse.data[0];
              setSelectedAddressId(firstAddress._id);
              setAddressData({
                fullName: firstAddress.fullName,
                phone: firstAddress.phone,
                street: firstAddress.street,
                city: firstAddress.city,
                state: firstAddress.state,
                country: firstAddress.country,
                isDefault: firstAddress.isDefault,
              });
            }
          }
        } else {
          console.log("❌ Failed to refresh addresses");
          alert("Địa chỉ đã được xóa nhưng không thể tải lại danh sách.");
        }
      } else {
        console.log("❌ Failed to delete address:", response);
        alert("Lỗi khi xóa địa chỉ. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("❌ Error deleting address:", error);
      alert("Lỗi khi xóa địa chỉ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle set default address
  const handleSetDefaultAddress = async (addressId) => {
    try {
      setSubmitting(true);
      console.log("⭐ Setting default address:", addressId);

      const response = await addressService.setDefaultAddress(addressId);
      console.log("✅ Default address set:", response);

      if (response && response.success) {
        // Refresh addresses
        const updatedResponse = await addressService.getUserAddresses();

        if (updatedResponse && updatedResponse.success) {
          setAddresses(updatedResponse.data || []);
        }
      } else {
        alert("Lỗi khi đặt địa chỉ mặc định. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("❌ Error setting default address:", error);
      alert("Lỗi khi đặt địa chỉ mặc định. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddressData({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      country: "",
      isDefault: false,
    });
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    try {
      setSubmitting(true);

      const orderData = {
        items: items.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
        })),
        shippingAddress: selectedAddressId,
        paymentMethod,
        orderNotes,
        subtotal: totalPrice,
        shippingFee: 0,
        totalAmount: totalPrice,
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Clear cart
        await clearCart();

        // Navigate to success page with order data
        navigate("/order-success", {
          state: {
            orderData: {
              ...orderData,
              orderNumber: response.data._id,
              items: items,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Lỗi khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold">
            <i className="bi bi-credit-card me-2"></i>
            Checkout
          </h1>
          <p className="text-muted">
            Review your information and complete your order
          </p>
        </Col>
      </Row>

      <Row>
        {/* Left Column - Address & Order */}
        <Col lg={8} className="mb-4">
          {/* Address Selection */}
          {addresses.length > 0 && !showAddressForm && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-geo-alt me-2"></i>
                    Shipping Address
                  </h5>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <i className="bi bi-plus me-1"></i>
                    Add new address
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`p-3 border rounded mb-3 ${
                      selectedAddressId === address._id
                        ? "border-primary bg-light"
                        : ""
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div
                        className="flex-grow-1"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleAddressSelect(address)}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <Form.Check
                            type="radio"
                            name="selectedAddress"
                            checked={selectedAddressId === address._id}
                            onChange={() => handleAddressSelect(address)}
                            className="me-2"
                          />
                          <h6 className="fw-bold mb-0">{address.fullName}</h6>
                          {address.isDefault && (
                            <Badge bg="primary" className="ms-2">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="mb-1 text-muted">{address.street}</p>
                        <p className="mb-1 text-muted">
                          {address.city}, {address.state}, {address.country}
                        </p>
                        <p className="mb-0 text-muted">
                          <i className="bi bi-telephone me-1"></i>
                          {address.phone}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex flex-column gap-1 ms-3">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          disabled={submitting}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>


                        {addresses.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address._id);
                            }}
                            disabled={submitting}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

          {/* Address Form */}
          {showAddressForm && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-geo-alt me-2"></i>
                    {isEditing
                      ? "Edit Address"
                      : addresses.length === 0
                      ? "Add Shipping Address"
                      : "Add New Address"}
                  </h5>
                  {(addresses.length > 0 || isEditing) && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <i className="bi bi-x me-1"></i>
                      Cancel
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleAddressSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Fullname *</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={addressData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập họ và tên"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone number *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={addressData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập số điện thoại"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Street *</Form.Label>
                    <Form.Control
                      type="text"
                      name="street"
                      value={addressData.street}
                      onChange={handleInputChange}
                      required
                      placeholder="Số nhà, tên đường, phường/xã"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>City *</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={addressData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập thành phố"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>State *</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          value={addressData.state}
                          onChange={handleInputChange}
                          required
                          placeholder="Tỉnh/Thành phố"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Country *</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={addressData.country}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {addresses.length === 0 && (
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="isDefault"
                        checked={addressData.isDefault}
                        onChange={handleInputChange}
                        label="Đặt làm địa chỉ mặc định"
                      />
                    </Form.Group>
                  )}

                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check me-2"></i>
                          {isEditing ? "Edit" : "Save"}
                        </>
                      )}
                    </Button>
                    {(addresses.length > 0 || isEditing) && (
                      <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* No Address Message - Only show when no addresses and no form */}
          {addresses.length === 0 && !showAddressForm && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-warning">
                <h5 className="mb-0 text-white">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Chưa có địa chỉ giao hàng
                </h5>
              </Card.Header>
              <Card.Body className="text-center py-4">
                <i
                  className="bi bi-geo-alt text-muted mb-3"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h6 className="mb-3">Bạn chưa có địa chỉ giao hàng nào</h6>
                <p className="text-muted mb-3">
                  Vui lòng thêm địa chỉ giao hàng để tiếp tục đặt hàng
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowAddressForm(true)}
                >
                  <i className="bi bi-plus me-2"></i>
                  Thêm địa chỉ giao hàng
                </Button>
              </Card.Body>
            </Card>
          )}

          {/* Payment Method */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-credit-card me-2"></i>
                Payment Method
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <Form.Check
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label={
                      <div>
                        <i className="bi bi-cash text-success me-2"></i>
                        Cash on Delivery
                      </div>
                    }
                  />
                </div>

                <div className="col-md-6">
                  <Form.Check
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label={
                      <div>
                        <i className="bi bi-paypal text-danger me-2"></i>
                        Paypal
                      </div>
                    }
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Order Notes */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-chat-dots me-2"></i>
                Notes (Optional)
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Nhập ghi chú cho đơn hàng (nếu có)..."
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-bag me-2"></i>
                Your Order ({totalItems} items)
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {items.map((item) => (
                  <ListGroup.Item key={item._id} className="px-0">
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          item.productId?.images?.[0] ||
                          "https://via.placeholder.com/60"
                        }
                        alt={item.productId?.title}
                        className="rounded me-3"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.productId?.title}</h6>
                        <div className="text-muted small">
                          {formatPrice(item.priceAtTime)} × {item.quantity}
                        </div>
                      </div>
                      <div className="fw-bold">
                        {formatPrice(item.priceAtTime * item.quantity)}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Order Summary */}
        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Order Summary
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total items:</span>
                  <span>{totalItems} items</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span className="text-success">Free</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddressId || submitting}
                  className="fw-bold"
                >
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-credit-card me-2"></i>
                      Place Order Now
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/cart")}
                  disabled={submitting}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Cart
                </Button>
              </div>

              <Alert variant="info" className="mt-3 mb-0">
                <small>
                  <i className="bi bi-shield-check me-1"></i>
                  100% Secure and Safe Payment
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
