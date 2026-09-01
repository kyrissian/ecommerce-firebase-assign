import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/api";
import type { Product } from "../types/types";
import { toast } from "react-toastify";
import "./ManageProducts.css";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

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
      toast.success("Product added.");
    },
    onError: () => {
      toast.error("Failed to add product. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.info("Product deleted.");
    },
    onError: () => {
      toast.error("Failed to delete product. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
      toast.success("Product updated.");
    },
    onError: () => {
      toast.error("Failed to update product. Please try again.");
    },
  });

  const validateProduct = (product: Omit<Product, "id">): boolean => {
    if (
      !product.title.trim() ||
      !product.description.trim() ||
      !product.category.trim() ||
      !product.image.trim()
    ) {
      toast.error("Please fill in every field.");
      return false;
    }
    if (!product.price || product.price <= 0) {
      toast.error("Price must be greater than 0.");
      return false;
    }
    return true;
  };

  return (
    <div className="manage-products-page">
      <h1>Manage Products</h1>

      <div className="manage-products-layout">
        <form
          className="add-product-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateProduct(newProduct)) return;
            createMutation.mutate(newProduct);
          }}
        >
          <h2>Add New Product</h2>

          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              required
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
              min="0.01"
              required
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
              required
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
              required
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
              required
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
                      if (!validateProduct(editingProduct)) return;
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
                        required
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
                        min="0.01"
                        required
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
                        required
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
                        required
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
                        required
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
