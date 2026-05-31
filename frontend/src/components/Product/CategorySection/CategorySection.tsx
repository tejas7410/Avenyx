import { Monitor, Keyboard, Mouse, Cpu, CircuitBoard, MemoryStick, Layers3 } from "lucide-react";

export const categories = [
  {
    name: "Monitor",
    image: "http://localhost:3000/uploads/84a50c00-c346-4277-af9e-a959f97a8ae2.jpg",
    icon: Monitor,
  },
  {
    name: "Keyboard",
    image: "http://localhost:3000/uploads/22bd2359-f74e-4dc3-a1f8-c6b2683582df.jpg",
    icon: Keyboard,
  },
  {
    name: "Mouse",
    image: "http://localhost:3000/uploads/2457ac45-3e96-486b-8ebb-3d30cbee05eb.jpg",
    icon: Mouse,
  },
  {
    name: "RAM",
    image: "http://localhost:3000/uploads/69ddf8e6-46ac-4da1-8ecb-a2e75fe25268.jpg",
    icon: MemoryStick,
  },
  {
    name: "Graphic Card",
    image: "http://localhost:3000/uploads/8d9583bd-dd2c-4f99-90ee-67e490ad6519.jpg",
    icon: Layers3,
  },
  {
    name: "Motherboard",
    image: "http://localhost:3000/uploads/684f73ac-482d-47e2-b5a8-1c0215f8dc56.jpg",
    icon: CircuitBoard,
  },
  {
    name: "Processor",
    image: "http://localhost:3000/uploads/88b68c71-4ee9-4377-a616-1d2bba43f0af.jpg",
    icon: Cpu,
  },
];

interface CategorySectionProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategorySection({
  selectedCategory,
  onCategoryChange,
}: CategorySectionProps) {
  const visibleCategories = [...categories, ...categories];

  return (
    <section className="mb-8 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-cyan-400">
            Shop By Category
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            Explore the marketplace
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onCategoryChange("all")}
          className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
            selectedCategory === "all"
              ? "border-cyan-400 bg-cyan-400 text-slate-950"
              : "border-slate-700 bg-slate-950 text-slate-200 hover:border-cyan-400"
          }`}
        >
          All Categories
        </button>
      </div>

      <div className="category-slider py-5">
        <div className="category-track flex w-max gap-4 px-5">
          {visibleCategories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.name;

            return (
              <button
                type="button"
                key={`${category.name}-${index}`}
                onClick={() => onCategoryChange(category.name)}
                className={`group relative h-40 w-56 shrink-0 overflow-hidden rounded-lg border text-left shadow-lg transition hover:-translate-y-1 ${
                  isSelected
                    ? "border-cyan-300 ring-2 ring-cyan-300/50"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-slate-950">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-base font-semibold text-white">
                    {category.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Browse {category.name.toLowerCase()} deals
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
