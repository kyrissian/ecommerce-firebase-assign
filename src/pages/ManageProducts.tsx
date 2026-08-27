import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/api";
import type { Product } from "../types/types";

/**
 * Admin-style page for managing products directly in Firestore.
 *
 * Supports full CRUD: Create (via the "Add New Product" form), Read
 * (the list itself), Update (Edit button swaps a list item into an
 * editable form pre-filled with its current values), and Delete.
 */
const ManageProducts: React.FC = () => {
  // Gives us access to React Query's cache, so mutations (create/update/
  // delete) can tell React Query "the products list is now stale, go
  // refetch it" -- keeping this page and Home.tsx in sync automatically.
  const queryClient = useQueryClient();

  // Reuses the same queryKey ("products") that Home.tsx uses, so both
  // pages share the same cached data under the hood.
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Holds the values currently typed into the "add product" form.
  // Starts empty; resets back to this after a successful submission.
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    title: "",
    price: 0,
    description: "",
    category: "",
    image: "",
    rating: { rate: 0, count: 0 },
  });

  // Tracks which product (if any) is currently being edited. null means
  // "not editing anything right now" -- the presence of a product here
  // is what tells the UI to show an edit form instead of the normal
  // title/price display for that item.
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Handles the actual Firestore write when the "add product" form is
  // submitted. useMutation (unlike useQuery) is for actions that change
  // data, not just read it.
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Tell React Query the "products" data is now stale, so it
      // refetches automatically -- this is what makes the new product
      // show up in the list (and on Home.tsx) without a manual refresh.
      queryClient.invalidateQueries({ queryKey: ["products"] });

      // Reset the form back to empty, ready for the next entry.
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

  // Handles removing a product from Firestore when its Delete button is
  // clicked. Same invalidateQueries pattern as createMutation, so the
  // list (and Home.tsx) update automatically once the deletion succeeds.
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Handles saving changes when an edit is submitted. Unlike
  // createProduct (which only takes the new product data) and
  // deleteProduct (which only takes an id), updateProduct needs both --
  // so we pass an object containing both pieces, and mutationFn
  // destructures them apart again before calling the real function.
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });

      // Editing is done -- clear editingProduct so the UI switches back
      // to showing the normal (non-edit) list item.
      setEditingProduct(null);
    },
  });

  return (
    <div className="manage-products-page">
      <h1>Manage Products</h1>

      {isLoading && <p>Loading products...</p>}
      {error && <p>Error loading products.</p>}

      <form
        className="add-product-form"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate(newProduct);
        }}
      >
        <h2>Add New Product</h2>

        <label htmlFor="title">Title:</label>
        <input
          id="title"
          value={newProduct.title}
          onChange={(e) =>
            setNewProduct({ ...newProduct, title: e.target.value })
          }
        />

        <label htmlFor="price">Price:</label>
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

        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
        />

        <label htmlFor="category">Category:</label>
        <input
          id="category"
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
        />

        <label htmlFor="image">Image URL:</label>
        <input
          id="image"
          value={newProduct.image}
          onChange={(e) =>
            setNewProduct({ ...newProduct, image: e.target.value })
          }
        />

        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Adding..." : "Add Product"}
        </button>
      </form>

      <ul className="product-management-list">
        {products?.map((product: Product) => (
          <li key={product.id}>
            {editingProduct?.id === product.id ? (
              // This product is currently being edited -- show the full
              // edit form, pre-filled with its existing values.
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate({
                    id: editingProduct.id,
                    updates: editingProduct,
                  });
                }}
              >
                <label htmlFor="edit-title">Title:</label>
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

                <label htmlFor="edit-price">Price:</label>
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

                <label htmlFor="edit-description">Description:</label>
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

                <label htmlFor="edit-category">Category:</label>
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

                <label htmlFor="edit-image">Image URL:</label>
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

                <button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setEditingProduct(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              // Normal (non-edit) display.
              <>
                <span>{product.title}</span> — <span>${product.price}</span>
                <button onClick={() => setEditingProduct(product)}>Edit</button>
                <button onClick={() => deleteMutation.mutate(product.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageProducts;
