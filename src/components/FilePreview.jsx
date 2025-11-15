import { useDrag, useDrop } from "react-dnd";
import { useGetConfigQuery } from "../services/postApi";
import { md5 } from "js-md5"; // Ensure you have js-md5 installed: npm install js-md5

const FilePreview = ({
  file,
  index,
  moveFile,
  onRemove,
  type,
  handleVideoClick,
  handleImgClick,
}) => {
  const { data: config } = useGetConfigQuery();
  const [, ref] = useDrag({
    type: "FILE",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "FILE",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveFile(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  /**
   * 生成金山云 CDN 鉴权 URL (React 版本)
   *
   * @param {string} baseUrl - 例如 http://ksyun.cdn.com
   * @param {string} path - 例如 /home/test.dat
   * @param {string} secret - 主或备秘钥
   * @param {number} [expireIn=300] - 有效期（秒），默认 300 秒
   * @param {number} [type=1] - 鉴权类型（1 或 2）
   * @returns {string}
   */
  function generateKsCdnAuthUrl(
    baseUrl,
    path,
    secret,
    expireIn = 3600,
    type = 1
  ) {
    const timestamp = Math.floor(Date.now() / 1000) + expireIn;

    const normalizedPath = "/" + path.replace(/^\/+/, "");
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
    const sign = md5(secret + normalizedPath + timestamp);

    if (type === 1) {
      return `${normalizedBaseUrl}${normalizedPath}?t=${timestamp}&k=${sign}`;
    } else {
      return `${normalizedBaseUrl}/${sign}/${timestamp}${normalizedPath}`;
    }
  }

  const urlMain =
    type === "image" || type === "gif"
      ? `${config?.data?.post_image_url}${file?.resourceURL}`
      : type === "video"
      ? `${config?.data?.post_public_url}${file?.resourceURL}`
      : "";

  let a = config?.data?.post_image_url;

  let b = file?.resourceURL;
  let cdnUrl = "";
  if (a && b) {
    cdnUrl = generateKsCdnAuthUrl(
      a,
      b,
      config?.data?.social_cdn_secret,
      config?.data?.social_cdn_expire,
      config?.data?.social_cdn_type
    );
  }

  let previewUrl = "";

  if (type === "image" || type === "gif") {
    previewUrl =
      file?.resourceURL && file?.resourceURL.includes("https://")
        ? file?.resourceURL
        : file?.resourceURL
        ? urlMain
        : URL.createObjectURL(file);
  } else if (type === "video") {
    previewUrl =
      file?.resourceURL && file?.resourceURL.includes("https://")
        ? cdnUrl
        : file?.resourceURL
        ? cdnUrl
        : URL.createObjectURL(file);
  }

  return (
    <div ref={(node) => ref(drop(node))} className="preview-item">
      {type === "image" || type === "gif" ? (
        <img
          src={previewUrl}
          alt="preview"
          className="preview-image"
          onClick={() => handleImgClick(previewUrl)}
        />
      ) : (
        <video
          src={previewUrl}
          className="preview-video"
          onClick={() => handleVideoClick(previewUrl)}
        />
      )}
      <button onClick={() => onRemove(file)} className="remove-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M9.24264 8.18191L6.06066 4.99993L9.24264 1.81795C9.38329 1.6773 9.46231 1.48653 9.46231 1.28762C9.46231 1.08871 9.38329 0.897941 9.24264 0.757289C9.10199 0.616637 8.91122 0.537619 8.71231 0.53762C8.5134 0.537619 8.32263 0.616637 8.18198 0.757289L5 3.93927L1.81802 0.757289C1.67737 0.616637 1.4866 0.537619 1.28769 0.53762C1.08878 0.537619 0.898012 0.616637 0.757359 0.757289C0.616707 0.897941 0.53769 1.08871 0.53769 1.28762C0.53769 1.48653 0.616707 1.6773 0.757359 1.81795L3.93934 4.99993L0.757359 8.18191C0.616707 8.32256 0.537689 8.51333 0.537689 8.71224C0.537689 8.91115 0.616707 9.10192 0.757359 9.24257C0.898012 9.38322 1.08878 9.46224 1.28769 9.46224C1.4866 9.46224 1.67737 9.38322 1.81802 9.24257L5 6.06059L8.18198 9.24257C8.32263 9.38322 8.5134 9.46224 8.71231 9.46224C8.91122 9.46224 9.10199 9.38322 9.24264 9.24257C9.38329 9.10192 9.46231 8.91115 9.46231 8.71224C9.46231 8.51333 9.38329 8.32256 9.24264 8.18191Z"
            fill="white"
          />
        </svg>
      </button>
    </div>
  );
};

export default FilePreview;
