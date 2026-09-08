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
});
