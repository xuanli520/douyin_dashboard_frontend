declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

interface AliyunCaptchaInstance {
  show: () => void;
  hide?: () => void;
  reset?: () => void;
}

interface Window {
  initAliyunCaptcha: (
    config: {
      SceneId: string;
      prefix: string;
      mode: 'popup' | 'embed';
      element: string;
      button?: string;
      immediate?: boolean;
      region?: string;
      lang?: string;
      slideStyle?: { width: number; height: number };
      success?: (captchaVerifyParam: string) => void;
      fail?: () => void;
      getInstance?: (instance: AliyunCaptchaInstance) => void;
    }
  ) => void;
  AliyunCaptchaConfig: {
    region: string;
    prefix: string;
  };
}
