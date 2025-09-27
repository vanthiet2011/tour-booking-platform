import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary to-ocean text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold">VietTravel</span>
            </div>
            <p className="text-white/80 mb-4">
              Đồng hành cùng bạn khám phá vẻ đẹp Việt Nam với dịch vụ chuyên
              nghiệp và tận tâm.
            </p>
            <div className="flex gap-4">
              <Facebook className="h-5 w-5 hover:text-sand cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 hover:text-sand cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 hover:text-sand cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Hướng dẫn đặt tour
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Tour trong nước
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Tour quốc tế
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Đặt khách sạn
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Vé máy bay
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-sand" />
                <span className="text-white/80 text-sm">
                  123 Nguyễn Huệ, Q.1, TP.HCM
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-sand" />
                <span className="text-white/80 text-sm">1900 2087</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-sand" />
                <span className="text-white/80 text-sm">
                  info@viettravel.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/60">
            © 2024 VietTravel. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
