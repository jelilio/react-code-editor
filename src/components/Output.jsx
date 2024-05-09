import { useState } from "react";
import { Box, Button, Text, useToast } from "@chakra-ui/react";

const Output = ({ editorRef, language, compilerOutput, executeCode, isLoading, isError}) => {
  const toast = useToast();

  const runCode = () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      executeCode(language, sourceCode);
    } catch (error) {
      console.log(error);
      toast({
        title: "An error occurred.",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000,
      });
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <Box w="50%">
      <Text mb={2} fontSize="lg">
        Output
      </Text>
      <Button
        variant="outline"
        colorScheme="green"
        mb={4}
        isLoading={isLoading}
        enabled="false"
        onClick={runCode}
      >
        Run Code
      </Button>
      <Box
        height="75vh"
        p={2}
        bg="#181818"
        color={isError ? "red.400" : "#cbcbcb"}
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
      >
        {compilerOutput
          ? compilerOutput.map((line, i) => <Text key={i} style={{whiteSpace: 'break-spaces'}}>{line}</Text>)
          : 'Click "Run Code" to see the output here'}
      </Box>
    </Box>
  );
};
export default Output;
