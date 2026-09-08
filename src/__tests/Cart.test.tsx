import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cart from "../pages/Cart";
import type { CartItem } from "../types/types";

const mockDispatch = jest.fn();
let mockItems: CartItem[] = [];

jest.mock("../context/useCart", () => ({
  useCart: () => ({ items: mockItems, dispatch: mockDispatch }),
}));

describe("Cart", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockItems = [];
  });

  test("shows empty cart state when there are no items", () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>,
    );

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  test("clicking '+' dispatches UPDATE_QUANTITY with incremented quantity", () => {
    mockItems = [
      {
        id: "1",
        title: "Test Product",
        price: 19.99,
        image: "https://example.com/image.jpg",
        category: "test-category",
        description: "A product used for testing.",
        rating: { rate: 4.5, count: 100 },
        quantity: 1,
      },
    ];

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText("Increase quantity"));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "UPDATE_QUANTITY",
      payload: { id: "1", quantity: 2 },
    });
  });
});
