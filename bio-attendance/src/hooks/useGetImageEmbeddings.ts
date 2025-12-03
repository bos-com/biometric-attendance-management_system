import { useAction,useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const useGetImageEmbeddings = () => {
    const Search = useQuery(api.faces.getFaceEmbeddings); 
    try{
//     const ImageVectorSearch = async(embeddings:number[])=>{
//         return Search
//     }
    return {
      Search
    };
}catch{
console.log("Error while Fetching Searches")
    }
};

export default useGetImageEmbeddings;