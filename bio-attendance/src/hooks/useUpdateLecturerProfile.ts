import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function useUpdateLecturerProfile() {
  const updateProfile = useMutation(api.lecturers.updateProfile);
  const changePassword = useMutation(api.lecturers.changePassword);

  const UpdateProfile = async (
    lecturerId: Id<"lecturers">,
    data: {
      fullName?: string;
      email?: string;
      staffId?: string;
    }
  ) => {
    try {
      const result = await updateProfile({
        lecturerId,
        ...data,
      });
      return { success: true, message: result.message };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  };

  const ChangePassword = async (
    lecturerId: Id<"lecturers">,
    newPassword: string
  ) => {
    try {
      const result = await changePassword({
        lecturerId,
        newPassword,
      });
      return { success: true, message: result.message };
    } catch (error) {
      console.error("Error changing password:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to change password",
      };
    }
  };

  return { UpdateProfile, ChangePassword };
}
