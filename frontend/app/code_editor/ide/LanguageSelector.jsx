import { Dropdown } from "react-bootstrap";
import { LANGUAGE_VERSIONS } from "../../../utils/CodeEditor/constants";

const languages = Object.entries(LANGUAGE_VERSIONS);

const languageMapping = {
    c: "C",
    cpp: "C++",
    csharp: "C#",
    java: "Java",
    javascript: "JavaScript",
    php: "PHP",
    python: "Python",
};

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <div className="mb-0 editor-header">
      <Dropdown>
        <Dropdown.Toggle className="dd-code" id="dropdown-language">
        {languageMapping[language] || "Language"}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {languages.map(([lang, version]) => (
            <Dropdown.Item
              key={lang}
              active={lang === language}
              onClick={() => onSelect(lang)}
            > 
              {languageMapping[lang]}
              &nbsp;
              <span style={{ fontSize: "smaller" }}>
                ({version})
              </span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default LanguageSelector;
