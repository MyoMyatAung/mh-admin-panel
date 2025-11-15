import React from "react";
import FilePreview from "./FilePreview";

const FilePreviewList = React.memo(
  ({
    files,
    fileType,
    moveFile,
    handleRemoveFile,
    handleVideoClick,
    handleImgClick,
  }) => {
    return (
      <>
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
      </>
    );
  },
  (prevProps, nextProps) => {
    // Prevent re-render if files or fileType don't change
    return (
      prevProps.files === nextProps.files &&
      prevProps.fileType === nextProps.fileType &&
      prevProps.moveFile === nextProps.moveFile &&
      prevProps.handleRemoveFile === nextProps.handleRemoveFile &&
      prevProps.handleVideoClick === nextProps.handleVideoClick &&
      prevProps.handleImgClick === nextProps.handleImgClick
    );
  }
);

export default FilePreviewList;
