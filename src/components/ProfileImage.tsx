import { useState, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { uploadProfileImage, deleteProfileImage } from "../api/imageApi";

interface ProfileImageProps {
  agentId: string | undefined;
  profileImageId: string | undefined; // Changed from string to string | undefined
  profileImageUrl: string | null;
  defaultImage: string;
  onImageChange: (profileImageId: string, url: string) => void;
}

export default function ProfileImage({
  agentId,
  profileImageId,
  profileImageUrl,
  defaultImage,
  onImageChange,
}: ProfileImageProps) {
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && agentId) {
      setIsImageLoading(true);
      try {
        const result = await uploadProfileImage(agentId, file);
        onImageChange(result.profileImageId, result.url);
        toast.success("Image Uploaded", {
          description: "Profile image updated successfully.",
          duration: 3000,
        });
      } catch (error: any) {
        toast.error("Upload Failed", {
          description: "Failed to upload image.",
          duration: 3000,
        });
      } finally {
        setIsImageLoading(false);
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!agentId || !profileImageId) return;
    setIsImageLoading(true);
    try {
      await deleteProfileImage(agentId);
      onImageChange("", defaultImage);
      toast.success("Image Deleted", {
        description: "Profile image removed successfully.",
        duration: 3000,
      });
    } catch (error: any) {
      toast.error("Delete Failed", {
        description: "Failed to delete image.",
        duration: 3000,
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  return (
    <div className="relative w-32 h-32 group">
      <img
        src={profileImageUrl || defaultImage}
        alt="Agent Profile"
        className="w-full h-full object-cover rounded-full border-2 border-[#494848]"
      />
      {isImageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <FontAwesomeIcon icon={faSpinner} className="text-white text-2xl animate-spin" />
        </div>
      )}
      <div className="absolute inset-0 flex items-end justify-center gap-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <label
          htmlFor="profileImage"
          className="cursor-pointer bg-[#6a94f0] text-black py-1 px-2 rounded-full hover:bg-[#8faef0] transition-all duration-400 flex items-center gap-1 text-sm"
        >
          <FontAwesomeIcon icon={faUpload} />
          {profileImageUrl ? "Replace" : "Upload"}
        </label>
        <input
          id="profileImage"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isImageLoading}
        />
        {profileImageId && (
          <button
            type="button"
            onClick={handleDeleteImage}
            className="bg-red-600 text-white py-1 px-2 rounded-full hover:bg-red-700 transition-all duration-400 flex items-center gap-1 text-sm"
            disabled={isImageLoading}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}