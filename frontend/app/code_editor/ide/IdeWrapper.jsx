import CodeEditor from "./CodeEditor"; 
import './ide.css';

const IdeWrapper = () => {
  return (
    <div className="ide-cover" >
      <CodeEditor />
    </div>

  );
}

export default IdeWrapper;