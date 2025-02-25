import { KeyboardEvent, useEffect, useRef, useState } from "react";

import "./EditableFileName.scss";

interface EditableFileNameProps {
  initialName: string;
  isEditing: boolean;
  onFinishEditing: (newName: string) => void;
  onCancel: () => void;
}

export function EditableFileName({
  initialName,
  isEditing,
  onFinishEditing,
  onCancel,
}: EditableFileNameProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select the name without the extension
      const lastDotIndex = initialName.lastIndexOf(".");
      const selectionEnd =
        lastDotIndex === -1 ? initialName.length : lastDotIndex;
      inputRef.current.setSelectionRange(0, selectionEnd);
    }
  }, [isEditing, initialName]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onFinishEditing(name);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    onFinishEditing(name);
  };

  if (!isEditing) {
    return <span className="file-item__name">{name}</span>;
  }

  return (
    <input
      ref={inputRef}
      type="text"
      className="editable-filename"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
}
