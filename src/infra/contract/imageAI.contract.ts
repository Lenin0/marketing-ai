export interface ImageOptions {
    size?: "1024x1024" | "1792x1024" | "1024x1792";
    aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
    quality?: "standard" | "hd";
    style?: "natural" | "vivid";
    model?: string;
  }
  
  export interface IImageProvider {
    generateImage(prompt: string, options?: ImageOptions): Promise<string>;
  }