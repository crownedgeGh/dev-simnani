import Link from "next/link";
import {
  MdApartment,
  MdMeetingRoom,
  MdStorefront,
  MdLocationCity,
  MdAgriculture,
  MdTerrain,
  MdWarehouse,
  MdAcUnit,
  MdFactory,
  MdHotel,
  MdHome,
  MdPark,
  MdWaterDrop,
  MdCategory,
  MdEco,
  MdLocalFlorist,
  MdForest,
  MdPets,
  MdWaves,
  MdEgg,
  MdGrass,
} from "react-icons/md";

const ICONS = {
  MdApartment,
  MdMeetingRoom,
  MdStorefront,
  MdLocationCity,
  MdAgriculture,
  MdTerrain,
  MdWarehouse,
  MdAcUnit,
  MdFactory,
  MdHotel,
  MdHome,
  MdPark,
  MdWaterDrop,
  MdCategory,
  MdEco,
  MdLocalFlorist,
  MdForest,
  MdPets,
  MdWaves,
  MdEgg,
  MdGrass,
};

export default function CommercialCategories({ categories, propertiesByCategory, basePath = "/commercial" }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = ICONS[category.icon] ?? MdCategory;
        const count = propertiesByCategory[category.key]?.length ?? 0;

        return (
          <Link
            key={category.key}
            href={`${basePath}/${category.key}`}
            className="group flex min-h-[44px] flex-col items-start gap-3 border border-navy-700/60 bg-navy-900 p-4 text-left transition hover:border-gold-500/50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-700/60 text-gold-400 transition group-hover:border-gold-500/50">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm text-cream">{category.label}</span>
              <span className="tracked-label mt-1 block text-[10px] text-muted">
                {count} Listing{count === 1 ? "" : "s"}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
