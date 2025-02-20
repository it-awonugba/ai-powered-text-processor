interface AI {
  languageDetector: {
    capabilities: () => Promise<{ available: "no" | "readily" }>;
    create: () => Promise<{
      detect: (text: string) => Promise<{ detectedLanguage: string }[]>;
      ready: Promise<void>;
    }>;
  };
  translator: {
    capabilities: () => Promise<{
      available: "no" | "readily";
      languagePairAvailable: (
        source: string,
        target: string
      ) => "no" | "readily";
    }>;
    create: (options: {
      sourceLanguage: string;
      targetLanguage: string;
    }) => Promise<{
      translate: (text: string) => Promise<string>;
      ready: Promise<void>;
    }>;
  };
  summarizer: {
    capabilities: () => Promise<{ available: "no" | "readily" }>;
    create: (options: SummarizerOptions) => Promise<{
      summarize: (text: string) => Promise<string>;
      ready: Promise<void>;
    }>;
  };
}

declare const ai: AI;
