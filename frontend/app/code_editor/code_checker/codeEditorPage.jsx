import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import Output from "../ide/Output";
// import { CODE_SNIPPETS } from "./constants";
// import "./ide.css";

const CodeEditorPage = ({
//   language,
//   challengeContent,
//   missingBugCode,
//   selectedType,
//   onBackClick,
//   backToMainComponent
}) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  // Scroll to top handler
  const handleScrollTop = () => {
    if (editorRef.current) {
      editorRef.current.setScrollPosition({ scrollTop: 0 });
    }
  };

//   useEffect(() => {
//     if (missingBugCode === "missing_code" || missingBugCode === "bug_finding") {
//       setShow(true);
//     } else {
//       setShow(false);
//     }
//   }, [missingBugCode]);

  return (
    <div className="editor-cover">
      <div className="editor-code">
        <button className="btn btn-sroll-top" onClick={handleScrollTop}>
          <i className="fa fa-chevron-up"></i> 
        </button>
        <div className="e-title">
          {/* {selectedType === "new_code" && (
            <div className="me-2">
              <img
                src="/assets/images/box-arrow-left.svg"
                alt="Back"
                style={{ cursor: "pointer" }}
                onClick={onBackClick}
                width="20"
                height="20"
              />
            </div>
          )} */}

          <div className="fw700 fz20 label">Online Editor ~ </div>
          <p className="mb-0 fz16">
            Type your code here and click "Run" to check output.
          </p>
        </div>

        <Editor
          options={{
            minimap: {
              enabled: true,
            },
          }}
          theme="vs-dark"
        //   language={language}
        //   defaultValue={CODE_SNIPPETS[language]}
          onMount={onMount}
        //   value={
        //     show
        //       ? challengeContent
        //       : !show
        //       ? value || CODE_SNIPPETS[language]
        //       : CODE_SNIPPETS[language]
        //   }
        //   onChange={(value) => setValue(value)}
          className="edit-section"
        />
      </div>

      <Output
        // editorRef={editorRef}
        // language={language}
        // challengeContent={challengeContent}
        // selectedType={selectedType}
        // backToMainComponent={backToMainComponent}
      />
    </div>
  );
};

export default CodeEditorPage;
