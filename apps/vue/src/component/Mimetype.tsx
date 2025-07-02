export function MimetypeIcon({ mimetype }: { mimetype: string }) {
  // https://www.iana.org/assignments/media-types/media-types.xhtml
  if (mimetype.startsWith('application')) {
    switch (mimetype) {
      // cSpell:ignore msword openxmlformats officedocument wordprocessingml spreadsheetml presentationml
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'icon-[vscode-icons--file-type-word]';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'icon-[vscode-icons--file-type-excel]';
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'icon-[vscode-icons--file-type-powerpoint]';
      case 'application/pdf':
        return 'icon-[vscode-icons--file-type-pdf2]';
      case 'application/zip':
      case 'application/x-zip-compressed':
        return 'icon-[vscode-icons--file-type-zip]';
      default:
        return 'icon-[vscode-icons--default-file]';
    }
  } else if (mimetype.startsWith('audio')) {
    return 'icon-[vscode-icons--file-type-audio]';
  } else if (mimetype.startsWith('example')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('font')) {
    return 'icon-[vscode-icons--file-type-font]';
  } else if (mimetype.startsWith('haptics')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('image')) {
    return 'icon-[vscode-icons--file-type-image]';
  } else if (mimetype.startsWith('message')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('model')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('multipart')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('text')) {
    return 'icon-[vscode-icons--file-type-text]';
  } else if (mimetype.startsWith('video')) {
    return 'icon-[vscode-icons--file-type-video]';
  } else {
    return 'icon-[vscode-icons--default-file]';
  }
}

export type MimetypePreviewProps = {
  file_id: string;
  mimetype: string;
};

export function MimetypePreview({ file_id, mimetype }: MimetypePreviewProps) {
  if (mimetype.startsWith('application')) {
    return <></>;
  } else if (mimetype.startsWith('audio')) {
    return (
      <audio
        controls
        src={`${import.meta.env.BASE_URL}api/file/download/single/${file_id}`}
      ></audio>
    );
  } else if (mimetype.startsWith('image')) {
    return <img src={`${import.meta.env.BASE_URL}api/file/download/single/${file_id}`} />;
  } else if (mimetype.startsWith('video')) {
    return (
      <video controls>
        <source
          src={`${import.meta.env.BASE_URL}api/file/download/single/${file_id}`}
          type={mimetype}
        />
      </video>
    );
  } else {
    return <></>;
  }
}
