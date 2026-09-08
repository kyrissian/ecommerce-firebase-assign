import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/types";

// Mock useCart so this stays a true unit test -- isolated from the real reducer
const mockDispatch = jest.fn();
jest.mock("../context/useCart", () => ({
  useCart: () => ({ items: [], dispatch: mockDispatch }),
}));

// Avoid real toast DOM side effects during tests
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn() },
}));

jest.mock("@smastrom/react-rating", () => ({
  Rating: () => <div data-testid="mock-rating" />,
}));

const mockProduct: Product = {
  id: "1",
  title: "Test Product",
  price: 19.99,
  image: "https://example.com/image.jpg",
  category: "test-category",
  description: "A product used for testing.",
  rating: { rate: 4.5, count: 100 },
};

describe("ProductCard", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  test("renders product title, price, and category", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
    expect(screen.getByText("TEST-CATEGORY")).toBeInTheDocument();
  });

  test("clicking 'Add to Cart' dispatches ADD_TO_CART with the product", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Add to Cart"));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "ADD_TO_CART",
      payload: mockProduct,
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});
