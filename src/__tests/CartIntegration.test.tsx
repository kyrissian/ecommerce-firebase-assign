import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Cart from "../pages/Cart";
import type { Product } from "../types/types";

// Avoid real toast DOM side effects during tests
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn() },
}));

// jsdom doesn't implement getBBox(), which @smastrom/react-rating needs
// for layout -- mock it out since we're not testing star ratings here.
jest.mock("@smastrom/react-rating", () => ({
  Rating: () => <div data-testid="mock-rating" />,
}));

const mockProduct: Product = {
  id: "1",
  title: "Integration Test Product",
  price: 25.0,
  image: "https://example.com/image.jpg",
  category: "test-category",
  description: "A product used for integration testing.",
  rating: { rate: 4.0, count: 50 },
};

describe("Cart integration", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("adding a product from ProductCard updates the Cart", () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
          <Cart />
        </CartProvider>
      </MemoryRouter>,
    );

    // Cart starts empty
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();

    // Add the product
    fireEvent.click(screen.getByText("Add to Cart"));

    // Cart should now reflect the real, non-mocked reducer state
    expect(screen.getAllByText("Integration Test Product")).toHaveLength(2);
    expect(screen.getByText("Total items: 1")).toBeInTheDocument();

    // Adding the same product again should increment quantity, not duplicate
    fireEvent.click(screen.getByText("Add to Cart"));
    expect(screen.getByText("Total items: 2")).toBeInTheDocument();
  });

  test("removing a product from the Cart removes it from the cart", () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
          <Cart />
        </CartProvider>
      </MemoryRouter>,
    );

    // Add the product first
    fireEvent.click(screen.getByText("Add to Cart"));
    expect(screen.getAllByText("Integration Test Product")).toHaveLength(2);

    // Remove it
    fireEvent.click(screen.getByText("Remove"));

    // Cart should be empty again, and the product should no longer appear in it
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    expect(screen.getAllByText("Integration Test Product")).toHaveLength(1); // only in ProductCard now
  });
});
