import React from "react";
import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";

interface ThumbnailDropzoneProps {
  getThumbnailRootProps: () => DropzoneRootProps;
  getThumbnailInputProps: () => DropzoneInputProps;
  thumbnail: File | string | null;
  setThumbnail: (thumbnail: File | null) => void;
}

const ThumbnailDropzone: React.FC<ThumbnailDropzoneProps> = ({ getThumbnailRootProps, getThumbnailInputProps, thumbnail, setThumbnail }) => {
  return (
    <div className="mt-0 max-md:mt-2">
      <div>
        <p className="my-2">Select Thumbnail</p>
        <p className="support">Support format : PNG, JPG</p>
      </div>
      <div className="preview-container">
        <div {...getThumbnailRootProps()} className="mt-5 dropzone">
          <div className="flex items-center justify-center">
            <input {...getThumbnailInputProps()} />
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
        {thumbnail && (
          <>
            <div className="mt-5 thumbnail-preview">
              <img
                src={
                  typeof thumbnail === "string"
                    ? thumbnail
                    : URL.createObjectURL(thumbnail)
                }
                alt="thumbnail preview"
                className="preview-image"
              />
              <button
                onClick={() => setThumbnail(null)}
                className="remove-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <path
                    d="M5 3.88906L8.88906 0L10 1.11094L6.11094 5L10 8.88906L8.88906 10L5 6.11094L1.11094 10L0 8.88906L3.88906 5L0 1.11094L1.11094 0L5 3.88906Z"
                    fill="white"
                    fillOpacity="0.8"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThumbnailDropzone;
