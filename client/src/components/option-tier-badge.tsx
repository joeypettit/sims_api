import { OptionTier } from "../app/types/option-tier";

type OptionTierBadgeProps = {
  tier: OptionTier;
};

export default function OptionTierBadge({ tier }: OptionTierBadgeProps) {
  // Define colors based on tier level
  const getBadgeColor = (tierLevel: number) => {
    switch (tierLevel) {
      case 1:
        return "bg-sims-premier text-white"; // Premium
      case 2:
        return "bg-sims-designer text-white"; // Designer
      case 3:
        return "bg-sims-luxury text-white"; // Luxury
      default:
        return "bg-gray-300 text-black"; // Default color
    }
  };

  return (
    <>
      {tier && (
        <span
          className={`px-2 py-1  flex justify-center items-center  bg-blue-500  rounded text-sm font-semibold ${getBadgeColor(
            tier.tierLevel
          )}`}
        >
          {tier.name}
        </span>
      )}
    </>
  );
}
