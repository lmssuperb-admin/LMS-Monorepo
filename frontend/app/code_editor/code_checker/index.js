import { useEffect } from "react";
import HeaderBar from "../../../common/HeaderBar";
import SideBar from "../../../common/SideBar";
import CodeEditorPage from "./codeEditorPage";

const Codechecker = () => {
  useEffect(()=>{
localStorage.removeItem("pdfData");
  },[])
  return (
    <main className="ff2 main-page">
      <HeaderBar />
      <div className="overflow-hidden inner-page-content inner-page-content--aira-chat">
        <SideBar />
        <CodeEditorPage />
      </div>
    </main>
  );
};

export default Codechecker;
