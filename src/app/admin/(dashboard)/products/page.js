import { ProductsClient } from "@/components/admin/products/ProductsClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getCategories } from "@/services/categories/category-query.service";
import { getProducts } from "@/services/products/product-query.service";

export const metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  const admin = await requireAdminPagePermission(
    ADMIN_PERMISSIONS.PRODUCTS_VIEW,
  );

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({
      limit: 25,
      cursor: undefined,
      status: undefined,
      categoryId: undefined,
      productTypeSlug: undefined,
      standard: undefined,
      featured: undefined,
      showOnHome: undefined,
      fireRated: undefined,
      search: undefined,
    }),

    getCategories({
      limit: 100,
      cursor: undefined,
      status: undefined,
      featured: undefined,
      showOnHome: undefined,
      search: undefined,
    }),
  ]);

  return (
    <ProductsClient
      initialItems={productsResult.items}
      initialPagination={productsResult.pagination}
      categories={categoriesResult.items}
      canCreate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.PRODUCTS_CREATE,
      )}
      canUpdate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.PRODUCTS_UPDATE,
      )}
      canDelete={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.PRODUCTS_DELETE,
      )}
    />
  );
}
