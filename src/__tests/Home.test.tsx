import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "../pages/Home";
import { ProductProvider } from "../context/ProductContext";
import { fetchProducts } from "../api/api";
import type { Product } from "../types/types";

// Home renders ProductCards, which pull in useAddToCart -> useCart. Mocking
// useCart directly (same pattern as ProductCard.test.tsx) keeps this test
// focused on Home's data-fetching behavior instead of the cart reducer.
jest.mock("../context/useCart", () => ({
  useCart: () => ({ items: [], dispatch: jest.fn() }),
}));

jest.mock("react-toastify", () => ({
  toast: { success: jest.fn() },
}));

// jsdom doesn't implement getBBox(), which @smastrom/react-rating needs.
jest.mock("@smastrom/react-rating", () => ({
  Rating: () => <div data-testid="mock-rating" />,
}));

jest.mock("../api/api", () => ({
  fetchProducts: jest.fn(),
}));

const mockProducts: Product[] = [
  {
    id: "1",
    title: "Test Product One",
    price: 9.99,
    description: "First test product.",
    category: "test-category",
    image: "https://example.com/one.jpg",
    rating: { rate: 4, count: 10 },
  },
  {
    id: "2",
    title: "Test Product Two",
    price: 19.99,
    description: "Second test product.",
    category: "other-category",
    image: "https://example.com/two.jpg",
    rating: { rate: 3.5, count: 5 },
  },
];

const renderHome = () => {
  // A fresh QueryClient per test avoids cache bleed between tests, and
  // disabling retries keeps a failing mock from retrying and slowing
  // the test down.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProductProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ProductProvider>
    </QueryClientProvider>,
  );
};

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchProducts as jest.Mock).mockResolvedValue(mockProducts);
  });

  /**
   * Regression test for a real bug from the Firebase feedback pass:
   * Home used to fetch the entire products collection a second time
   * (via a separate fetchCategories call) purely to build the category
   * filter dropdown. Categories are now derived locally from the same
   * products query instead of a second Firestore read -- if this ever
   * starts failing, that duplicate-read bug has come back.
   */
  it("fetches products only once per mount, even though the page also renders a category filter derived from them", async () => {
    const { findByText } = renderHome();

    // Waiting for the fetched product to actually render (rather than a
    // raw timeout) keeps this act()-aware -- it only resolves once React
    // has settled every effect from the resolved query, including the
    // SET_PRODUCTS dispatch and the categories useMemo, so a duplicate
    // fetch triggered by either of those would already have happened by
    // the time we check the call count below.
    await findByText("Test Product One");

    expect(fetchProducts).toHaveBeenCalledTimes(1);
  });
});
