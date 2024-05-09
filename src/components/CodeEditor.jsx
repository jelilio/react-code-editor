import { useEffect, useRef, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS, LANGUAGE_VERSIONS } from "../constants";
import Output from "./Output";
import { executeCode, WS_URL, COMPILER_CHANNEL } from "../api";

const WS_CHANNEL_URL =  `${WS_URL}/${COMPILER_CHANNEL}`

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [websocketState, setWebsocketState] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState(null);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_CHANNEL_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  const options = {
    autoIndent: 'full',
    contextmenu: true,
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 24,
    hideCursorInOverviewRuler: true,
    matchBrackets: 'always',
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
    cursorStyle: 'line',
    automaticLayout: true,
  };

  // Run when the connection state (readyState) changes
  useEffect(() => {
    console.log("Connection state changed")
    setWebsocketState(readyState === ReadyState.OPEN)
  }, [readyState])

  // Run when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    setIsLoading(false);
    console.log(lastJsonMessage?.languageOutput[language])
    setOutput(lastJsonMessage?.languageOutput[language])
  }, [lastJsonMessage])

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

    if(websocketState) {
      setIsLoading(true);
      setOutput([]);
      sendJsonMessage(message)
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
          setIsLoading={setIsLoading}
        />
      </HStack>
    </Box>
  );
};

export default CodeEditor;
