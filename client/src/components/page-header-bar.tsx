import { IoChevronBackOutline } from "react-icons/io5";
import Button from "./button";

type PanelHeaderBarProps = {
  title?: string;
  backButtonCallback?: () => void;
  children?: React.ReactNode;
};

export default function PanelHeaderBar({
  title,
  backButtonCallback = () => {
    window.history.back();
  },
  children
}: PanelHeaderBarProps) {
  return (
    <div className="flex flex-row items-center justify-between w-full">
      <div className="flex flex-row items-center gap-6">
        <Button variant="white" onClick={backButtonCallback}>
          <IoChevronBackOutline />
        </Button>
        <h1 className="font-bold">{title}</h1>
      </div>
      {children}
    </div>
  );
}
