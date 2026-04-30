import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS } from "./constants";
import Output from "./Output";
import { ChevronUp, Code2, Info } from "lucide-react";
import "./ide.css";

const CodeEditor = ({
  language,
  challengeContent,
  missingBugCode,
  selectedType,
  onBackClick,
  backToMainComponent
}) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleScrollTop = () => {
    if (editorRef.current) {
      editorRef.current.setScrollPosition({ scrollTop: 0 });
    }
  };

  useEffect(() => {
    if (missingBugCode === "missing_code" || missingBugCode === "bug_finding") {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [missingBugCode]);

  return (
    <div className="editor-cover">
      <div className="editor-code">
        <button className="icon-btn scroll-top-btn" onClick={handleScrollTop} title="Scroll to Top">
          <ChevronUp size={16} />
        </button>
        <div className="e-title">
          <div className="title-left">
            <Code2 size={18} className="text-primary" />
            <span className="label ms-2">Online IDE</span>
          </div>
          <div className="title-right d-none d-md-flex align-items-center gap-2">
            <Info size={14} className="text-muted" />
            <span className="text-muted small">Write code & click Run</span>
          </div>
        </div>

        <Editor
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            padding: { top: 16, bottom: 50 },
            fontFamily: "'Fira Code', monospace",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
          theme="vs-dark"
          language={language}
          defaultValue={CODE_SNIPPETS[language]}
          onMount={onMount}
          value={
            show
              ? challengeContent
              : !show
                ? value || CODE_SNIPPETS[language]
                : CODE_SNIPPETS[language]
          }
          onChange={(value) => setValue(value)}
          className="edit-section"
        />
      </div>

      <Output
        editorRef={editorRef}
        language={language}
        challengeContent={challengeContent}
        selectedType={selectedType}
        backToMainComponent={backToMainComponent}
      />
    </div>
  );
};

export default CodeEditor;
