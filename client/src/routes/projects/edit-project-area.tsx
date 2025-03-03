import { useParams } from "react-router-dom";
import ProjectAreaProposal from "../projects/project-area-proposal";
import PanelHeaderBar from "../../components/page-header-bar";

export default function EditProjectArea() {
  const { areaId } = useParams();

  return (
    <>
      <ProjectAreaProposal areaId={areaId} />
    </>
  );
}
