import React, { useRef } from "react";

interface UserIframeComponentProps {
  userProvidedHTML: string;
}

export const UserIframeComponent: React.FC<UserIframeComponentProps> = ({
  userProvidedHTML,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div>
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        srcDoc={`${userProvidedHTML}`}
        style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
      />
    </div>
  );
};
