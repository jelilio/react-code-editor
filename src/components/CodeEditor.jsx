import { useEffect, useRef, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS, LANGUAGE_VERSIONS } from "../constants";
import Output from "./Output";
import { WS_URL, COMPILER_CHANNEL } from "../api";

const WS_CHANNEL_URL = `${WS_URL}/${COMPILER_CHANNEL}`;

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [websocketState, setWebsocketState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState(null);
  const [isError, setIsError] = useState(false);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_CHANNEL_URL,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  const options = {
    autoIndent: "full",
    contextmenu: true,
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 24,
    hideCursorInOverviewRuler: true,
    matchBrackets: "always",
    minimap: {
      enabled: true,
    },
    scrollbar: {
      horizontalSliderSize: 4,
      verticalSliderSize: 18,
    },
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: "line",
    automaticLayout: true,
  };

  // Run when the connection state (readyState) changes
  useEffect(() => {
    console.log("Connection state changed");
    setWebsocketState(readyState === ReadyState.OPEN);
  }, [readyState]);

  // Run when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    setIsLoading(false);
    // const {languageOutput} = lastJsonMessage;
    if (!lastJsonMessage) return;

    const { languageOutput } = lastJsonMessage;
    if (!languageOutput) return;

    const res = languageOutput[language];
    if (res) {
      const { isError, outputs } = res;
      setIsError(isError);
      setOutput(outputs);
    }
  }, [lastJsonMessage]);

  const executeCode = (language, sourceCode) => {
    const message = {
      language: language,
      version: LANGUAGE_VERSIONS[language],
      files: [
        {
          content: sourceCode,
        },
      ],
    };

    if (websocketState) {
      setIsLoading(true);
      setIsError(false);
      setOutput([]);
      sendJsonMessage(message);
    }
  };

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="60%">
          <HStack spacing={4}>
            <LanguageSelector language={language} onSelect={onSelect} />
          </HStack>
          <Editor
            options={options}
            height="75vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
          />
        </Box>
        <Output
          editorRef={editorRef}
          compilerOutput={output}
          language={language}
          executeCode={executeCode}
          isLoading={isLoading}
          isError={isError}
        />
      </HStack>
    </Box>
  );
};

export default CodeEditor;
