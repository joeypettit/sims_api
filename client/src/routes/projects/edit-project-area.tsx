import { useParams } from "react-router-dom";
import ProjectAreaProposal from "../projects/project-area-proposal";

export default function EditProjectArea() {
  const { areaId } = useParams();

  return (
    <>
      <ProjectAreaProposal areaId={areaId} />
    </>
  );
}
