import { api } from "../../convex/_generated/api"; 
import { useMutation } from "convex/react";
import { randomBytes } from 'crypto';
import {AttendanceSession} from "@/lib/types"

const useCreateSession = () => {
        const create = useMutation(api.classSessions.create);
                 const generateSecureToken = (length = 32): string=> {
                return randomBytes(length).toString('hex');
}
        const CreateSession = async (session: Omit<AttendanceSession, "_id" | "_creationTime"|"sessionId">) =>{
                try{

                const res = await create(session);
                 if(!res.success){
                        return { success: false, message: res.message , status: 400 };
                }
                return { success: true, message:res.message ,  status: 200, };
                }catch(error){
                        return  { success: false, message: error as string , status: 500 };
                        
                }
        }
        return { CreateSession };
 }
 export default useCreateSession;