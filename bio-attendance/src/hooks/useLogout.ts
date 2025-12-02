import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api"; 
import {useMutation, } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

const useLogout = () => {
        const router = useRouter();
        const deleteSession = useMutation(api.lecturers.signOut);
   const LogOut = async (lecturerId:string)=>{
                try {
                        const response = await fetch('/api/logout', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                        });
                        if (!response.ok) {
                                 
                                throw new Error('Failed to delete session');
                        }
                        await deleteSession({lecturerId:lecturerId as Id<"lecturers">});
                        router.replace("/signin");     // avoid adding history entry
                        router.refresh();   // force a full page reload
                } catch (error) {
                        console.error('Error during session deletion:', error);
                }
        }
        
  return {
    LogOut
  };
};

export default useLogout;