import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/api";
import type { Product } from "../types/types";
import "./ManageProducts.css";

/**
 * Admin-style page for managing products directly in Firestore.
 *
 * Two-column layout: "Add New Product" form as a sticky sidebar on the
 * left, product list (with search + category filter) on the right.
 * Supports full CRUD -- Create, Read, Update (Edit swaps a row into an
 * editable form), and Delete (with a confirmation prompt).
 */
const ManageProducts: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    title: "",
    price: 0,
    description: "",
    category: "",
    image: "",
    rating: { rate: 0, count: 0 },
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search text and category filter for the product list -- both
  // client-side, filtering whatever's already loaded rather than
  // re-querying Firestore on every keystroke.
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Derives the list of unique categories directly from the already-
  // loaded products, same technique as fetchCategories() in api.ts,
  // just done client-side here since we already have the full list.
  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  // Recalculates only when products, searchTerm, or filterCategory
  // actually change, rather than filtering on every render.
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !filterCategory || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setNewProduct({
        title: "",
        price: 0,
        description: "",
        category: "",
        image: "",
        rating: { rate: 0, count: 0 },
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    },
  });

  return (
    <div className="manage-products-page">
      <h1>Manage Products</h1>

      <div className="manage-products-layout">
        <form
          className="add-product-form"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(newProduct);
          }}
        >
          <h2>Add New Product</h2>

          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={newProduct.title}
              onChange={(e) =>
                setNewProduct({ ...newProduct, title: e.target.value })
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  price: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="image">Image URL</label>
            <input
              id="image"
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
            />
          </div>

          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Add Product"}
          </button>
        </form>

        <div className="product-list-panel">
          <div className="product-list-controls">
            <input
              className="product-search"
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="product-category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {isLoading && <p>Loading products...</p>}
          {error && <p>Error loading products.</p>}
          {filteredProducts.length === 0 && !isLoading && (
            <p>No products match your search.</p>
          )}

          <ul className="product-management-list">
            {filteredProducts.map((product: Product) => (
              <li key={product.id}>
                {editingProduct?.id === product.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateMutation.mutate({
                        id: editingProduct.id,
                        updates: editingProduct,
                      });
                    }}
                  >
                    <div className="form-field">
                      <label htmlFor="edit-title">Title</label>
                      <input
                        id="edit-title"
                        value={editingProduct.title}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="edit-price">Price</label>
                      <input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="edit-description">Description</label>
                      <textarea
                        id="edit-description"
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="edit-category">Category</label>
                      <input
                        id="edit-category"
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="edit-image">Image URL</label>
                      <input
                        id="edit-image"
                        value={editingProduct.image}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            image: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="edit-form-actions">
                      <button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <img
                      src={product.image}
                      alt={product.title}
                      className="product-management-image"
                    />
                    <span>{product.title}</span>
                    <span>${product.price.toFixed(2)}</span>
                    <button onClick={() => setEditingProduct(product)}>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Delete "${product.title}"? This cannot be undone.`,
                        );
                        if (confirmed) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
