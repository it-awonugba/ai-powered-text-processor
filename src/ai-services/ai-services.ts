export interface SummarizerOptions {
  type: string;
  format: string;
  length: string;
}
export const detect = async (text: string) => {
  let result;
  if ("ai" in self && "languageDetector" in ai) {
    const capabilities = await ai.languageDetector.capabilities();
    const isDetectCapabilityAvailable = capabilities.available;
    let detector;

    if (isDetectCapabilityAvailable === "no") {
      throw new Error(
        "Language Detection API is not supported in this browser."
      );
    }
    if (isDetectCapabilityAvailable === "readily") {
      detector = await ai.languageDetector.create();
      result = await detector.detect(text);
    } else {
      detector = await ai.languageDetector.create();
      await detector.ready;
      result = await detector.detect(text);
    }
  } else {
    throw new Error("Language Detection API is not supported in this browser.");
  }
  return result[0].detectedLanguage;
};

export const translate = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
) => {
  if ("ai" in self && "translator" in ai) {
    const capabilities = await ai.translator.capabilities();
    const isTranslationCapable = capabilities.available;
    if (!isTranslationCapable) {
      throw new Error("Translation API is not supported in this browser.");
    }
    const isTranslateCapabilityAvailable = capabilities.languagePairAvailable(
      sourceLanguage,
      targetLanguage
    );
    let translator;
    if (isTranslateCapabilityAvailable === "no") {
      throw new Error("Source and target language pair are not supported yet.");
    }
    if (isTranslateCapabilityAvailable === "readily") {
      translator = await ai.translator.create({
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
      });
      const result = await translator.translate(text);
      return result;
    }
  } else {
    throw new Error("Translation API is not supported in this browser.");
  }
};

export const summarize = async (text: string, options: SummarizerOptions) => {
  if ("ai" in self && "summarizer" in ai) {
    const capabilities = await ai.summarizer.capabilities();
    const isSummarizeCapable = capabilities.available;
    if (isSummarizeCapable === "no") {
      throw new Error("Summarization API is not supported in this browser.");
    }
    if (isSummarizeCapable === "readily") {
      const summarizer = await ai.summarizer.create(options);
      const result = await summarizer.summarize(text);
      return result;
    } else {
      const summarizer = await ai.summarizer.create(options);
      summarizer.addEventListener("downloadprogress", (e) => {
        console.log(e.loaded, e.total);
      });
      await summarizer.ready;
      const result = await summarizer.summarize(text);
      return result;
    }
  } else {
    throw new Error("Summarization API is not supported in this browser.");
  }
};
