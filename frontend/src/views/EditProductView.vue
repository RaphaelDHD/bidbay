<script setup>
import { useAuthStore } from "../store/auth";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();
const route = useRoute();

if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}

const productId = ref(route.params.productId);
const productName = ref("");
const productDescription = ref("");
const productCategory = ref("");
const productPrice = ref(0);
const productPicture = ref("");
const productEndDate = ref("");
const errorMessage = ref(null);
const isLoading = ref(false);
const errorStatus = ref(false);

const getProduct = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${productId.value}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Une erreur est survenue");
    }
    const data = await response.json();
    productName.value = data.name;
    productDescription.value = data.description;
    productCategory.value = data.category;
    productPrice.value = data.price;
    productPicture.value = data.pictureUrl;
    productEndDate.value = data.endDate.slice(0, 10);
  } catch (error) {
    errorMessage.value = error.message;
    errorStatus.value = true;
  } finally {
    isLoading.value = false;
  }
};

getProduct();

const submitForm = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${productId.value}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify({
          name: productName.value,
          description: productDescription.value,
          category: productCategory.value,
          price: productPrice.value,
          pictureUrl: productPicture.value,
          endDate: productEndDate.value,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Une erreur est survenue");
    }
    router.push({ name: "Product", params: { productId: productId.value } });
  } catch (e) {
    errorMessage.value = e.message;
    errorStatus.value = true
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <h1 class="text-center">Modifier un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="submitForm">
        <div v-if="errorStatus" class="alert alert-danger mt-4" role="alert" data-test-error>
          {{ errorMessage }}
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input
            type="text"
            class="form-control"
            id="product-name"
            v-model="productName"
            data-test-product-name
            required
          />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea
            class="form-control"
            id="product-description"
            name="description"
            rows="3"
            v-model="productDescription"
            data-test-product-description
            required
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
            type="text"
            class="form-control"
            id="product-category"
            v-model="productCategory"
            data-test-product-category
            required
          />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="product-original-price"
              name="originalPrice"
              step="1"
              min="0"
              v-model="productPrice"
              data-test-product-price
              required
            />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input
            type="url"
            class="form-control"
            id="product-picture-url"
            name="pictureUrl"
            v-model="productPicture"
            data-test-product-picture
            required
          />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input
            type="date"
            class="form-control"
            id="product-end-date"
            name="endDate"
            v-model="productEndDate"
            data-test-product-end-date
            required
          />
        </div>

        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-primary" :disabled="isLoading" data-test-submit>
            Modifier le produit
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              data-test-spinner
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
