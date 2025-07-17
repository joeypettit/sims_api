import { DraggableProvided } from "@hello-pangea/dnd";
import { RiDraggable } from "react-icons/ri";
import { ReactNode } from "react";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";

export default function CollapsibleDiv({
  title,
  price,
  isOpen,
  setIsOpen,
  provided,
  children,
}: {
  title: string;
  price: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  provided: DraggableProvided
  children: ReactNode;
}) {

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="py-2 border border-gray-200 border-t-gray-100  border-l-0 border-t-1 border-b-2 border-r-0 rounded-lg">
      <div
        className="flex justify-start items-center cursor-pointer"
      >
        <div {...provided.dragHandleProps} className="p-1 hover:bg-sims-green-50 rounded-e"><RiDraggable /></div>
        <div onClick={toggleCollapse} className="w-full flex justify-between">
          <div className="ps-1">                 
            <h2 className="text-md font-bold">{title}</h2>
          </div>
          <div className="flex flex-row pe-2">
            {!isOpen && <h2 className="text-sm font-bold">{price}</h2>}
            <button className="focus:outline-none">
              {isOpen ? (
                <span>
                  <MdKeyboardArrowUp />
                </span>
              ) : (
                <span>
                  <MdKeyboardArrowDown />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* {isOpen && <hr className=" border-gray-200" />} */}
      <div
        className={`transition-all duration-300 ease-in-out  ${isOpen ? "" : "max-h-0 overflow-hidden"
          }`}
      >
        {isOpen && <div className="">{children}</div>}
      </div>
    </div>
  );
}
