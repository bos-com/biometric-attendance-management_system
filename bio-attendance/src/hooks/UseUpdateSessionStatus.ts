import { api } from "../../convex/_generated/api"; 
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

const UseUpdateSessionStatus = () => {
        const updateStatus = useMutation(api.classSessions.setStatus);
        const UpdateSessionStatus = async (sessionId: Id<"attendance_sessions">, status: "scheduled" | "live" | "closed") =>{
                try{

                const res = await updateStatus({ sessionId, status });
                 if(!res.success){
                        return { success: false, message: res.message , status: 400 };
                }
                return { success: true, message:res.message ,  status: 200, };
                }catch(error){
                        return  { success: false, message: error as string , status: 500 };
                        
                }
        }
        return { UpdateSessionStatus };
 }
 export default UseUpdateSessionStatus;