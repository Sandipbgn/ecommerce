import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-300">
              We are dedicated to providing the best quality products at
              competitive prices. Our mission is to make online shopping easy,
              secure, and enjoyable.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-300 hover:text-white"
                >
                  Products
                </Link>
              </li>
              <li>
                <a href="/cart" className="text-gray-300 hover:text-white">
                  Cart
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <address className="not-italic text-gray-300">
              <p>123 E-commerce Street</p>
              <p>Shopping District, SP 12345</p>
              <p className="mt-2">Email: info@eshop.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} E-Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
