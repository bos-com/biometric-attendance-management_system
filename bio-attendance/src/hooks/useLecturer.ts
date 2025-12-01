import { api } from "../../convex/_generated/api"; 
import { useAction, useMutation, useQuery } from "convex/react";
import bcrypt from "bcryptjs";
import { createLecturer } from "@/convex/lecturers";
interface user {
        staffId: string,
        email: string,
        password: string,
        phoneNumber?: string,
        fullName: string,
}
interface res {
        success: boolean;
        message: string;
        status: number;
        user?: {
                _id: string,
                 fullName: string,
                    email: string,
                    passwordHash: string,
                    staffId?: string,
                }|null;
        }     
const useLecturer = () => {
        const create = useMutation(api.lecturers.createLecturer);
         const auth = useAction(api.lecturers.AuthenticateUser);

        const createLecturer = async (User:user,) =>{
                try{
                // const token = generateSecureToken();
                  const passwordHash = await bcrypt.hash(User.password, 10);
                const res = await create({
                        ...User,
                        password: passwordHash,
                }
                );
                 if(!res.success){
                        return { success: false, message: res.message , status: 400 };
                }

                return { success: true, message:res.message ,  status: 200, };
                }catch(error){
                        return  { success: false, message: error as string , status: 500 };
                        
                }
        }

        const authLecturer = async (email:string,password:string):Promise<res|null> =>{
                try {
                        const result = await auth({ email, password });
                        if (!result) {
                                return null;
                        }
                        if (!result.success) {
                                return { success: false, message: result.message, status: result.status };
                        }
                        return { success: true, message: result.message, status: result.status, user: result.user };
                } catch (error) {
                        return { success: false, message: String(error), status: 500 };
                }
        }
        return { createLecturer, authLecturer };
 }
 export default useLecturer;