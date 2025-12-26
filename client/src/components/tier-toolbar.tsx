import Button from "./button";
import IconButton from "./icon-button";

import { IoChevronBackOutline } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import OptionTierBadge from "./option-tier-badge";
import type { LineItemGroup } from "../app/types/line-item-group";
import type { PriceRange } from "../app/types/price-range";
import { getTierTotalSalePrice, formatNumberWithCommas } from "../util/utils";

type StickyTierToolbarProps = {
  handleSetIsOpen: (isOpen: boolean) => void;
  title: string;
  backButtonCallback?: () => void;
  lineItemGroups?: LineItemGroup[];
  estimatedTotal?: PriceRange | null;
  projectId?: string;
  areaId?: string;
  templateId?: string;
}

export default function StickyTierToolbar({ handleSetIsOpen,
  title,
  backButtonCallback = () => {
    window.history.back();
  },
  lineItemGroups = [],
  estimatedTotal,
  projectId,
  areaId,
  templateId,
}: StickyTierToolbarProps) {
  const navigate = useNavigate();
  const premierTotal = getTierTotalSalePrice(lineItemGroups, 1);
  const designerTotal = getTierTotalSalePrice(lineItemGroups, 2);
  const luxuryTotal = getTierTotalSalePrice(lineItemGroups, 3);

  const handleSettingsClick = () => {
    if (templateId) {
      navigate(`/settings/edit-template/${templateId}/settings`);
    } else if (projectId && areaId) {
      navigate(`/project/${projectId}/area/${areaId}/settings`);
    }
  };

  function formatPriceRange(priceRange: { lowPriceInDollars: number; highPriceInDollars: number }): string {
    const low = formatNumberWithCommas(priceRange.lowPriceInDollars);
    const high = formatNumberWithCommas(priceRange.highPriceInDollars);
    if (priceRange.lowPriceInDollars === priceRange.highPriceInDollars) {
      return `$${low}`;
    }
    return `$${low} - $${high}`;
  }
  return (
    <div className="flex flex-col bg-white pt-1 pb-1 sticky -top-4 z-50 border-b-2">
      <div className="flex flex-row justify-start items-center">
        <Button variant="white" onClick={backButtonCallback}>
          <IoChevronBackOutline />
        </Button>
        <div className="text-lg font-bold flex justify-center flex-grow">
          {title}
        </div>
        {(templateId || (projectId && areaId)) && (
          <IconButton
            icon={<IoMdSettings size={20} />}
            onClick={handleSettingsClick}
            title={templateId ? "Template Settings" : "Area Settings"}
            className="mr-2"
          />
        )}
      </div>
      <div className="grid grid-cols-5 gap-2 py-2 pl-4" style={{minWidth: "1150px"}}>
        <div>
          <Button size={"xs"} variant="white" onClick={() => handleSetIsOpen(true)}>
            <span className="text-gray-500 text-sm">Open All</span>
          </Button>
          <Button size={"xs"} variant="white" onClick={() => handleSetIsOpen(false)} >
            <span className="text-gray-500 text-sm">Close All</span>
          </Button>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div>
            <OptionTierBadge tier={{ id: "", name: "Premier", tierLevel: 1 }} />
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {formatPriceRange(premierTotal)}
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div>
            <OptionTierBadge tier={{ id: "", name: "Designer", tierLevel: 2 }} />
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {formatPriceRange(designerTotal)}
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div>
            <OptionTierBadge tier={{ id: "", name: "Luxury", tierLevel: 3 }} />
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {formatPriceRange(luxuryTotal)}
          </div>
        </div>
        <div className="flex flex-col justify-end items-end text-sm font-bold pr-4 border-l border-gray-100">
          <div>Estimated Total:</div>
          {estimatedTotal && (
            <div className="text-sm font-normal mt-2">
              {formatPriceRange(estimatedTotal)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
