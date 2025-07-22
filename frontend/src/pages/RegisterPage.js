import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import emailjs from "@emailjs/browser";
import { useFormik } from "formik";
import * as Yup from "yup";

// 📌 API Endpoint Constants
const API_BASE_URL = "http://localhost:9999";
const REGISTER_API = "/auth/register";
const VERIFY_CODE_API = "/auth/verify-code";
const RESEND_VERIFICATION_API = "/auth/resend-verification";
const GOOGLE_LOGIN_API = "/auth/google-login";

export default function RegisterPage() {
  const [isVerification, setIsVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
  });

  const sendVerificationEmail = useCallback(async (email, verificationCode) => {
    try {
      await emailjs.send(
        "service_nrr3tw2",
        "template_abotd4t",
        {
          to: email,
          subject: "Mã xác minh tài khoản",
          message: verificationCode,
        },
        "OEj4kkgxdJXtWCV0_"
      );
      return true;
    } catch (err) {
      console.error("Failed to send verification email:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("verified") === "true") {
      setSuccess("Email xác minh thành công! Vui lòng đăng nhập.");
      setIsVerification(false);
    }
  }, [location]);

  const validationSchema = Yup.object().shape(
    isVerification
      ? {
          verificationCode: Yup.string()
            .matches(/^\d{6}$/, "Mã xác minh phải là 6 chữ số.")
            .required("Nhập mã xác minh."),
        }
      : {
          username: Yup.string()
            .required("Nhập tên người dùng.")
            .test("no-space", "Tên người dùng không được chứa khoảng trắng.", (val) => !/\s/.test(val)),
          email: Yup.string().email("Email không hợp lệ.").required("Nhập email."),
          password: Yup.string().required("Nhập mật khẩu."),
        }
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: "",
      email: "",
      password: "",
      verificationCode: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setError("");
      setSuccess("");
      setLoading(true);

      try {
        if (isVerification) {
          const res = await api.post(VERIFY_CODE_API, {
            email: values.email.toLowerCase().trim(),
            verificationToken: values.verificationCode,
          });
          const { token, user } = res.data;
          localStorage.setItem("token", token);
          localStorage.setItem("currentUser", JSON.stringify(user));
          navigate(user.role === "admin" ? "/adminDashboard" : "/profile");
        } else {
          const res = await api.post(REGISTER_API, {
            username: values.username,
            email: values.email.toLowerCase().trim(),
            password: values.password,
          });
          const { verificationToken } = res.data;
          const sent = await sendVerificationEmail(values.email, verificationToken);
          if (!sent) throw new Error("Không thể gửi email xác minh.");
          setSuccess("Đăng ký thành công! Kiểm tra email để lấy mã.");
          setIsVerification(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleResendVerification = async () => {
    if (!formik.values.email) {
      setError("Vui lòng nhập email để gửi lại mã xác minh.");
      return;
    }
    setResendLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post(RESEND_VERIFICATION_API, {
        email: formik.values.email.toLowerCase().trim(),
      });
      const { verificationToken } = res.data;
      const sent = await sendVerificationEmail(formik.values.email, verificationToken);
      if (sent) setSuccess("Mã xác minh đã được gửi lại.");
    } catch (err) {
      setError(err.response?.data?.message || "Gửi lại mã thất bại.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="w-full flex justify-center p-5 border-b">
        <a href="/">
          <img src="/images/logo.svg" alt="Logo" width="170" />
        </a>
      </div>

      <div className="w-full flex justify-center p-5">
        <h2 className="text-xl font-semibold text-blue-600">Đăng ký</h2>
      </div>

      <div className="max-w-[400px] mx-auto px-4">
        {error && <div className="text-red-500 text-center mb-2">{error}</div>}
        {success && <div className="text-green-500 text-center mb-2">{success}</div>}

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          {isVerification ? (
            <>
              <input
                type="text"
                name="verificationCode"
                placeholder="Mã xác minh (6 số)"
                maxLength="6"
                value={formik.values.verificationCode}
                onChange={formik.handleChange}
                className="border p-3 rounded"
              />
              {formik.touched.verificationCode && formik.errors.verificationCode && (
                <div className="text-red-500 text-sm">{formik.errors.verificationCode}</div>
              )}
              <button type="submit" disabled={loading} className="bg-blue-600 text-white p-3 rounded">
                {loading ? "Đang xử lý..." : "Xác minh"}
              </button>
              <button
                type="button"
                disabled={resendLoading}
                onClick={handleResendVerification}
                className="bg-gray-600 text-white p-3 rounded"
              >
                {resendLoading ? "Đang gửi lại..." : "Gửi lại mã"}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                name="username"
                placeholder="Tên người dùng"
                value={formik.values.username}
                onChange={formik.handleChange}
                className="border p-3 rounded"
              />
              {formik.touched.username && formik.errors.username && (
                <div className="text-red-500 text-sm">{formik.errors.username}</div>
              )}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className="border p-3 rounded"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm">{formik.errors.email}</div>
              )}
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={formik.values.password}
                onChange={formik.handleChange}
                className="border p-3 rounded"
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-sm">{formik.errors.password}</div>
              )}
              <button type="submit" disabled={loading} className="bg-blue-600 text-white p-3 rounded">
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </>
          )}

          <GoogleOAuthProvider clientId="332875983693-h8d4d5h7aip186nfa1f7sccvln79h053.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={async (res) => {
                const { email, name, picture } = jwtDecode(res.credential);
                const response = await api.post(GOOGLE_LOGIN_API, { email, name, avatarURL: picture });
                const { token, user } = response.data;
                localStorage.setItem("token", token);
                localStorage.setItem("currentUser", JSON.stringify(user));
                navigate(user.role === "admin" ? "/adminDashboard" : "/profile");
              }}
              onError={() => setError("Đăng nhập Google thất bại.")}
            />
          </GoogleOAuthProvider>
        </form>
      </div>
    </div>
  );
}
