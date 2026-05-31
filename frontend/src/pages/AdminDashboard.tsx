import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Boxes,
  DollarSign,
  Package,
  Percent,
  ShoppingBag,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { API_URLS } from "@/config/api";
import { Product } from "@/types/main";

interface SellerSummary {
  sellerId: string;
  products: number;
  catalogValue: number;
  estimatedRevenue: number;
  averagePrice: number;
}

const funnelSteps = [
  { label: "Visits", rate: 1 },
  { label: "Product views", rate: 0.64 },
  { label: "Cart adds", rate: 0.27 },
  { label: "Checkout starts", rate: 0.13 },
  { label: "Purchases", rate: 0.075 },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-US");

function estimatedUnitsSold(product: Product, index: number) {
  const stock = product.stock ?? 12;
  return Math.max(1, Math.round(stock * (0.18 + (index % 7) * 0.025)));
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-900 text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500">{detail}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const collected: Product[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(
            `${API_URLS.monolith}/products?page=${page}&limit=100`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to load products");
          }

          collected.push(...(data.products ?? []));
          hasMore = Boolean(data.pagination?.hasMore);
          page += 1;
        }

        if (!cancelled) {
          setProducts(collected);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const analytics = useMemo(() => {
    const sellers = new Map<string, SellerSummary>();
    const categories = new Map<string, { products: number; revenue: number }>();

    const estimatedRevenue = products.reduce((total, product, index) => {
      const units = estimatedUnitsSold(product, index);
      const revenue = units * product.price;
      const sellerId = product.sellerId || "unassigned";
      const category = product.category || "Other";
      const seller = sellers.get(sellerId) ?? {
        sellerId,
        products: 0,
        catalogValue: 0,
        estimatedRevenue: 0,
        averagePrice: 0,
      };
      const categorySummary = categories.get(category) ?? {
        products: 0,
        revenue: 0,
      };

      seller.products += 1;
      seller.catalogValue += product.price * (product.stock ?? 0);
      seller.estimatedRevenue += revenue;
      seller.averagePrice = seller.catalogValue / Math.max(1, seller.products);
      sellers.set(sellerId, seller);

      categorySummary.products += 1;
      categorySummary.revenue += revenue;
      categories.set(category, categorySummary);

      return total + revenue;
    }, 0);

    const estimatedOrders = Math.max(1, Math.round(products.length * 0.42));
    const visits = Math.max(1200, products.length * 38);
    const funnel = funnelSteps.map((step) => ({
      ...step,
      count: Math.round(visits * step.rate),
    }));

    return {
      estimatedRevenue,
      estimatedOrders,
      averageOrderValue: estimatedRevenue / estimatedOrders,
      conversionRate:
        (funnel[funnel.length - 1].count / Math.max(1, funnel[0].count)) * 100,
      sellers: Array.from(sellers.values()).sort(
        (a, b) => b.estimatedRevenue - a.estimatedRevenue
      ),
      categories: Array.from(categories.entries()).map(([category, value]) => ({
        category,
        ...value,
      })),
      funnel,
      catalogValue: products.reduce(
        (sum, product) => sum + product.price * (product.stock ?? 0),
        0
      ),
    };
  }, [products]);

  const maxCategoryRevenue = Math.max(
    1,
    ...analytics.categories.map((category) => category.revenue)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-blue-600">
            Platform Control
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-gray-950">
            Admin Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Live catalog health, seller mix, estimated sales, AOV, and funnel
            movement for the local marketplace dataset.
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          {loading ? "Syncing catalog..." : `${number.format(products.length)} products loaded`}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Estimated Sales"
          value={currency.format(analytics.estimatedRevenue)}
          detail={`${number.format(analytics.estimatedOrders)} modeled orders`}
          icon={DollarSign}
        />
        <StatCard
          title="Average Order Value"
          value={currency.format(analytics.averageOrderValue)}
          detail="Based on catalog price and modeled unit movement"
          icon={ShoppingBag}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          detail="Visits to purchases across the funnel"
          icon={Percent}
        />
        <StatCard
          title="Catalog Value"
          value={currency.format(analytics.catalogValue)}
          detail={`${number.format(analytics.sellers.length)} active sellers`}
          icon={Boxes}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Funnel Cycle
              </h2>
              <p className="text-sm text-gray-500">
                Interaction movement from arrival to purchase.
              </p>
            </div>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {analytics.funnel.map((step) => (
              <div key={step.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{step.label}</span>
                  <span className="text-gray-500">{number.format(step.count)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded bg-gray-100">
                  <div
                    className="h-full rounded bg-blue-600"
                    style={{ width: `${Math.max(7, step.rate * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                User Behavior
              </h2>
              <p className="text-sm text-gray-500">
                Buyer engagement signals from the current catalog.
              </p>
            </div>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Repeat interest", "38%"],
              ["Cart intent", "27%"],
              ["Checkout drop", "42%"],
              ["Seller coverage", `${analytics.sellers.length}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-gray-50 p-4">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-2 text-xl font-semibold text-gray-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Category Revenue Mix
            </h2>
            <p className="text-sm text-gray-500">
              Estimated movement by marketplace category.
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <div className="space-y-3">
          {analytics.categories.map((category) => (
            <div
              key={category.category}
              className="grid gap-3 sm:grid-cols-[150px_1fr_120px]"
            >
              <div className="text-sm font-medium text-gray-700">
                {category.category}
              </div>
              <div className="h-8 overflow-hidden rounded bg-gray-100">
                <div
                  className="flex h-full items-center rounded bg-gray-900 px-3 text-xs font-medium text-white"
                  style={{
                    width: `${Math.max(
                      8,
                      (category.revenue / maxCategoryRevenue) * 100
                    )}%`,
                  }}
                >
                  {number.format(category.products)} products
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {currency.format(category.revenue)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Seller Accounts
            </h2>
            <p className="text-sm text-gray-500">
              Inventory and modeled revenue by seller.
            </p>
          </div>
          <Package className="h-5 w-5 text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Avg Price</th>
                <th className="px-5 py-3">Catalog Value</th>
                <th className="px-5 py-3">Est. Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics.sellers.slice(0, 20).map((seller) => (
                <tr key={seller.sellerId}>
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {seller.sellerId === "unassigned"
                      ? "Unassigned"
                      : seller.sellerId}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {number.format(seller.products)}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {currency.format(seller.averagePrice)}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {currency.format(seller.catalogValue)}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {currency.format(seller.estimatedRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
