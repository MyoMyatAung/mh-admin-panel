import React from "react";
import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";

interface FileDropzoneProps {
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  title: string;
  supportFormats: string;
  files?: any[];
  fileType: string;
  moveFile: (fromIndex: number, toIndex: number) => void;
  handleRemoveFile: (file: any) => void;
  handleVideoClick: (videoUrl: string) => void;
  handleImgClick: (imgUrl: string) => void;
  FilePreview: React.ComponentType<any>;
  className?: string;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  getRootProps,
  getInputProps,
  title,
  supportFormats,
  files = [],
  fileType,
  moveFile,
  handleRemoveFile,
  handleVideoClick,
  handleImgClick,
  FilePreview,
  className,
}) => {
  return (
    <div className={className}>
      <div>
        <p className="my-2">{title}</p>
        <p className="support">{supportFormats}</p>
      </div>
      <div className={`${files.length > 0 ? "mt-5" : ""} preview-container`}>
        <div {...getRootProps()} className={`${files.length > 0 ? "" : "mt-5"} dropzone`}>
          <div className="flex items-center justify-center">
            <input {...getInputProps()} />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <path
                d="M12.0498 6.05005H7.5498V1.55005C7.5498 1.35114 7.47079 1.16037 7.33013 1.01972C7.18948 0.879067 6.99872 0.800049 6.7998 0.800049C6.60089 0.800049 6.41013 0.879067 6.26947 1.01972C6.12882 1.16037 6.0498 1.35114 6.0498 1.55005V6.05005H1.5498C1.35089 6.05005 1.16013 6.12907 1.01947 6.26972C0.878822 6.41037 0.799805 6.60114 0.799805 6.80005C0.799805 6.99896 0.878822 7.18973 1.01947 7.33038C1.16013 7.47103 1.35089 7.55005 1.5498 7.55005H6.0498V12.05C6.0498 12.249 6.12882 12.4397 6.26947 12.5804C6.41013 12.721 6.60089 12.8 6.7998 12.8C6.99872 12.8 7.18948 12.721 7.33013 12.5804C7.47079 12.4397 7.5498 12.249 7.5498 12.05V7.55005H12.0498C12.2487 7.55005 12.4395 7.47103 12.5801 7.33038C12.7208 7.18973 12.7998 6.99896 12.7998 6.80005C12.7998 6.60114 12.7208 6.41037 12.5801 6.26972C12.4395 6.12907 12.2487 6.05005 12.0498 6.05005Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        {files.map((file, index) => (
          <FilePreview
            key={index}
            file={file?.resourceURL ? file : file?.image || file?.video}
            index={index}
            moveFile={moveFile}
            onRemove={handleRemoveFile}
            type={fileType}
            handleVideoClick={handleVideoClick}
            handleImgClick={handleImgClick}
          />
        ))}
      </div>
    </div>
  );
};

export default FileDropzone;
