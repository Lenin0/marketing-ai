export interface ImageOptions {
    size?: "1024x1024" | "1792x1024" | "1024x1792";
    quality?: "standard" | "hd";
    style?: "natural" | "vivid";
    model?: string;
  }
  
  export interface IImageProvider {
    generateImage(prompt: string, options?: ImageOptions): Promise<string>;
  }